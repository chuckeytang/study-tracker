import { PrismaClient } from "@prisma/client";
import { createRouter } from "next-connect";
import { authMiddleware } from "@/utils/auth"; // 引入 authMiddleware
import { ExtendedNextApiRequest } from "@/types/ExtendedNextApiRequest";
import { NextApiResponse } from "next";

const prisma = new PrismaClient();

// 创建 API 路由
const router = createRouter<ExtendedNextApiRequest, NextApiResponse>();

// 使用 authMiddleware 中间件，确保请求已通过鉴权
router.use(authMiddleware);

router.delete(async (req: ExtendedNextApiRequest, res: NextApiResponse) => {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { ids } = req.body; // 从请求体中获取要删除的ID数组

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "Invalid or missing IDs" });
  }

  try {
    const courseIds = ids.map((id: number) => Number(id));

    // 删除与每个课程相关的依赖关系
    await prisma.unlockDependency.deleteMany({
      where: {
        OR: [
          { fromNode: { courseId: { in: courseIds } } },
          { toNode: { courseId: { in: courseIds } } },
        ],
      },
    });

    await prisma.lockDependency.deleteMany({
      where: {
        OR: [
          { fromNode: { courseId: { in: courseIds } } },
          { toNode: { courseId: { in: courseIds } } },
        ],
      },
    });

    // 删除学生进度记录
    await prisma.courseProgress.deleteMany({
      where: { courseId: { in: courseIds } },
    });

    // 删除用户课程关系
    await prisma.userCourse.deleteMany({
      where: { courseId: { in: courseIds } },
    });

    // 删除课程的所有节点
    await prisma.node.deleteMany({
      where: { courseId: { in: courseIds } },
    });

    // 最后，删除课程
    const deletedCourses = await prisma.course.deleteMany({
      where: { id: { in: courseIds } },
    });

    res.status(200).json(deletedCourses); // 返回删除的结果
  } catch (error) {
    res.status(500).json({ message: `Failed to delete courses: ${error}` });
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
