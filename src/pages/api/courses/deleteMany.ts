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
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { ids } = req.body; // 从请求体中获取要删除的ID数组

  try {
    // 使用 Prisma 批量删除多个课程
    const deletedCourses = await prisma.course.deleteMany({
      where: { id: { in: ids.map((id: number) => Number(id)) } }, // 批量删除ID
    });

    res.status(200).json(deletedCourses); // 返回删除的结果
  } catch (error) {
    res.status(500).json({ message: `Failed to delete courses: ${error}` });
  }
});

// 错误处理
export default router.handler({
  onError: (err, req, res) => {
    res.status(500).json({ message: `An error occurred: ${err}` });
  },
  onNoMatch: (req, res) => {
    res.status(405).json({ message: `Method '${req.method}' Not Allowed` });
  },
});
