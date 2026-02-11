import { createRouter } from "next-connect";
import { authMiddleware } from "@/utils/auth";
import { ExtendedNextApiRequest } from "@/types/ExtendedNextApiRequest";
import { NextApiResponse } from "next";
import prisma from "@/lib/prisma";

const router = createRouter<ExtendedNextApiRequest, NextApiResponse>();
router.use(authMiddleware);

router.post(async (req, res) => {
  try {
    const { amount, categoryId, note, incurredAt } = req.body;
    const { user } = req;

    const newExpense = await prisma.expense.create({
      data: {
        amount: parseFloat(amount),
        note,
        categoryId: Number(categoryId),
        userId: user.id,
        incurredAt: incurredAt ? new Date(incurredAt) : new Date(),
      },
      include: { category: true },
    });

    //res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(201).json(newExpense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Failed to create expense: ${error}` });
  }
});

export default router.handler({
  onError: (err, req, res) => {
    console.error(err);
    res.status(500).end("Internal Server Error");
  },
  onNoMatch: (req, res) => {
    res.status(405).end(); // 这里不再隐式返回 res 对象
  },
});
