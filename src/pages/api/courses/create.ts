import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import { createRouter } from "next-connect"; // 使用 createRouter 替代 nextConnect
import path from "path";
import { ExtendedNextApiRequest } from "@/types/ExtendedNextApiRequest";
import { AppError } from "@/types/AppError";

// 设置文件保存路径
const upload = multer({
  storage: multer.diskStorage({
    destination: "./public/uploads",
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  }),
});

// 通用函数：运行中间件
const runMiddleware = (req: NextApiRequest, res: NextApiResponse, fn: any) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

const prisma = new PrismaClient();

// 使用 createRouter 创建 API 路由
const router = createRouter<ExtendedNextApiRequest, NextApiResponse>();

// POST 请求处理逻辑
router.post(async (req: ExtendedNextApiRequest, res: NextApiResponse) => {
  try {
    // 手动运行 multer 中间件
    await runMiddleware(req, res, upload.single("icon"));

    const { name, description, teacherId } = req.body;
    const file = req.file;

    // 生成 iconUrl
    const iconUrl = file ? `/uploads/${file.filename}` : null;

    // 创建新课程
    const newCourse = await prisma.course.create({
      data: {
        name,
        description,
        teacherId: Number(teacherId),
        iconUrl, // 保存上传的图片URL
      },
    });

    res.status(201).json(newCourse);
  } catch (error) {
    res.status(500).json({ error: `Failed to create course: ${error}` });
  }
});

// 在 handler 中添加错误处理
export default router.handler({
  onError: (err: unknown, req, res) => {
    if (err instanceof AppError) {
      // 自定义错误，带有状态码
      console.error(err.stack);
      res.status(err.statusCode).end(err.message);
    } else if (err instanceof Error) {
      // 标准的Error对象，使用500
      console.error(err.stack);
      res.status(500).end("An unexpected error occurred");
    } else {
      // 处理其他类型的未知错误
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
