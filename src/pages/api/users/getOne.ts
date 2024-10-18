import { NextApiRequest, NextApiResponse } from "next";
import { getAuthenticatedUser } from "@/utils/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // 获取经过认证的用户
    const user = await getAuthenticatedUser(req, res);

    // 查询用户的已绑定课程数量
    const coursesSelected = await prisma.userCourse.count({
      where: {
        userId: user.id,
      },
    });

    // 返回用户信息和绑定的课程数量
    res.status(200).json({
      ...user,
      coursesSelected,
    });
  } catch (error) {
    // 错误已经在 getAuthenticatedUser 中处理，此处无需再次处理
  }
}
