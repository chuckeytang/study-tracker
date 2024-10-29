import { PrismaClient, Role } from "@prisma/client";
import { createRouter } from "next-connect";
import { authMiddleware } from "@/utils/auth"; // 引入 authMiddleware
import { ExtendedNextApiRequest } from "@/types/ExtendedNextApiRequest";
import { NextApiResponse } from "next";

const prisma = new PrismaClient();

// 创建 API 路由
const router = createRouter<ExtendedNextApiRequest, NextApiResponse>();

// 使用 authMiddleware 中间件，确保请求已通过鉴权
router.use(authMiddleware);

router.get(async (req: ExtendedNextApiRequest, res: NextApiResponse) => {
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

    // 过滤掉每个用户的密码字段
    const usersWithoutPassword = users.map(
      ({ password, ...userWithoutPassword }) => userWithoutPassword
    );

    // 返回结果，符合格式
    res.status(200).json({
      data: usersWithoutPassword,
      total: total,
    });
  } catch (error) {
    res.status(500).json({ message: `Failed to search users: ${error}` });
  }
});

// 错误处理
export default router.handler({
  onError: (err, req, res) => {
    res.status(500).json({ message: `An error occurred: ${err}` });
  },
  onNoMatch: (req, res) => {
    res.status(405).json({ message: `Method '${req.method}' Not Allowed` });
  },
});
