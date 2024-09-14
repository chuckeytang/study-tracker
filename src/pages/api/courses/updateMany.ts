import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { ids, ...data } = req.body; // 从请求体中获取批量更新的IDs和更新数据

  try {
    // 使用Prisma批量更新多个记录
    const updatedCourses = await prisma.course.updateMany({
      where: { id: { in: ids.map((id: number) => Number(id)) } }, // 批量更新ID
      data, // 更新数据
    });

    res.status(200).json(updatedCourses);
  } catch (error) {
    res.status(500).json({ error: `Failed to update courses: ${error}` });
  }
}
