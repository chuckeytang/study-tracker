import { createRouter } from "next-connect";
import { authMiddleware } from "@/utils/auth";
import { ExtendedNextApiRequest } from "@/types/ExtendedNextApiRequest";
import { NextApiResponse } from "next";

import prisma from "@/lib/prisma";

const router = createRouter<ExtendedNextApiRequest, NextApiResponse>();

// 使用 authMiddleware 中间件，确保请求已通过鉴权
router.use(authMiddleware);

router.delete(async (req: ExtendedNextApiRequest, res: NextApiResponse) => {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { ids } = req.body;

  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ message: "Invalid or missing 'ids' array" });
  }

  try {
    // 1. 删除与这些用户相关的课程进度记录
    await prisma.courseProgress.deleteMany({
      where: { userId: { in: ids.map((id: number) => Number(id)) } },
    });

    // 2. 删除与这些用户相关的课程关联记录
    await prisma.userCourse.deleteMany({
      where: { userId: { in: ids.map((id: number) => Number(id)) } },
    });

    // 3. 批量删除用户记录
    const deletedUsers = await prisma.user.deleteMany({
      where: { id: { in: ids.map((id: number) => Number(id)) } },
    });

    res.status(200).json(deletedUsers);
  } catch (error) {
    console.error("Failed to delete users:", error);
    res.status(500).json({ message: `Failed to delete users: ${error}` });
  }
});

// 错误处理
export default router.handler({
  onError: (err, req, res) => {
    console.error("Error:", err);
    res.status(500).json({ message: `An error occurred: ${err}` });
  },
  onNoMatch: (req, res) => {
    res.status(405).json({ message: `Method '${req.method}' Not Allowed` });
  },
});
