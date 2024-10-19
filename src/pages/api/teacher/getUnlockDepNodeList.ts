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
    let availableNodes: any = [];

    // 1. 如果 nodeId 和 parentNodeId 都为空，查找其他 BigCheck 作为解锁依赖
    if (!nodeId && !parentNodeId) {
      availableNodes = await prisma.node.findMany({
        where: {
          nodeType: NodeType.BIGCHECK,
          unlockDependenciesTo: { none: {} }, // 没有其他节点依赖于它
        },
      });
      return res.status(200).json({ data: availableNodes });
    }

    // 2. 如果 parentNodeId 存在且 nodeId 为空，解锁依赖就是父节点
    if (!nodeId && parentNodeId) {
      availableNodes = await prisma.node.findMany({
        where: {
          id: Number(parentNodeId), // 只依赖于父节点
        },
      });
      return res.status(200).json({ data: availableNodes });
    }

    // 3. 如果 nodeId 存在，按照现有的逻辑查找依赖节点
    if (nodeId) {
      const currentNode = await prisma.node.findUnique({
        where: { id: Number(nodeId) },
        select: { id: true, nodeType: true },
      });

      if (!currentNode) {
        return res.status(404).json({ error: "Node not found" });
      }

      // 规则 1: BigCheck 类型节点
      if (currentNode.nodeType === NodeType.BIGCHECK) {
        availableNodes = await prisma.node.findMany({
          where: {
            nodeType: NodeType.MAJOR_NODE,
            unlockDependenciesTo: {
              none: {
                fromNode: { nodeType: NodeType.BIGCHECK },
              },
            },
          },
        });
      }

      // 规则 2: MajorNode 类型节点
      else if (currentNode.nodeType === NodeType.MAJOR_NODE) {
        availableNodes = await prisma.node.findMany({
          where: {
            nodeType: NodeType.MINOR_NODE,
            unlockDependenciesTo: {
              none: {
                fromNode: {
                  nodeType: {
                    in: [NodeType.MAJOR_NODE, NodeType.MINOR_NODE],
                  },
                },
              },
            },
          },
        });
      }

      // 规则 3: MinorNode 类型节点
      else if (currentNode.nodeType === NodeType.MINOR_NODE) {
        availableNodes = await prisma.node.findMany({
          where: {
            nodeType: NodeType.MINOR_NODE,
            unlockDependenciesTo: {
              none: {
                fromNode: {
                  nodeType: {
                    in: [NodeType.MAJOR_NODE, NodeType.MINOR_NODE],
                  },
                },
              },
            },
          },
        });
      }
    }

    res.status(200).json({ data: availableNodes });
  } catch (error) {
    res.status(500).json({
      error: `Failed to fetch unlock dependency nodes: ${error}`,
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
