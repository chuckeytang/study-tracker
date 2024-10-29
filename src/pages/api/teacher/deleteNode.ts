import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { createRouter } from "next-connect"; // 使用 createRouter 替代 nextConnect
import { authMiddleware } from "@/utils/auth";
import { ExtendedNextApiRequest } from "@/types/ExtendedNextApiRequest";

const prisma = new PrismaClient();

// 创建 API 路由
const router = createRouter<ExtendedNextApiRequest, NextApiResponse>();

// 使用 authMiddleware 中间件，确保请求已通过鉴权
router.use(authMiddleware);

// 递归删除节点及其子节点依赖关系
async function deleteNodeRecursively(nodeId: number) {
  // 1. 获取所有依赖当前节点的子节点（通过 fromNodeId）
  const childNodes = await prisma.node.findMany({
    where: {
      OR: [
        { unlockDependenciesTo: { some: { fromNodeId: nodeId } } },
        { lockDependenciesTo: { some: { fromNodeId: nodeId } } },
      ],
    },
    select: { id: true, nodeType: true }, // 只选择 id 字段
  });

  // 2. 递归删除所有子节点，排除BIGCHECK节点
  for (const childNode of childNodes) {
    if (childNode.nodeType === "BIGCHECK") {
      continue;
    }
    await deleteNodeRecursively(childNode.id);
  }

  // 3. 删除与此节点相关的所有 UnlockDependency 和 LockDependency 记录
  await prisma.unlockDependency.deleteMany({
    where: {
      OR: [{ fromNodeId: nodeId }, { toNodeId: nodeId }],
    },
  });

  await prisma.lockDependency.deleteMany({
    where: {
      OR: [{ fromNodeId: nodeId }, { toNodeId: nodeId }],
    },
  });

  // 4. 删除当前节点
  await prisma.node.delete({
    where: { id: nodeId },
  });
}

// DELETE 请求处理逻辑
router.delete(async (req: NextApiRequest, res: NextApiResponse) => {
  const { userId, nodeId } = req.body;

  try {
    // 1. 验证用户角色是否为 TEACHER
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { role: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "TEACHER") {
      return res
        .status(403)
        .json({ message: "Only teachers can delete node dependencies." });
    }

    // 2. 验证节点是否属于该用户的课程
    const node = await prisma.node.findUnique({
      where: { id: Number(nodeId) },
      include: {
        course: {
          include: {
            enrolledUsers: {
              where: { userId: Number(userId) },
            },
          },
        },
      },
    });

    if (!node) {
      return res.status(404).json({ message: "Node not found" });
    }

    const isTeacherOfCourse = node.course.enrolledUsers.some(
      (user) => user.userId === Number(userId)
    );

    if (!isTeacherOfCourse) {
      return res.status(403).json({
        error:
          "You do not have permission to delete dependencies for this node.",
      });
    }

    // 3. 递归删除节点及其所有子节点
    await deleteNodeRecursively(Number(nodeId));

    res.status(200).json({
      success: true,
      message: "Node and its dependencies deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting node dependencies:", error);
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
