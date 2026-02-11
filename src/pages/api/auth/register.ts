import { createRouter } from "next-connect";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import redis from "@/lib/redis";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// 引入 Prisma 的错误类型定义，用于精确捕获错误
import { Prisma } from "@prisma/client"; 

const router = createRouter<NextApiRequest, NextApiResponse>();
const JWT_SECRET = process.env.JWT_SECRET || "TrackHabitsSecret";

router.post(async (req, res) => {
  const { email, password, code } = req.body;

  console.log(`[Register] 收到注册请求: ${email}`); // [Log] 1. 开始

  if (!email || !password || !code) {
    return res.status(400).json({ message: "请填写完整信息" });
  }

  try {
    // --- Step 1: 验证码校验 ---
    const redisKey = `verify:register:${email}`;
    const savedCode = await redis.get(redisKey);

    if (!savedCode) {
      console.log(`[Register] 验证码不存在或过期: ${email}`);
      return res.status(400).json({ message: "验证码已过期，请重新获取" });
    }

    if (savedCode !== code) {
      console.log(`[Register] 验证码错误: ${email}`);
      return res.status(400).json({ message: "验证码错误" });
    }

    // 验证通过，删除 Redis (不阻塞主流程，不等待它完成)
    redis.del(redisKey); 

    // --- Step 2: 查重 ---
    // 为了防止并发，其实 prisma.create 的唯一性约束才是最后一道防线
    // 但这里先查一次可以拦截大部分正常请求
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.log(`[Register] 邮箱已存在 (Check 1): ${email}`);
      return res.status(409).json({ message: "该邮箱已被注册" });
    }

    // --- Step 3: 创建用户 ---
    console.log(`[Register] 正在创建用户...`);
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: email.split("@")[0],
        role: "STUDENT", // 直接使用字符串 "STUDENT"，防止 Role enum 导入问题
        isTemporary: false,
      },
    });
    console.log(`[Register] 用户创建成功 ID: ${newUser.id}`);

    // --- Step 4: 签发 Token ---
    const token = jwt.sign(
      {
        userId: newUser.id,
        role: newUser.role,
        isTemporary: false,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "注册成功",
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    });

  } catch (error: any) {
    console.error("[Register Error] 详细错误堆栈:", error);

    // [*] 专门处理 Prisma 的 "唯一性约束冲突" (P2002)
    // 如果是因为并发请求导致第二次插入失败，我们视为"冲突"而不是"服务器异常"
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res.status(409).json({ message: "该邮箱已被注册 (P2002)" });
      }
    }

    return res.status(500).json({ 
        message: "注册服务异常", 
        error: error.message || "Unknown error" 
    });
  }
});

export default router.handler({
  onError: (err: any, req, res) => {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  },
});