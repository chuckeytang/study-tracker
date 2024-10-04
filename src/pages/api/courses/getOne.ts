import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  try {
    // 根据课程ID获取单个课程
    const course = await prisma.course.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        nodes: true, // 如果需要，可以包含与节点的关系
      },
    });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch course: ${error}` });
  }
}
