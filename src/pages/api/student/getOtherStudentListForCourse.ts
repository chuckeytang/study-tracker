import { NextApiRequest, NextApiResponse } from "next";

import { createRouter } from "next-connect"; // 使用 next-connect 路由
import { authMiddleware } from "@/utils/auth";
import { ExtendedNextApiRequest } from "@/types/ExtendedNextApiRequest";

import prisma from "@/lib/prisma";

// 使用 createRouter 创建 API 路由
const router = createRouter<ExtendedNextApiRequest, NextApiResponse>();

// 使用 authMiddleware 确保已登录的用户
router.use(authMiddleware);

// GET 请求处理逻辑，获取除自己外的其他选修本门课程的学生列表
router.get(async (req: ExtendedNextApiRequest, res: NextApiResponse) => {
  const { user } = req; // 获取当前用户
  const { courseId } = req.query; // 从查询参数中获取 courseId
  const currentUserId = user?.id;

  try {
    if (!courseId) {
      return res.status(400).json({ message: "courseId is required" });
    }

    // 查询所有选修该课程的用户，并排除当前用户
    const otherStudents = await prisma.user.findMany({
      where: {
        id: { not: currentUserId }, // 排除自己
        role: "STUDENT",
        selectedCourses: {
          some: {
            courseId: Number(courseId), // 仅包含已选修该课程的学生
          },
        },
      },
      select: {
        id: true,
        name: true,
        avartarPicUrl: true, // 获取头像信息
        email: true,
        skillPt: true, // 技能点
      },
    });

    // 返回除自己外的学生列表
    res.status(200).json({ students: otherStudents });
  } catch (error) {
    console.error("Failed to fetch other students:", error);
    res.status(500).json({ message: "Failed to fetch other students" });
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
