import { NextApiResponse } from "next";

import { upload } from "@/lib/middleware/multer";
import { createRouter } from "next-connect";
import { ExtendedNextApiRequest } from "@/types/ExtendedNextApiRequest";
import { AppError } from "@/types/AppError";
import { runMiddleware } from "@/lib/middleware/runMiddleware";
import { authMiddleware } from "@/utils/auth";

import prisma from "@/lib/prisma";

// 使用 createRouter 创建 API 路由
const router = createRouter<ExtendedNextApiRequest, NextApiResponse>();

router.use(authMiddleware);
// PUT 请求处理逻辑
router.put(async (req: ExtendedNextApiRequest, res: NextApiResponse) => {
  try {
    // 手动运行 multer 中间件以处理文件上传
    await runMiddleware(req, res, upload.single("icon"));

    const { id, name, description } = req.body; // 移除 teacherId
    const file = req.file;

    const host = req.headers.host || process.env.NEXT_PUBLIC_BASE_URL;
    const protocol = req.headers["x-forwarded-proto"] || "http";
    let iconUrl;

    if (file) {
      // 使用 API 路由提供图片
      iconUrl = `${protocol}://${host}/api/uploads/${file.filename}`;
    }

    // 更新课程信息
    const updatedCourse = await prisma.course.update({
      where: { id: Number(id) },
      data: {
        name,
        description,
        ...(iconUrl && { iconUrl }), // 如果有上传文件，更新iconUrl
      },
    });

    res.status(200).json(updatedCourse);
  } catch (error) {
    res.status(500).json({ message: `Failed to update course: ${error}` });
  }
});

// 在 handler 中添加错误处理
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
