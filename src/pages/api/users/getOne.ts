import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 查询用户的已绑定课程数量
    const coursesSelected = await prisma.userCourse.count({
      where: {
        userId: Number(id),
      },
    });

    // 返回用户信息和绑定的课程数量
    res.status(200).json({
      ...user,
      coursesSelected,
    });
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch user: ${error}` });
  }
}
