import { createRouter } from "next-connect";
import { authMiddleware } from "@/utils/auth"; // 引入 authMiddleware
import { ExtendedNextApiRequest } from "@/types/ExtendedNextApiRequest";
import { NextApiResponse } from "next";

import prisma from "@/lib/prisma";

// 创建 API 路由
const router = createRouter<ExtendedNextApiRequest, NextApiResponse>();

// 使用 authMiddleware 中间件，确保请求已通过鉴权
router.use(authMiddleware);

router.put(async (req: ExtendedNextApiRequest, res: NextApiResponse) => {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { ids, ...data } = req.body; // 从请求体中获取批量更新的IDs和更新数据

  try {
    // 使用 Prisma 批量更新多个课程记录
    const updatedCourses = await prisma.course.updateMany({
      where: { id: { in: ids.map((id: number) => Number(id)) } }, // 批量更新ID
      data, // 更新数据
    });

    res.status(200).json(updatedCourses);
  } catch (error) {
    res.status(500).json({ message: `Failed to update courses: ${error}` });
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
