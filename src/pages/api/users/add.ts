import { NextApiRequest, NextApiResponse } from "next";

import { authMiddleware } from "@/utils/auth";
import { upload } from "@/lib/middleware/multer";
import { createRouter } from "next-connect";
import { ExtendedNextApiRequest } from "@/types/ExtendedNextApiRequest";
import { AppError } from "@/types/AppError";
import { runMiddleware } from "@/lib/middleware/runMiddleware";
import bcrypt from "bcryptjs";

import prisma from "@/lib/prisma";

// 使用 createRouter 创建 API 路由
const router = createRouter<ExtendedNextApiRequest, NextApiResponse>();

router.use(authMiddleware);

// POST 请求处理逻辑
router.post(async (req: ExtendedNextApiRequest, res: NextApiResponse) => {
  try {
    // 手动运行 multer 中间件以处理文件上传
    await runMiddleware(req, res, upload.single("avartar"));

    const { name, email, role, password, skillPt, experience, experienceLevel, rewardPoints } = req.body;
    const file = req.file;

    const host = req.headers.host || process.env.NEXT_PUBLIC_BASE_URL;
    const protocol = req.headers["x-forwarded-proto"] || "http";
    let avartarPicUrl;

    if (file) {
      // 使用 API 路由提供图片
      avartarPicUrl = `${protocol}://${host}/api/uploads/${file.filename}`;
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建新用户
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        role,
        password: hashedPassword,
        skillPt: Number(skillPt) || 0,
        experience: Number(experience) || 0,
        experienceLevel: Number(experienceLevel) || 1,
        rewardPoints: Number(rewardPoints) || 0,
        ...(avartarPicUrl && { avartarPicUrl }), // 如果有上传文件，保存头像 URL
      },
    });

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: `Failed to create user: ${error}` });
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
    res.status(405).json({ message: `Method '${req.method}' Not Allowed` });
  },
});

export const config = {
  api: {
    bodyParser: false, // 禁用默认 body 解析
  },
};
