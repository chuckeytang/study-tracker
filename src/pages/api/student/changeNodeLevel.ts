// src/pages/api/student/changeNodeLevel.ts

import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { nodeId, points, studentId } = req.body;

  if (!nodeId || points === undefined || !studentId) {
    return res
      .status(400)
      .json({ error: "nodeId, points, and studentId are required" });
  }

  try {
    // 获取节点和学生的相关信息
    const [node, user, progress] = await Promise.all([
      prisma.node.findUnique({
        where: { id: Number(nodeId) },
      }),
      prisma.user.findUnique({
        where: { id: Number(studentId) },
      }),
      prisma.courseProgress.findUnique({
        where: {
          userId_nodeId: {
            userId: Number(studentId),
            nodeId: Number(nodeId),
          },
        },
      }),
    ]);

    if (!node) {
      return res.status(404).json({ error: "Node not found" });
    }
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!progress) {
      return res
        .status(404)
        .json({ error: "Progress not found for the given node and student" });
    }

    // 当前技能点等级
    const currentLevel = progress.level;
    const maxLevel = node.maxLevel;

    // 计算新的等级
    const newLevel = currentLevel + points;

    // 检查新等级是否合法
    if (newLevel < 0) {
      return res.status(400).json({
        error: "Cannot reduce skill points. Level cannot be below 0.",
      });
    } else if (newLevel > maxLevel) {
      return res.status(400).json({
        error: `Cannot add skill points. Max level of ${maxLevel} reached.`,
      });
    }

    // 检查学生是否有足够的技能点来增加等级
    if (points > 0 && user.skillPt && user.skillPt < points) {
      return res
        .status(400)
        .json({ error: "Not enough skill points to add to this node." });
    }

    // 更新学生的技能点数（减少或恢复）
    await prisma.user.update({
      where: { id: Number(studentId) },
      data: {
        skillPt: {
          decrement: points > 0 ? points : 0, // 仅在增加技能点时减少学生的技能点数
        },
      },
    });

    // 更新节点的进度
    await prisma.courseProgress.update({
      where: {
        userId_nodeId: {
          userId: Number(studentId),
          nodeId: Number(nodeId),
        },
      },
      data: {
        level: newLevel,
      },
    });

    res.status(200).json({
      message: `Skill point ${points > 0 ? "added" : "reduced"} successfully`,
    });
  } catch (error) {
    res.status(500).json({ error: `Failed to modify skill points: ${error}` });
  }
}
