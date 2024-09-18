// 获取某个课程的课程树结构
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { courseId } = req.query;

  if (!courseId) {
    return res.status(400).json({ error: "courseId is required" });
  }

  try {
    // 获取课程的基本信息
    const course = await prisma.course.findUnique({
      where: { id: Number(courseId) },
    });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // 获取课程的所有节点信息
    const nodes = await prisma.node.findMany({
      where: { courseId: Number(courseId) },
      include: {
        unlockDepNodes: true,
        lockDepNodes: true,
      },
    });

    // 格式化节点信息
    const formattedNodes = nodes.map((node) => ({
      name: node.name,
      description: node.description,
      nodeType: node.nodeType,
      courseId: node.courseId,
      maxLevel: node.maxLevel,
      unlockDepNodes: node.unlockDepNodes.map((unlockNode) => ({
        id: unlockNode.id,
        name: unlockNode.name,
        nodeType: unlockNode.nodeType,
      })),
      unlockDepNodeCount: node.unlockDepNodeCount,
      lockDepNodes: node.lockDepNodes.map((lockNode) => ({
        id: lockNode.id,
        name: lockNode.name,
        nodeType: lockNode.nodeType,
      })),
      lockDepNodeCount: node.lockDepNodeCount,
    }));

    // 返回课程信息和节点信息
    res.status(200).json({
      courseInfo: {
        id: course.id,
        name: course.name,
        description: course.description,
        teacherId: course.teacherId,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      },
      nodes: formattedNodes,
    });
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch course info: ${error}` });
  }
}
