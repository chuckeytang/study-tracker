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

  try {
    // 删除用户的逻辑
    const deletedUser = await prisma.user.delete({
      where: { id: Number(id) },
    });
    res.status(200).json(deletedUser);
  } catch (error) {
    res.status(500).json({ message: `Failed to delete user: ${error}` });
  }
});

export default router.handler();
