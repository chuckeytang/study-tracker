import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const data = req.body; // 从请求体中获取创建的数据

  try {
    // 使用Prisma创建新记录
    const newCourse = await prisma.course.create({
      data, // 提供创建的数据
    });

    res.status(201).json(newCourse); // 返回创建的记录
  } catch (error) {
    res.status(500).json({ error: `Failed to create course: ${error}` });
  }
}
