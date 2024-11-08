import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, NodeType } from "@prisma/client";
import { createRouter } from "next-connect"; // 使用 createRouter 替代 nextConnect
import { ExtendedNextApiRequest } from "@/types/ExtendedNextApiRequest";
import { authMiddleware } from "@/utils/auth";

import prisma from "@/lib/prisma";

// 创建 API 路由
const router = createRouter<ExtendedNextApiRequest, NextApiResponse>();

// 使用 authMiddleware 中间件，确保请求已通过鉴权
router.use(authMiddleware);

// DELETE 请求处理逻辑，删除 BigCheck 节点的相关依赖关系
router.delete(async (req: NextApiRequest, res: NextApiResponse) => {
  const { bigCheckNodeId } = req.body;

  if (!bigCheckNodeId) {
    return res.status(400).json({ message: "bigCheckNodeId is required" });
  }

  try {
    // 删除与该 BigCheck 节点相关的其他 BigCheck 节点之间的 fromNodeId 和 toNodeId 依赖关系
    const deletedUnlockDependencies = await prisma.unlockDependency.deleteMany({
      where: {
        OR: [
          {
            fromNodeId: Number(bigCheckNodeId),
            toNode: { nodeType: NodeType.BIGCHECK }, // 只删除依赖 BigCheck 类型节点的
          },
          {
            toNodeId: Number(bigCheckNodeId),
            fromNode: { nodeType: NodeType.BIGCHECK }, // 只删除依赖 BigCheck 类型节点的
          },
        ],
      },
    });

    const deletedLockDependencies = await prisma.lockDependency.deleteMany({
      where: {
        OR: [
          {
            fromNodeId: Number(bigCheckNodeId),
            toNode: { nodeType: NodeType.BIGCHECK }, // 只删除依赖 BigCheck 类型节点的
          },
          {
            toNodeId: Number(bigCheckNodeId),
            fromNode: { nodeType: NodeType.BIGCHECK }, // 只删除依赖 BigCheck 类型节点的
          },
        ],
      },
    });

    // 更新 BigCheck 节点的 unlockDepNodeCount 和 lockDepNodeCount 为 0
    const updatedNode = await prisma.node.update({
      where: { id: Number(bigCheckNodeId) },
      data: {
        unlockDepNodeCount: 0,
        unlockDepClusterTotalSkillPt: 0,
        lockDepNodeCount: 0,
      },
    });

    // 如果没有删除到任何依赖关系，返回相应的消息
    if (
      deletedUnlockDependencies.count === 0 &&
      deletedLockDependencies.count === 0
    ) {
      return res.status(404).json({
        error: "No dependencies found for the specified BigCheck node.",
      });
    }

    res.status(200).json({
      success: true,
      message: "BigCheck node dependencies disconnected successfully",
    });
  } catch (error) {
    console.error("Error disconnecting BigCheck node dependencies:", error);
    res.status(500).json({ message: "An unexpected error occurred" });
  }
});

// 在 handler 中添加错误处理
export default router.handler({
  onError: (err: unknown, req, res) => {
    console.error(err);
    res.status(500).json({ message: "An unexpected error occurred" });
  },
  onNoMatch: (req, res) => {
    res.status(405).json({ message: `Method '${req.method}' Not Allowed` });
  },
});
