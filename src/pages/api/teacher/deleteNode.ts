import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { createRouter } from "next-connect"; // 使用 createRouter 替代 nextConnect

const prisma = new PrismaClient();

// 创建 API 路由
const router = createRouter<NextApiRequest, NextApiResponse>();

// DELETE 请求处理逻辑，删除节点
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
      return res.status(403).json({ error: "Only teachers can delete nodes." });
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
      return res
        .status(403)
        .json({ error: "You do not have permission to delete this node." });
    }

    // 3. 检查该节点是否被任何学生使用
    const progressRecords = await prisma.courseProgress.findMany({
      where: { nodeId: Number(nodeId) },
    });

    if (progressRecords.length > 0) {
      return res.status(400).json({
        error:
          "This node cannot be deleted as it is being used in students' progress.",
      });
    }

    // 4. 如果可以删除节点，删除该节点
    await prisma.node.delete({
      where: { id: Number(nodeId) },
    });

    res
      .status(200)
      .json({ success: true, message: "Node deleted successfully" });
  } catch (error) {
    console.error("Error deleting node:", error);
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
