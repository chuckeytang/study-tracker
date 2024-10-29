import { PrismaClient } from "@prisma/client";
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
  const { nodeId } = req.query;

  if (!nodeId) {
    return res.status(400).json({ message: "nodeId is required" });
  }

  try {
    // 查询与 bigcheck 节点相关联的 majornode 和 minornode，通过 UnlockDependency 表
    const clusterNodes = await prisma.node.findMany({
      where: {
        unlockDependenciesTo: {
          some: {
            fromNodeId: Number(nodeId), // 查询解锁依赖该 bigcheck 节点的 majornode 和 minornode
          },
        },
      },
    });

    // 返回数据
    res.status(200).json({
      data: clusterNodes.map((node) => ({
        nodeId: node.id,
        nodeName: node.name,
        nodeDescription: node.description,
        nodeType: node.nodeType, // 可以是 MAJOR_NODE 或 MINOR_NODE
        maxLevel: node.maxLevel,
        picUrl: node.iconUrl,
      })),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Failed to fetch cluster nodes: ${error}` });
  }
});

// 错误处理
export default router.handler({
  onError: (err, req, res) => {
    res.status(500).json({ message: `An error occurred: ${err}` });
  },
  onNoMatch: (req, res) => {
    res.status(405).json({ message: `Method '${req.method}' Not Allowed` });
  },
});
