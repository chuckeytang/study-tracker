import { createRouter } from "next-connect";
import { authMiddleware } from "@/utils/auth";
import { ExtendedNextApiRequest } from "@/types/ExtendedNextApiRequest";
import { NextApiResponse } from "next";
import prisma from "@/lib/prisma";

const router = createRouter<ExtendedNextApiRequest, NextApiResponse>();

router.use(authMiddleware); 

router.post(async (req, res) => {
  try {
    // [*] 从请求体获取要删除的账单 ID
    const { id } = req.body; 
    
    const userId = req.user.id;

    // [+] 执行删除操作
    const deletedExpense = await prisma.expense.delete({
      where: {
        // [!] 关键安全校验：必须同时匹配 id 和 userId
        id: Number(id),
        userId: userId, 
      },
    });

    res.status(200).json({ message: "Successfully deleted", id: deletedExpense.id });
  } catch (error) {
    console.error(error);
    // 如果找不到记录或不属于该用户，Prisma 会抛出错误
    res.status(500).json({ message: `Delete failed: ${error}` });
  }
});

export default router.handler({
  onError: (err, req, res) => {
    console.error(err);
    res.status(500).end("Internal Server Error");
  },
  onNoMatch: (req, res) => {
    res.status(405).end();
  },
});