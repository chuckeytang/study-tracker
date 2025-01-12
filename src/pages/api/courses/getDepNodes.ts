import { createRouter } from "next-connect";
import { authMiddleware } from "@/utils/auth"; // 引入 authMiddleware
import { ExtendedNextApiRequest } from "@/types/ExtendedNextApiRequest";
import { NextApiResponse } from "next";

import prisma from "@/lib/prisma";

// 创建 API 路由
const router = createRouter<ExtendedNextApiRequest, NextApiResponse>();

// 使用 authMiddleware 中间件，确保请求已通过鉴权
router.use(authMiddleware);

router.get(async (req: ExtendedNextApiRequest, res: NextApiResponse) => {
  const { user } = req; // 获取当前用户
  const { nodeId } = req.query;
  const userId = user?.id;
  if (!nodeId || !userId) {
    return res.status(400).json({ message: "nodeId and userId are required" });
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

    // 获取每个节点的 lastUpgradeTime
    const progressData = await prisma.courseProgress.findMany({
      where: {
        nodeId: {
          in: clusterNodes.map((node) => node.id),
        },
        userId: Number(userId),
      },
      select: {
        nodeId: true,
        lastUpgradeTime: true,
      },
    });

    const progressMap = new Map(
      progressData.map((progress) => [progress.nodeId, progress.lastUpgradeTime])
    );

    // 返回数据
    res.status(200).json({
      data: clusterNodes.map((node) => ({
        nodeId: node.id,
        nodeName: node.name,
        nodeDescription: node.description,
        nodeType: node.nodeType, // 可以是 MAJOR_NODE 或 MINOR_NODE
        maxLevel: node.maxLevel,
        picUrl: node.iconUrl,
        coolDown: node.coolDown,
        unlockType: node.unlockType,
        unlockDepTimeInterval: node.unlockDepTimeInterval,
        exp: node.exp,
        rewardPt: node.rewardPt,
        lastUpgradeTime: progressMap.get(node.id) || null, // Include lastUpgradeTime
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
