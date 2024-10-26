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

// GET 请求处理逻辑，获取所有角色为 TEACHER 的用户信息
router.get(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // 查询所有教师信息
    const teachers = await prisma.user.findMany({
      where: {
        role: "TEACHER", // 只获取角色为 TEACHER 的用户
      },
      select: {
        id: true,
        name: true,
        avartarPicUrl: true, // 如果用户有头像，返回头像信息
        email: true,
      },
    });

    // 返回教师信息列表
    res.status(200).json({ teachers });
  } catch (error) {
    console.error("Failed to fetch teachers:", error);
    res.status(500).json({ error: "Failed to fetch teachers" });
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
