import { NextApiRequest, NextApiResponse } from "next";

import { upload } from "@/lib/middleware/multer";
import { authMiddleware } from "@/utils/auth";
import { createRouter } from "next-connect";
import { ExtendedNextApiRequest } from "@/types/ExtendedNextApiRequest";
import { AppError } from "@/types/AppError";
import { runMiddleware } from "@/lib/middleware/runMiddleware";

import prisma from "@/lib/prisma";

// 使用 createRouter 创建 API 路由
const router = createRouter<ExtendedNextApiRequest, NextApiResponse>();

// 使用 authMiddleware 确保用户已通过身份验证
router.use(authMiddleware);

router.post(async (req: ExtendedNextApiRequest, res: NextApiResponse) => {
  try {
    // 手动运行 multer 中间件
    await runMiddleware(req, res, upload.single("icon"));

    const { name, description } = req.body;
    const file = req.file;
    const { user } = req; // 获取经过身份验证的用户信息

    const host = req.headers.host || process.env.NEXT_PUBLIC_BASE_URL;
    const protocol = req.headers["x-forwarded-proto"] || "http";
    let iconUrl;

    if (file) {
      // 使用 API 路由提供图片
      iconUrl = `${protocol}://${host}/api/uploads/${file.filename}`;
    }

    // 创建新课程
    const newCourse = await prisma.course.create({
      data: {
        name,
        description,
        iconUrl, // 保存上传的图片URL
      },
    });

    // 将课程与用户（如教师）关联
    await prisma.userCourse.create({
      data: {
        userId: user.id, // 使用当前登录用户的 ID
        courseId: newCourse.id, // 新创建的课程的 ID
      },
    });

    res.status(201).json(newCourse);
  } catch (error) {
    res.status(500).json({ message: `Failed to create course: ${error}` });
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

export const config = {
  api: {
    bodyParser: false, // 禁用默认 body 解析
  },
};
