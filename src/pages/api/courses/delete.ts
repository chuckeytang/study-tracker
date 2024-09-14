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

  const { id } = req.body; // 从请求体中获取要删除的ID

  try {
    // 使用Prisma删除单个记录
    const deletedCourse = await prisma.course.delete({
      where: { id: Number(id) }, // 根据ID删除
    });

    res.status(200).json(deletedCourse); // 返回删除的记录
  } catch (error) {
    res.status(500).json({ error: `Failed to delete course: ${error}` });
  }
}
