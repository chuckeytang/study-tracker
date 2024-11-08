// pages/api/courses/delete.ts

import { createRouter } from "next-connect";
import { authMiddleware } from "@/utils/auth"; // 引入 authMiddleware
import { ExtendedNextApiRequest } from "@/types/ExtendedNextApiRequest";
import { NextApiResponse } from "next";

import prisma from "@/lib/prisma";

// 创建 API 路由
const router = createRouter<ExtendedNextApiRequest, NextApiResponse>();

// 使用 authMiddleware 中间件，确保请求已通过鉴权
router.use(authMiddleware);

router.delete(async (req: ExtendedNextApiRequest, res: NextApiResponse) => {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id } = req.body; // 从请求体中获取要删除的课程ID

  try {
    // 确保删除操作按依赖顺序进行

    // 1. 删除与该课程节点相关的解锁依赖和锁住依赖
    await prisma.unlockDependency.deleteMany({
      where: {
        OR: [
          { fromNode: { courseId: Number(id) } },
          { toNode: { courseId: Number(id) } },
        ],
      },
    });

    await prisma.lockDependency.deleteMany({
      where: {
        OR: [
          { fromNode: { courseId: Number(id) } },
          { toNode: { courseId: Number(id) } },
        ],
      },
    });

    // 2. 删除与该课程相关的学生进度记录
    await prisma.courseProgress.deleteMany({
      where: { courseId: Number(id) },
    });

    // 3. 删除与该课程相关的用户-课程关系
    await prisma.userCourse.deleteMany({
      where: { courseId: Number(id) },
    });

    // 4. 删除该课程的所有节点
    await prisma.node.deleteMany({
      where: { courseId: Number(id) },
    });

    // 5. 删除课程本身
    const deletedCourse = await prisma.course.delete({
      where: { id: Number(id) },
    });

    res.status(200).json(deletedCourse); // 返回删除的课程记录
  } catch (error) {
    res.status(500).json({ message: `Failed to delete course: ${error}` });
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
