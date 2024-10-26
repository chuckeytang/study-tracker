import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { createRouter } from "next-connect"; // 使用 next-connect 路由
import { ExtendedNextApiRequest } from "@/types/ExtendedNextApiRequest";
import { authMiddleware } from "@/utils/auth";

const prisma = new PrismaClient();

// 使用 createRouter 创建 API 路由
const router = createRouter<ExtendedNextApiRequest, NextApiResponse>();

// 使用 authMiddleware 中间件，确保请求已通过鉴权
router.use(authMiddleware);

// GET 请求处理逻辑，获取课程列表并标记 isLearning
router.get(async (req: ExtendedNextApiRequest, res: NextApiResponse) => {
  const { userId } = req.query; // 从查询参数中获取 userId
  const { user } = req; // 从请求中获取本用户ID参数
  const meId = user?.id;
  const teacherId = userId;

  try {
    if (!teacherId) {
      return res.status(400).json({ error: "teacher's id is required" });
    }

    // 获取所有课程以及选修这些课程的用户
    const courses = await prisma.course.findMany({
      where: {
        enrolledUsers: {
          some: {
            userId: Number(teacherId),
          },
        },
      },
      include: {
        enrolledUsers: {
          select: {
            userId: true, // 仅选择 userId 以检查用户是否已选修课程
          },
        },
      },
    });

    // 构造返回数据，判断是否正在学习课程
    const courseList = courses.map((course) => {
      const isLearning = course.enrolledUsers.some(
        (enrollment) =>
          enrollment.userId === (meId !== Number(teacherId) ? meId : teacherId)
      );
      return {
        id: course.id,
        name: course.name,
        description: course.description,
        iconUrl: course.iconUrl,
        isLearning: isLearning, // 如果 userId 存在于 enrolledUsers 列表中，设置为 true
      };
    });

    // 返回构造后的课程列表
    res.status(200).json({ courses: courseList });
  } catch (error) {
    console.error("Failed to fetch course list:", error);
    res.status(500).json({ error: "Failed to fetch course list" });
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
