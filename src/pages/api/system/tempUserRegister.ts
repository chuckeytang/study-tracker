import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "TrackHabitsSecret";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // 检查是否已经存在临时用户（可以通过 IP 或浏览器标识等逻辑）
    const { existingUserId } = req.body;

    if (existingUserId) {
      // 查找现有用户
      const existingUser = await prisma.user.findUnique({
        where: { id: existingUserId },
      });

      if (existingUser) {
        // 生成 JWT Token 并返回
        const token = jwt.sign(
          {
            userId: existingUser.id,
            role: existingUser.role,
            isTemporary: existingUser.isTemporary,
          },
          JWT_SECRET,
          { expiresIn: "7d" }
        );

        return res.status(200).json({ token, userId: existingUser.id, message: "User logged in" });
      }
    }

    // 如果没有临时用户，创建新的临时用户
    const temporaryUser = await prisma.user.create({
      data: {
        role: Role.STUDENT,
        isTemporary: true,
      },
    });

    // 生成 JWT Token
    const token = jwt.sign(
      {
        userId: temporaryUser.id,
        role: temporaryUser.role,
        isTemporary: true,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({ token, userId: temporaryUser.id, message: "Temporary user created" });
  } catch (error) {
    console.error("Error creating or logging in temporary user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
