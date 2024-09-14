import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { name, email, role, _start, _end } = req.query;

  const start = parseInt(_start as string, 10) || 0;
  const end = parseInt(_end as string, 10) || 10;
  const take = end - start;
  const skip = start;

  try {
    // 获取符合条件的用户列表
    const users = await prisma.user.findMany({
      where: {
        name: name ? { contains: String(name) } : undefined,
        email: email ? { contains: String(email) } : undefined,
        role: role ? (role as Role) : undefined,
      },
      skip: skip,
      take: take,
    });

    // 获取符合条件的用户总数
    const total = await prisma.user.count({
      where: {
        name: name ? { contains: String(name) } : undefined,
        email: email ? { contains: String(email) } : undefined,
        role: role ? (role as Role) : undefined,
      },
    });

    // 返回结果，符合格式
    res.status(200).json({
      data: users,
      total: total,
    });
  } catch (error) {
    res.status(500).json({ error: `Failed to search users: ${error}` });
  }
}
