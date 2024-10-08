// src/pages/api/student/changeNodeLevel.ts

import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 递归计算所有非 BIGCHECK 类型的节点的技能点总和
async function calculateTotalSkillPoints(
  nodeId: number,
  progressMap: any,
  nodesMap: any
) {
  const node = nodesMap.get(nodeId);

  // 获取当前节点的进度
  const progress = progressMap.get(nodeId);
  let totalSkillPoints = progress ? progress.level : 0;

  if (!node || node.nodeType === "BIGCHECK") {
    totalSkillPoints = 0;
  }

  // 遍历节点的 unlockDependenciesTo 依赖，递归累加其技能点
  for (const dep of node.unlockDependenciesTo) {
    totalSkillPoints += await calculateTotalSkillPoints(
      dep.fromNodeId,
      progressMap,
      nodesMap
    );
  }

  return totalSkillPoints;
}

// 检查节点解锁状态的函数
async function checkUnlockStatus(courseId: number, studentId: number) {
  const nodes = await prisma.node.findMany({
    where: { courseId },
    include: {
      unlockDependenciesTo: {
        include: {
          fromNode: true,
        },
      },
      lockDependenciesFrom: {
        include: {
          fromNode: true,
        },
      },
    },
  });

  const courseProgress = await prisma.courseProgress.findMany({
    where: {
      courseId,
      userId: Number(studentId),
    },
  });

  const progressMap = new Map(
    courseProgress.map((progress) => [progress.nodeId, progress])
  );
  const nodesMap = new Map(nodes.map((node) => [node.id, node]));

  // 遍历所有节点，检查解锁和锁住状态
  return nodes.map(async (node) => {
    let unlocked = false;

    // 解锁规则
    if (node.nodeType === "BIGCHECK") {
      if (node.unlockDependenciesTo.length === 0) {
        unlocked = true; // 没有前置依赖，直接解锁
      } else {
        // 计算依赖的 BIGCHECK 节点的子孙节点的技能点总和（不包括 BIGCHECK 节点本身的level）
        const totalSkillPoints = await calculateTotalSkillPoints(
          node.id,
          progressMap,
          nodesMap
        );
        if (totalSkillPoints >= (node.unlockDepClusterTotalSkillPt || 0)) {
          unlocked = true; // 技能点达到要求，解锁
        }
      }
    } else {
      // MAJOR_NODE 或 MINOR_NODE 解锁依赖
      unlocked = node.unlockDependenciesTo.every((dep) => {
        const depProgress = progressMap.get(dep.fromNodeId);
        return depProgress && depProgress.unlocked && depProgress.level > 0;
      });
    }

    // 锁住规则（优先级高于解锁规则）
    if (node.nodeType !== "BIGCHECK") {
      node.lockDependenciesFrom.forEach((lockDep) => {
        const depProgress = progressMap.get(lockDep.toNodeId);
        if (depProgress && depProgress.unlocked && depProgress.level > 0) {
          unlocked = false; // 如果锁住依赖节点解锁且其level > 0，本节点保持锁住
        }
      });
    }

    return {
      nodeId: node.id,
      unlocked,
    };
  });
}

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

    // 检查节点是否已解锁
    if (!progress.unlocked) {
      return res.status(400).json({
        error: "Node is locked and cannot be leveled up.",
      });
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
          decrement: points, // 仅在增加技能点时减少学生的技能点数
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

    // 再次检查解锁状态并更新课程进度
    const updatedUnlockStatus = await Promise.all(
      await checkUnlockStatus(node.courseId, studentId)
    );
    // 使用Promise.all等待所有Promise完成
    await Promise.all(
      updatedUnlockStatus.map((status) =>
        prisma.courseProgress.update({
          where: {
            userId_nodeId: {
              userId: Number(studentId),
              nodeId: status.nodeId,
            },
          },
          data: {
            unlocked: status.unlocked,
          },
        })
      )
    );

    res.status(200).json({
      message: `Skill point ${points > 0 ? "added" : "reduced"} successfully`,
    });
  } catch (error) {
    res.status(500).json({ error: `Failed to modify skill points: ${error}` });
  }
}
