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

    const experienceConfig = await prisma.experienceConfig.findMany({
      skip: start,
      take: take,
      orderBy: {
        [_sort as string]: _order === "desc" ? "desc" : "asc",
      },
    });

    const total = await prisma.experienceConfig.count();

    res.setHeader("Content-Range", `experienceConfig ${start}-${end}/${total}`);
    res.setHeader("Access-Control-Expose-Headers", "Content-Range");

    res.status(200).json({ data: experienceConfig, total });
  } catch (error) {
    console.error("Error fetching experience configuration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}