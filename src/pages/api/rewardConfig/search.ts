import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { _start = "0", _end = "10", _sort = "level", _order = "asc" } = req.query;

  try {
    const start = parseInt(_start as string, 10);
    const end = parseInt(_end as string, 10);
    const take = end - start;

    // 获取 rewardConfig 数据，支持分页和排序
    const rewardConfig = await prisma.rewardConfig.findMany({
      skip: start,
      take: take,
      orderBy: {
        [_sort as string]: _order === "desc" ? "desc" : "asc",
      },
    });

    // 获取总条目数
    const total = await prisma.rewardConfig.count();

    // 设置 Content-Range 响应头，兼容 react-admin
    res.setHeader("Content-Range", `rewardConfig ${start}-${end}/${total}`);
    res.setHeader("Access-Control-Expose-Headers", "Content-Range");

    res.status(200).json({ data: rewardConfig, total });
  } catch (error) {
    console.error("Error fetching reward configuration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}