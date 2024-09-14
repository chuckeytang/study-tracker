import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { ids } = req.body; // 从请求体中获取要删除的ID数组

  try {
    // 使用Prisma批量删除多个记录
    const deletedCourses = await prisma.course.deleteMany({
      where: { id: { in: ids.map((id: number) => Number(id)) } }, // 批量删除ID
    });

    res.status(200).json(deletedCourses); // 返回删除的结果
  } catch (error) {
    res.status(500).json({ error: `Failed to delete courses: ${error}` });
  }
}
