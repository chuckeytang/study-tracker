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

  const { id, ...data } = req.body; // 从请求体中获取更新数据和ID

  try {
    // 使用Prisma更新单个记录
    const updatedCourse = await prisma.course.update({
      where: { id: Number(id) }, // 根据ID更新
      data, // 更新数据
    });

    res.status(200).json(updatedCourse);
  } catch (error) {
    res.status(500).json({ error: `Failed to update course: ${error}` });
  }
}
