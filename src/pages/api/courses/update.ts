import { NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { upload } from "@/lib/middleware/multer";
import { createRouter } from "next-connect";
import { ExtendedNextApiRequest } from "@/types/ExtendedNextApiRequest";
import { AppError } from "@/types/AppError";
import { runMiddleware } from "@/lib/middleware/runMiddleware";
import { authMiddleware } from "@/utils/auth";

const prisma = new PrismaClient();

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

    let iconUrl;

    // 如果有文件上传，更新 iconUrl
    if (file) {
      iconUrl = `/uploads/${file.filename}`;
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
    res.status(500).json({ error: `Failed to update course: ${error}` });
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
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

export const config = {
  api: {
    bodyParser: false, // 禁用默认 body 解析
  },
};
