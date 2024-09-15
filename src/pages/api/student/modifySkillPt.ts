import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { nodeId, addOrMinus, studentId } = req.body;

  if (!nodeId || !addOrMinus || !studentId) {
    return res
      .status(400)
      .json({ error: "nodeId, addOrMinus, and studentId are required" });
  }

  try {
    // 获取节点及其依赖关系和当前学生的进度
    const node = await prisma.node.findUnique({
      where: { id: Number(nodeId) },
      include: {
        unlockDepNodes: true,
        lockDepNodes: true,
      },
    });

    if (!node) {
      return res.status(404).json({ error: "Node not found" });
    }

    // 获取该学生的学习进度
    const progress = await prisma.courseProgress.findUnique({
      where: {
        userId_nodeId: {
          userId: Number(studentId),
          nodeId: Number(nodeId),
        },
      },
    });

    if (!progress) {
      return res
        .status(404)
        .json({ error: "Progress not found for the given node and student" });
    }

    // 判断节点是否已解锁且未被锁住
    if (!progress.unlocked) {
      return res.status(400).json({ error: "Node is not unlocked" });
    }

    const lockDependencyCount = node.lockDepNodes.filter(
      (depNode) => depNode.id === nodeId
    ).length;
    const isLocked =
      node.lockDepNodeCount === -1
        ? lockDependencyCount === node.lockDepNodes.length
        : lockDependencyCount >= (node.lockDepNodeCount || 0);

    if (isLocked) {
      return res.status(400).json({ error: "Node is locked" });
    }

    // 当前技能点等级
    const currentLevel = progress.level;

    // 判断是增加还是减少技能点
    if (addOrMinus === "add") {
      // 增加技能点，不能超过 maxLevel
      if (currentLevel >= node.maxLevel) {
        return res
          .status(400)
          .json({ error: "Cannot add skill points. Max level reached." });
      }
      // 更新技能点
      await prisma.courseProgress.update({
        where: {
          userId_nodeId: {
            userId: Number(studentId),
            nodeId: Number(nodeId),
          },
        },
        data: {
          level: currentLevel + 1,
        },
      });
      res.status(200).json({ message: "Skill point added successfully" });
    } else if (addOrMinus === "minus") {
      // 减少技能点，不能低于 0
      if (currentLevel <= 0) {
        return res
          .status(400)
          .json({
            error: "Cannot reduce skill points. Level is already at 0.",
          });
      }
      // 更新技能点
      await prisma.courseProgress.update({
        where: {
          userId_nodeId: {
            userId: Number(studentId),
            nodeId: Number(nodeId),
          },
        },
        data: {
          level: currentLevel - 1,
        },
      });
      res.status(200).json({ message: "Skill point reduced successfully" });
    } else {
      res
        .status(400)
        .json({ error: "Invalid operation. Use 'add' or 'minus'." });
    }
  } catch (error) {
    res.status(500).json({ error: `Failed to modify skill points: ${error}` });
  }
}
