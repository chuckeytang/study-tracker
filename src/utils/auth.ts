import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { ExtendedNextApiRequest } from "@/types/ExtendedNextApiRequest";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// 验证 token 并返回用户
export async function getAuthenticatedUser(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "No token provided" });
    throw new Error("No token provided");
  }

  try {
    // 验证 JWT token
    const decoded: any = jwt.verify(token, JWT_SECRET);

    // 从数据库中获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    res
      .status(403)
      .json({ error: "Invalid token or Token expired. Please relogin." });
    throw new Error("Invalid token or Token expired. Please relogin.");
  }
}

export async function authMiddleware(
  req: ExtendedNextApiRequest,
  res: NextApiResponse,
  next: Function
) {
  try {
    // 尝试获取并验证用户
    req.user = await getAuthenticatedUser(req, res);
    next(); // 验证成功后调用下一个中间件或处理函数
  } catch (error) {
    // 错误已经在 getAuthenticatedUser 中处理，无需再次处理
  }
}
