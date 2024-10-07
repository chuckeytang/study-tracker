import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, NodeType } from "@prisma/client";
import { createRouter } from "next-connect"; // 使用 createRouter 替代 nextConnect

const prisma = new PrismaClient();

// 创建 API 路由
const router = createRouter<NextApiRequest, NextApiResponse>();

// DELETE 请求处理逻辑，删除 BigCheck 节点的相关依赖关系
router.delete(async (req: NextApiRequest, res: NextApiResponse) => {
  const { bigCheckNodeId } = req.body;

  if (!bigCheckNodeId) {
    return res.status(400).json({ error: "bigCheckNodeId is required" });
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
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

// 在 handler 中添加错误处理
export default router.handler({
  onError: (err: unknown, req, res) => {
    console.error(err);
    res.status(500).json({ error: "An unexpected error occurred" });
  },
  onNoMatch: (req, res) => {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});
