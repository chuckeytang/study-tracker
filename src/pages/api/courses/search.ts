import { PrismaClient } from "@prisma/client";
import { createRouter } from "next-connect";
import { authMiddleware } from "@/utils/auth"; // 引入 authMiddleware
import { ExtendedNextApiRequest } from "@/types/ExtendedNextApiRequest";
import { NextApiResponse } from "next";

const prisma = new PrismaClient();

// 创建 API 路由
const router = createRouter<ExtendedNextApiRequest, NextApiResponse>();

// 使用 authMiddleware 中间件，确保请求已通过鉴权
router.use(authMiddleware);

router.get(async (req: ExtendedNextApiRequest, res: NextApiResponse) => {
  const { _start, _end, _sort, _order } = req.query;

  const start = parseInt(_start as string, 10) || 0;
  const end = parseInt(_end as string, 10) || 10;
  const take = end - start;
  const skip = start;

  const sortField = _sort ? String(_sort) : "id"; // 默认按 id 排序
  const sortOrder = _order === "DESC" ? "desc" : "asc"; // 默认升序

  try {
    // 获取分页数据
    const courses = await prisma.course.findMany({
      skip: skip,
      take: take,
      orderBy: {
        [sortField]: sortOrder,
      },
    });

    // 获取总条目数
    const total = await prisma.course.count();

    // 设置 Content-Range 响应头
    res.setHeader(
      "Content-Range",
      `courses ${start}-${start + courses.length - 1}/${total}`
    );
    res.setHeader("Access-Control-Expose-Headers", "Content-Range");

    res.status(200).json({
      data: courses,
      total: total,
    });
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch courses: ${error}` });
  }
});

// 错误处理
export default router.handler({
  onError: (err, req, res) => {
    res.status(500).json({ error: `An error occurred: ${err}` });
  },
  onNoMatch: (req, res) => {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});
