import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { calculateUnlockStatus } from "@/utils/unlock";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { studentId, courseId, nodeId } = req.body;

  if (!studentId || !courseId) {
    return res.status(400).json({ message: "studentId and courseId are required" });
  }

  try {
    // Fetch nodes and progress for the course
    const [nodes, courseProgress] = await Promise.all([
      prisma.node.findMany({
        where: { courseId: Number(courseId) },
        include: {
          unlockDependenciesTo: true,
          unlockDependenciesFrom: true,
        },
      }),
      prisma.courseProgress.findMany({
        where: { userId: Number(studentId), courseId: Number(courseId) },
      }),
    ]);

    const progressMap = new Map(
      courseProgress.map((progress) => [progress.nodeId, progress])
    );
    const nodesMap = new Map(nodes.map((node) => [node.id, node]));

    // Determine which nodes to update
    const nodesToUpdate = nodeId ? [nodesMap.get(Number(nodeId))] : nodes;

    // Update unlock statuses
    const unlockStatuses = new Map<number, any>();
    for (const node of nodesToUpdate) {
      if (node) {
        const { unlocked } = await calculateUnlockStatus(node, progressMap, nodesMap);
        unlockStatuses.set(node.id, { unlocked });
      }
    }

    // Update course progress with new unlock statuses and unlockStartTime
    await Promise.all(
      Array.from(unlockStatuses.entries()).map(([nodeId, status]) => {
        const nodeProgress = progressMap.get(nodeId);
        return prisma.courseProgress.update({
          where: {
            userId_nodeId: {
              userId: Number(studentId),
              nodeId: nodeId,
            },
          },
          data: {
            unlocked: status.unlocked,
            unlockStartTime: nodeProgress ? nodeProgress.unlockStartTime : null,
          },
        });
      })
    );

    res.status(200).json({ message: "Skill tree status updated successfully" });
  } catch (error) {
    console.error("Error updating skill tree status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
} 