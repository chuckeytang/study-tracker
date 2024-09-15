// 选中课程可加技能点、课程每个node解锁情况和等级
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { studentId, courseId } = req.query;

  if (!studentId || !courseId) {
    return res
      .status(400)
      .json({ error: "studentId and courseId are required" });
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
      };
      return acc;
    }, {} as Record<number, { unlocked: boolean; level: number }>);

    // 合并节点信息和对应的学习进度
    const formattedNodes = nodes.map((node) => {
      const progressData = nodeProgressMap[node.id] || {
        unlocked: false,
        level: 0,
      };
      return {
        nodeId: node.id,
        nodeName: node.name,
        nodeDescription: node.description,
        nodeType: node.nodeType,
        maxLevel: node.maxLevel,
        unlocked: progressData.unlocked,
        level: progressData.level,
      };
    });

    // 返回格式化的数据
    res.status(200).json({
      data: formattedNodes,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: `Failed to fetch student course info: ${error}` });
  }
}
