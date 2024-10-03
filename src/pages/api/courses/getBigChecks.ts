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
    // 查询该课程下所有的bigcheck节点
    const bigCheckNodes = await prisma.node.findMany({
      where: {
        courseId: Number(courseId),
        nodeType: "BIGCHECK", // 仅返回bigcheck类型的节点
      },
      include: {
        unlockDependenciesTo: {
          // 查询解锁依赖关系
          include: {
            fromNode: true, // 获取解锁依赖的节点信息
          },
        },
      },
    });

    // 构造返回数据，包含依赖关系的节点
    const formattedBigCheckNodes = bigCheckNodes.map((node) => ({
      nodeId: node.id,
      nodeName: node.name,
      nodeDescription: node.description,
      maxLevel: node.maxLevel,
      nodeType: node.nodeType,
      unlockDependencies: node.unlockDependenciesTo.map((dep) => ({
        nodeId: dep.fromNode.id,
        nodeName: dep.fromNode.name,
        nodeDescription: dep.fromNode.description,
        nodeType: dep.fromNode.nodeType,
        maxLevel: dep.fromNode.maxLevel,
      })),
    }));

    // 返回格式化后的数据
    res.status(200).json({
      data: formattedBigCheckNodes,
    });
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch bigcheck nodes: ${error}` });
  }
}
