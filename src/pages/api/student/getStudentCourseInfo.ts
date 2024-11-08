import { createRouter } from "next-connect";
import { authMiddleware } from "@/utils/auth";
import { ExtendedNextApiRequest } from "@/types/ExtendedNextApiRequest";
import { NextApiResponse } from "next";

import prisma from "@/lib/prisma";

// 创建 API 路由
const router = createRouter<ExtendedNextApiRequest, NextApiResponse>();

// 使用 authMiddleware 中间件，确保请求已通过鉴权
router.use(authMiddleware);

router.get(async (req: ExtendedNextApiRequest, res: NextApiResponse) => {
  const { studentId, courseId } = req.query;

  if (!studentId || !courseId) {
    return res
      .status(400)
      .json({ message: "studentId and courseId are required" });
  }

  try {
    // 查询课程的所有节点
    const nodes = await prisma.node.findMany({
      where: {
        courseId: Number(courseId),
      },
    });

    // 查询该学生在该课程中的所有学习进度
    const progress = await prisma.courseProgress.findMany({
      where: {
        userId: Number(studentId),
        courseId: Number(courseId),
      },
    });

    // 构建节点与进度的映射关系
    const nodeProgressMap = progress.reduce((acc, curr) => {
      acc[curr.nodeId] = {
        unlocked: curr.unlocked,
        level: curr.level,
        clusterSkillPt: curr.clusterSkillPt,
      };
      return acc;
    }, {} as Record<number, { unlocked: boolean; level: number; clusterSkillPt: number }>);

    // 合并节点信息和对应的学习进度
    const formattedNodes = nodes.map((node) => {
      const progressData = nodeProgressMap[node.id] || {
        unlocked: false,
        level: 0,
        clusterSkillPt: 0,
      };
      return {
        nodeId: node.id,
        nodeName: node.name,
        nodeDescription: node.description,
        nodeType: node.nodeType,
        maxLevel: node.maxLevel,
        unlocked: progressData.unlocked,
        level: progressData.level,
        clusterSkillPt: progressData.clusterSkillPt,
      };
    });

    // 返回格式化的数据
    res.status(200).json({
      data: formattedNodes,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Failed to fetch student course info: ${error}` });
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
