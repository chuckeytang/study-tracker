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
  const { courseId } = req.query;

  if (!courseId) {
    return res.status(400).json({ message: "courseId is required" });
  }

  try {
    // 获取课程的基本信息
    const course = await prisma.course.findUnique({
      where: { id: Number(courseId) },
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // 获取课程的所有节点信息，并通过 UnlockDependency 和 LockDependency 查询解锁和锁住的依赖关系
    const nodes = await prisma.node.findMany({
      where: { courseId: Number(courseId) },
      include: {
        unlockDependenciesFrom: {
          include: {
            toNode: true, // 获取依赖的目标节点信息
          },
        },
        lockDependenciesFrom: {
          include: {
            toNode: true, // 获取依赖的目标节点信息
          },
        },
      },
    });

    // 格式化节点信息
    const formattedNodes = nodes.map((node) => ({
      name: node.name,
      description: node.description,
      nodeType: node.nodeType,
      courseId: node.courseId,
      maxLevel: node.maxLevel,
      iconUrl: node.iconUrl,
      unlockDepNodes: node.unlockDependenciesFrom.map((dep) => ({
        id: dep.toNode.id,
        name: dep.toNode.name,
        nodeType: dep.toNode.nodeType,
      })),
      unlockDepNodeCount: node.unlockDepNodeCount,
      unlockDepClusterTotalSkillPt: node.unlockDepClusterTotalSkillPt,
      lockDepNodes: node.lockDependenciesFrom.map((dep) => ({
        id: dep.toNode.id,
        name: dep.toNode.name,
        nodeType: dep.toNode.nodeType,
      })),
      lockDepNodeCount: node.lockDepNodeCount,
    }));

    // 返回课程信息和节点信息
    res.status(200).json({
      courseInfo: {
        id: course.id,
        name: course.name,
        description: course.description,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      },
      nodes: formattedNodes,
    });
  } catch (error) {
    res.status(500).json({ message: `Failed to fetch course info: ${error}` });
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
