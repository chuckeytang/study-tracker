import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { ExtendedNextApiRequest } from "@/types/ExtendedNextApiRequest";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "TrackHabitsSecret";

// 验证 token 并返回用户
export async function getAuthenticatedUser(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "No token provided" });
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
      res.status(404).json({ message: "User not found" });
      throw new Error("User not found");
    }

    // 检查是否是临时用户
    const isTemporary = decoded.isTemporary || user.isTemporary;

    return { ...user, isTemporary };
  } catch (error) {
    res
      .status(403)
      .json({ message: "Invalid token or Token expired. Please relogin." });
    throw new Error("Invalid token or Token expired. Please relogin.");
  }
}

// 中间件，验证用户身份并将用户信息添加到 req.user
export async function authMiddleware(
  req: ExtendedNextApiRequest,
  res: NextApiResponse,
  next: Function
) {
  try {
    // 获取并验证用户
    req.user = await getAuthenticatedUser(req, res);

    // 检查权限逻辑（如果需要对临时用户做权限限制）
    if (req.user.isTemporary) {
      console.log("Temporary user accessing:", req.url);
    }

    next(); // 验证成功后调用下一个中间件或处理函数
  } catch (error) {
    // 错误已经在 getAuthenticatedUser 中处理，无需再次处理
  }
}
