// src/pages/api/expenses/update.ts
import { createRouter } from "next-connect";
import { NextApiResponse } from "next";
import { ExtendedNextApiRequest } from "@/types/ExtendedNextApiRequest";
import prisma from "@/lib/prisma";
import { authMiddleware } from "@/utils/auth";

const router = createRouter<ExtendedNextApiRequest, NextApiResponse>();
router.use(authMiddleware);

router.post(async (req, res) => {
  try {
    const { id, amount, categoryId, note, incurredAt } = req.body;
    const { user } = req;

    // [+] 使用 prisma.update 修改现有记录
    const updatedExpense = await prisma.expense.update({
      where: {
        id: Number(id),
        userId: user.id, // 安全校验：确保是该用户的记录
      },
      data: {
        amount: parseFloat(amount),
        note: note,
        categoryId: Number(categoryId), //
        incurredAt: incurredAt ? new Date(incurredAt) : undefined,
      },
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(updatedExpense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Update failed: ${error}` });
  }
});

export default router.handler({
  onNoMatch: (req, res) => { res.status(405).end(); },
});