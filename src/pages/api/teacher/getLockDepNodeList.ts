import { PrismaClient, NodeType } from "@prisma/client";
import { createRouter } from "next-connect";
import { authMiddleware } from "@/utils/auth"; // 引入 authMiddleware
import { ExtendedNextApiRequest } from "@/types/ExtendedNextApiRequest";
import { NextApiResponse } from "next";

const prisma = new PrismaClient();

// 创建 API 路由
const router = createRouter<ExtendedNextApiRequest, NextApiResponse>();

// 使用 authMiddleware 中间件，确保请求已通过鉴权
router.use(authMiddleware);

router.get(async (req: ExtendedNextApiRequest, res: NextApiResponse) => {
  const { nodeId, parentNodeId } = req.query;

  try {
    // 如果nodeId和parentNodeId都为空，表明是创建BigCheck类型节点，返回空数组
    if (!nodeId && !parentNodeId) {
      return res.status(200).json({ data: [] });
    }

    let availableNodes: any = [];

    // 查找当前节点的信息
    if (nodeId) {
      const currentNode = await prisma.node.findUnique({
        where: { id: Number(nodeId) },
        select: { id: true, nodeType: true },
      });

      if (!currentNode) {
        return res.status(404).json({ error: "Node not found" });
      }

      // 规则1: BigCheck节点没有会被锁住的节点
      if (currentNode.nodeType === NodeType.BIGCHECK) {
        availableNodes = [];
      }

      // 规则2: MajorNode解锁后，依赖同一个BigCheck的兄弟MajorNode会被锁住
      else if (currentNode.nodeType === NodeType.MAJOR_NODE) {
        const connectedBigCheck = await prisma.unlockDependency.findFirst({
          where: {
            toNodeId: Number(nodeId),
            fromNode: { nodeType: NodeType.BIGCHECK },
          },
          select: { fromNodeId: true },
        });

        if (connectedBigCheck) {
          availableNodes = await prisma.node.findMany({
            where: {
              nodeType: NodeType.MAJOR_NODE,
              id: { not: Number(nodeId) },
              unlockDependenciesTo: {
                some: {
                  fromNodeId: connectedBigCheck.fromNodeId,
                },
              },
            },
          });
        }
      }

      // 规则3: MinorNode解锁后，依赖同一父节点（MajorNode 或其他 MinorNode）的兄弟 MinorNode 会被锁住
      else if (currentNode.nodeType === NodeType.MINOR_NODE) {
        const parentNode = await prisma.unlockDependency.findFirst({
          where: {
            toNodeId: Number(nodeId),
          },
          select: { fromNodeId: true },
        });

        if (parentNode) {
          availableNodes = await prisma.node.findMany({
            where: {
              nodeType: NodeType.MINOR_NODE,
              id: { not: Number(nodeId) },
              unlockDependenciesTo: {
                some: {
                  fromNodeId: parentNode.fromNodeId,
                },
              },
            },
          });
        }
      }
    }
    // 当 nodeId 未提供，但 parentNodeId 提供时，查找未创建的节点的锁住兄弟节点
    else if (parentNodeId) {
      availableNodes = await prisma.node.findMany({
        where: {
          unlockDependenciesTo: {
            some: { fromNodeId: Number(parentNodeId) },
          },
          nodeType: { not: NodeType.BIGCHECK },
        },
      });
    }

    res.status(200).json({ data: availableNodes });
  } catch (error) {
    res.status(500).json({
      error: `Failed to fetch lock dependency nodes: ${error}`,
    });
  }
});

// 错误处理
export default router.handler({
  onError: (err, req, res) => {
    res.status(500).json({ error: `An error occurred: ${err}` });
  },
  onNoMatch: (req, res) => {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});
