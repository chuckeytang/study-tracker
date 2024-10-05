import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { createRouter } from "next-connect"; // 使用 createRouter 替代 nextConnect

const prisma = new PrismaClient();

// 创建 API 路由
const router = createRouter<NextApiRequest, NextApiResponse>();

// DELETE 请求处理逻辑，删除节点依赖关系
router.delete(async (req: NextApiRequest, res: NextApiResponse) => {
  const { userId, nodeId } = req.body;

  try {
    // 1. 验证用户的角色是否为 TEACHER
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: {
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.role !== "TEACHER") {
      return res
        .status(403)
        .json({ error: "Only teachers can delete node dependencies." });
    }

    // 2. 验证该节点是否属于当前用户的课程
    const node = await prisma.node.findUnique({
      where: { id: Number(nodeId) },
      include: {
        course: {
          include: {
            enrolledUsers: {
              where: { userId: Number(userId) }, // 验证该课程是否与用户相关联
            },
          },
        },
      },
    });

    if (!node) {
      return res.status(404).json({ error: "Node not found" });
    }

    // 检查该课程是否与用户相关联
    const isTeacherOfCourse = node.course.enrolledUsers.some(
      (user) => user.userId === Number(userId)
    );

    if (!isTeacherOfCourse) {
      return res.status(403).json({
        error:
          "You do not have permission to delete dependencies for this node.",
      });
    }

    // 3. 查找与该节点有关的所有 UnlockDependency 和 LockDependency 关系
    const unlockDependencies = await prisma.unlockDependency.findMany({
      where: {
        toNodeId: Number(nodeId), // 该节点是解锁的目标节点
      },
    });

    const lockDependencies = await prisma.lockDependency.findMany({
      where: {
        toNodeId: Number(nodeId), // 该节点是锁住的目标节点
      },
    });

    // 4. 删除 UnlockDependency 中的所有依赖关系
    const deletedUnlockDependencies = await prisma.unlockDependency.deleteMany({
      where: {
        fromNodeId: Number(nodeId),
      },
    });

    // 5. 删除 LockDependency 中的所有依赖关系
    const deletedLockDependencies = await prisma.lockDependency.deleteMany({
      where: {
        fromNodeId: Number(nodeId),
      },
    });

    // 如果没有删除到任何依赖关系，返回相应的消息
    if (
      deletedUnlockDependencies.count === 0 &&
      deletedLockDependencies.count === 0
    ) {
      return res
        .status(404)
        .json({ error: "No dependencies found for this node." });
    }

    res.status(200).json({
      success: true,
      message: "Node dependencies deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting node dependencies:", error);
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
