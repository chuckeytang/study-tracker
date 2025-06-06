import { createRouter } from "next-connect";
import { authMiddleware } from "@/utils/auth"; // 引入 authMiddleware
import { ExtendedNextApiRequest } from "@/types/ExtendedNextApiRequest";
import { NextApiResponse } from "next";

import prisma from "@/lib/prisma";

// 创建 API 路由
const router = createRouter<ExtendedNextApiRequest, NextApiResponse>();

// 使用 authMiddleware 中间件，确保请求已通过鉴权
router.use(authMiddleware);

router.get(async (req: ExtendedNextApiRequest, res: NextApiResponse) => {
  const { user } = req; // 从请求中获取用户ID参数

  try {
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 查询用户的已绑定课程数量
    const coursesSelected = await prisma.userCourse.count({
      where: {
        userId: Number(user.id),
      },
    });

    // 返回用户信息和绑定的课程数量，确保不返回敏感信息（例如：密码）
    const { password, ...userData } = user;

    // 返回用户信息和绑定的课程数量
    res.status(200).json({
      ...userData,
      coursesSelected,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user information" });
  }
});

// 错误处理
export default router.handler({
  onError: (err, req, res) => {
    res.status(500).json({ message: `An error occurred: ${err}` });
  },
});
