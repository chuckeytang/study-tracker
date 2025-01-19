import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { calculateUnlockStatus } from "@/utils/unlock";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { studentId, courseId, nodeId } = req.body;

  if (!studentId || !courseId || !nodeId) {
    return res.status(400).json({ message: "studentId, courseId, and nodeId are required" });
  }
  const courseProgress = await prisma.courseProgress.findMany({
    where: {
      courseId: Number(courseId),
      userId: Number(studentId),
    },
  });

  const nodes = await prisma.node.findMany({
    where: { courseId: Number(courseId) },
    include: {
      // 本node所依赖的目标node
      unlockDependenciesTo: { include: { fromNode: true } },
      // 依赖本node的所有其他node
      unlockDependenciesFrom: { include: { toNode: true } },
    },
  });
  const progressMap = new Map(
    courseProgress.map((progress) => [progress.nodeId, progress])
  );
  const nodesMap = new Map(nodes.map((node) => [node.id, node]));

  try {
    // Fetch the specified node and its progress
    const node = await prisma.node.findUnique({
      where: { id: Number(nodeId) },
      include: {
        // 本node所依赖的目标node
        unlockDependenciesTo: { include: { fromNode: true } },
        // 依赖本node的所有其他node
        unlockDependenciesFrom: { include: { toNode: true } },
      },
    });

    const nodeProgress = progressMap.get(nodeId);

    if (!node || !nodeProgress) {
      return res.status(404).json({ message: "Node or progress not found" });
    }

    // Update the status of the specified node
    const { unlocked } = await calculateUnlockStatus(node, progressMap, nodesMap);
    await prisma.courseProgress.update({
      where: {
        userId_nodeId: {
          userId: Number(studentId),
          nodeId: Number(nodeId),
        },
      },
      data: {
        unlocked: unlocked,
        unlockStartTime: nodeProgress.unlockStartTime,
      },
    });
 
    if (unlocked) {
      // Update the status of dependent child nodes
      for (const dependency of node.unlockDependenciesFrom) {
        const childNode = await prisma.node.findUnique({
          where: { id: dependency.toNodeId },
          include: {
            // 本node所依赖的目标node
            unlockDependenciesTo: { include: { fromNode: true } },
          }
        });

        const childProgress = progressMap.get(dependency.toNodeId);

        if (childNode && childProgress) {
          const { unlocked: childUnlocked } = await calculateUnlockStatus(childNode, progressMap, nodesMap);
          await prisma.courseProgress.update({
            where: {
              userId_nodeId: {
                userId: Number(studentId),
                nodeId: dependency.toNodeId,
              },
            },
            data: {
              unlocked: childUnlocked,
              unlockStartTime: childProgress.unlockStartTime,
            },
          });
        }
      }
    }


    res.status(200).json({ message: "Node and dependent nodes updated successfully" });
  } catch (error) {
    console.error("Error updating node status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
} 