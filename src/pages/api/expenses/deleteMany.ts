import { createRouter } from "next-connect";
import { NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { authMiddleware } from "@/utils/auth";
import { ExtendedNextApiRequest } from "@/types/ExtendedNextApiRequest";

const router = createRouter<ExtendedNextApiRequest, NextApiResponse>();

router.use(authMiddleware);

router.delete(async (req, res) => {
  const rawIds = Array.isArray(req.body?.ids) ? req.body.ids : [];
  const normalizedIds = rawIds
    .map((id: unknown) => Number(id))
    .filter((id: number): id is number => Number.isInteger(id) && id > 0);
  const ids: number[] = Array.from(
    new Set<number>(normalizedIds),
  );

  if (ids.length === 0) {
    return res.status(400).json({ message: "Invalid or missing IDs" });
  }

  const deletedExpenses = await prisma.expense.deleteMany({
    where: {
      id: { in: ids },
      userId: req.user.id,
    },
  });

  return res.status(200).json(deletedExpenses);
});

export default router.handler({
  onError: (err, req, res) => {
    console.error("Delete expenses failed:", err);
    res.status(500).json({ message: `Failed to delete expenses: ${err}` });
  },
  onNoMatch: (req, res) => {
    res.status(405).json({ message: `Method '${req.method}' Not Allowed` });
  },
});
