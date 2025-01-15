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

  try {
    // Fetch the specified node and its progress
    const node = await prisma.node.findUnique({
      where: { id: Number(nodeId) },
      include: {
        unlockDependenciesTo: true, // Get nodes that depend on this node
      },
    });

    const nodeProgress = await prisma.courseProgress.findUnique({
      where: {
        userId_nodeId: {
          userId: Number(studentId),
          nodeId: Number(nodeId),
        },
      },
    });

    if (!node || !nodeProgress) {
      return res.status(404).json({ message: "Node or progress not found" });
    }

    // Update the status of the specified node
    const { unlocked } = await calculateUnlockStatus(node, new Map([[nodeId, nodeProgress]]), new Map([[nodeId, node]]));
    await prisma.courseProgress.update({
      where: {
        userId_nodeId: {
          userId: Number(studentId),
          nodeId: Number(nodeId),
        },
      },
      data: {
        unlocked: unlocked,
        unlockStartTime: unlocked ? new Date() : nodeProgress.unlockStartTime,
      },
    });

    // Update the status of dependent child nodes
    for (const dependency of node.unlockDependenciesTo) {
      const childNode = await prisma.node.findUnique({
        where: { id: dependency.toNodeId },
      });

      const childProgress = await prisma.courseProgress.findUnique({
        where: {
          userId_nodeId: {
            userId: Number(studentId),
            nodeId: dependency.toNodeId,
          },
        },
      });

      if (childNode && childProgress) {
        const { unlocked: childUnlocked } = await calculateUnlockStatus(childNode, new Map([[dependency.toNodeId, childProgress]]), new Map([[dependency.toNodeId, childNode]]));
        await prisma.courseProgress.update({
          where: {
            userId_nodeId: {
              userId: Number(studentId),
              nodeId: dependency.toNodeId,
            },
          },
          data: {
            unlocked: childUnlocked,
            unlockStartTime: childUnlocked ? new Date() : childProgress.unlockStartTime,
          },
        });
      }
    }

    res.status(200).json({ message: "Node and dependent nodes updated successfully" });
  } catch (error) {
    console.error("Error updating node status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
} 