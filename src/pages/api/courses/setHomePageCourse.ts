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
