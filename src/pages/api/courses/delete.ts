import { PrismaClient } from "@prisma/client";
import { createRouter } from "next-connect";
import { authMiddleware } from "@/utils/auth"; // 引入 authMiddleware
import { ExtendedNextApiRequest } from "@/types/ExtendedNextApiRequest";
import { NextApiResponse } from "next";

const prisma = new PrismaClient();

// 创建 API 路由
const router = createRouter<ExtendedNextApiRequest, NextApiResponse>();

// 使用 authMiddleware 中间件，确保请求已通过鉴权
router.use(authMiddleware);

router.delete(async (req: ExtendedNextApiRequest, res: NextApiResponse) => {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.body; // 从请求体中获取要删除的ID

  try {
    // 使用 Prisma 删除单个课程
    const deletedCourse = await prisma.course.delete({
      where: { id: Number(id) }, // 根据 ID 删除课程
    });

    res.status(200).json(deletedCourse); // 返回删除的记录
  } catch (error) {
    res.status(500).json({ error: `Failed to delete course: ${error}` });
  }
});

// 错误处理
export default router.handler({
  onError: (err, req, res) => {
    res.status(500).json({ error: `An error occurred: ${err}` });
  },
  onNoMatch: (req, res) => {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});
