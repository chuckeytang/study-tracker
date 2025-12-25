import { createRouter } from "next-connect";
import { authMiddleware } from "@/utils/auth";
import { ExtendedNextApiRequest } from "@/types/ExtendedNextApiRequest";
import { NextApiResponse } from "next";
import prisma from "@/lib/prisma";

const router = createRouter<ExtendedNextApiRequest, NextApiResponse>();
router.use(authMiddleware);

router.get(async (req, res) => {
  const { _start, _end, _sort, _order, q, startDate, endDate } = req.query;
  const { user } = req;

  const start = parseInt(_start as string, 10) || 0;
  const end = parseInt(_end as string, 10) || 20;
  const sortField = _sort ? String(_sort) : "incurredAt";
  const sortOrder = _order === "DESC" ? "desc" : "asc";

  // 构建查询条件
  const where: any = {
    userId: user.id, // 严格隔离用户数据
  };

  // 1. 关键词搜索 (搜索备注或分类名)
  if (q) {
    where.OR = [
      { note: { contains: String(q) } },
      { category: { name: { contains: String(q) } } },
    ];
  }

  // 2. 日期范围筛选 (对应 UI 的 Date Range)
  if (startDate || endDate) {
    where.incurredAt = {};
    if (startDate) where.incurredAt.gte = new Date(startDate as string);
    if (endDate) where.incurredAt.lte = new Date(endDate as string);
  }

  try {
    // 并发执行：列表查询、总条数、总金额统计
    const [expenses, totalCount, aggregate] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip: start,
        take: end - start,
        orderBy: { [sortField]: sortOrder },
        include: { category: true }, // 包含分类信息以获取图标和名称
      }),
      prisma.expense.count({ where }),
      prisma.expense.aggregate({
        where,
        _sum: { amount: true },
      }),
    ]);

    // 格式化响应，参考 admin-stack 规范
    res.setHeader(
      "Content-Range",
      `expenses ${start}-${start + expenses.length - 1}/${totalCount}`
    );
    res.setHeader("Access-Control-Expose-Headers", "Content-Range");

    res.status(200).json({
      data: expenses,
      total: totalCount,
      sum: aggregate._sum.amount || 0, // UI 顶部的 Total Expenses
    });
  } catch (error) {
    res.status(500).json({ message: `Fetch expenses failed: ${error}` });
  }
});

export default router.handler({
  onNoMatch: (req, res) =>
    res.status(405).json({ message: "Method Not Allowed" }),
});
