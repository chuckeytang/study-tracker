import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { createRouter } from "next-connect";

const prisma = new PrismaClient();

// 使用 createRouter 创建 API 路由
const router = createRouter<NextApiRequest, NextApiResponse>();

// 处理 GET 请求
router.get(async (req: NextApiRequest, res: NextApiResponse) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId parameter" });
  }

  try {
    // 查询与该 userId 关联的所有课程
    const studentCourses = await prisma.studentCourse.findMany({
      where: {
        userId: Number(userId),
      },
      include: {
        course: true, // 包含课程详细信息
      },
    });

    // 从查询结果中提取课程信息
    const courses = studentCourses.map((studentCourse) => ({
      id: studentCourse.course.id,
      name: studentCourse.course.name,
      description: studentCourse.course.description,
      iconUrl: studentCourse.course.iconUrl,
      teacherId: studentCourse.course.teacherId,
      createdAt: studentCourse.course.createdAt,
      updatedAt: studentCourse.course.updatedAt,
    }));

    // 返回课程列表
    res.status(200).json({ courses: courses });
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch courses: ${error}` });
  }
});

// 在 handler 中添加错误处理
export default router.handler({
  onError: (err, req, res) => {
    res.status(500).json({ error: `Server error: ${err}` });
  },
  onNoMatch: (req, res) => {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});
