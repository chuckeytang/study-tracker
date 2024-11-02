import { createRouter } from "next-connect";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "@/utils/auth";
import { ExtendedNextApiRequest } from "@/types/ExtendedNextApiRequest";
import { NextApiResponse } from "next";

const prisma = new PrismaClient();

const router = createRouter<ExtendedNextApiRequest, NextApiResponse>();

// 使用鉴权中间件，确保用户身份已验证
router.use(authMiddleware);

router.delete(async (req: ExtendedNextApiRequest, res: NextApiResponse) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // 1. 删除用户相关的学习进度记录
    await prisma.courseProgress.deleteMany({
      where: { userId: Number(id) },
    });

    // 2. 删除用户选择的课程记录（包括老师教授的课程记录）
    await prisma.userCourse.deleteMany({
      where: { userId: Number(id) },
    });

    // 3. 删除用户本身记录
    const deletedUser = await prisma.user.delete({
      where: { id: Number(id) },
    });

    res.status(200).json(deletedUser); // 返回删除的记录
  } catch (error) {
    console.error("Failed to delete user:", error);
    res.status(500).json({ message: `Failed to delete user: ${error}` });
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
