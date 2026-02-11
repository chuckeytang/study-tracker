// [+] 新建文件: src/pages/api/auth/reset-password.ts
import { createRouter } from "next-connect";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import redis from "@/lib/redis";
import bcrypt from "bcryptjs"; // 确保使用 bcryptjs

const router = createRouter<NextApiRequest, NextApiResponse>();

router.post(async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // 1. 验证码校验
    const redisKey = `verify:forgot-password:${email}`;
    const savedCode = await redis.get(redisKey);

    if (!savedCode) {
      return res.status(400).json({ message: "Verification code expired or invalid" });
    }

    if (savedCode !== code) {
      return res.status(400).json({ message: "Incorrect verification code" });
    }

    // 2. 查找用户
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3. 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. 更新数据库
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // 5. 销毁验证码 (防止重复使用)
    await redis.del(redisKey);

    console.log(`[System] Password reset successfully for ${email}`);
    res.status(200).json({ message: "Password reset successfully" });

  } catch (error: any) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

export default router.handler({
  onError: (err: any, req, res) => {
    res.status(500).json({ message: "Internal Server Error" });
  },
});