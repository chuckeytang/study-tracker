import { NextApiResponse } from "next";
import { createRouter } from "next-connect";
import { ExtendedNextApiRequest } from "@/types/ExtendedNextApiRequest";
import { AppError } from "@/types/AppError";
import { authMiddleware } from "@/utils/auth";
import prisma from "@/lib/prisma";

// 创建带类型的 router
const router = createRouter<ExtendedNextApiRequest, NextApiResponse>();

// 鉴权
router.use(authMiddleware);

// POST /api/courses/setHomePageCourse
router.post(async (req: ExtendedNextApiRequest, res: NextApiResponse) => {
  const { courseId } = req.body;

  if (!courseId) {
    return res.status(400).json({ message: "Missing courseId" });
  }

  try {
    // 检查课程是否已发布
    const course = await prisma.course.findUnique({
      where: { id: Number(courseId) },
      select: { published: true },
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (!course.published) {
      return res.status(400).json({ message: "Course is not published" });
    }

    // 更新事务：取消所有首页标记 + 设置新课程为首页展示
    await prisma.$transaction([
      prisma.course.updateMany({
        data: { inHomePage: false },
      }),
      prisma.course.update({
        where: { id: Number(courseId) },
        data: { inHomePage: true },
      }),
    ]);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Failed to set homepage course:", error);
    res
      .status(500)
      .json({ message: `Failed to update homepage course: ${error}` });
  }
});

// 错误处理
export default router.handler({
  onError: (err: unknown, req, res) => {
    if (err instanceof AppError) {
      console.error(err.stack);
      res.status(err.statusCode).end(err.message);
    } else if (err instanceof Error) {
      console.error(err.stack);
      res.status(500).end("An unexpected error occurred");
    } else {
      res.status(500).end("An unexpected error occurred");
    }
  },
  onNoMatch: (req, res) => {
    res.status(405).json({ message: `Method '${req.method}' Not Allowed` });
  },
});
