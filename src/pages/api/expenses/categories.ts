import { createRouter } from "next-connect";
import { NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { ExtendedNextApiRequest } from "@/types/ExtendedNextApiRequest";
import { authMiddleware } from "@/utils/auth";
import { ensureExpenseCategories } from "@/lib/expense-categories";

const router = createRouter<ExtendedNextApiRequest, NextApiResponse>();
router.use(authMiddleware);

router.get(async (_req, res) => {
  try {
    const categories = await ensureExpenseCategories(prisma);
    res.status(200).json({ data: categories });
  } catch (error) {
    console.error("Fetch expense categories failed:", error);
    res.status(500).json({ message: `Fetch expense categories failed: ${error}` });
  }
});

export default router.handler({
  onNoMatch: (_req, res) => {
    res.status(405).json({ message: "Method Not Allowed" });
  },
});
