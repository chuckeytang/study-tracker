// src/pages/api/student/changeNodeLevel.ts

import { NextApiRequest, NextApiResponse } from "next";

import { ExtendedNextApiRequest } from "@/types/ExtendedNextApiRequest";
import { authMiddleware } from "@/utils/auth";
import { createRouter } from "next-connect";

import prisma from "@/lib/prisma";
import { calculateUnlockStatus } from "@/utils/unlock";

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

  // 遍历节点的 unlockDependenciesFrom 依赖，递归累加其技能点
  for (const dep of node.unlockDependenciesFrom) {
    const toNode = nodesMap.get(dep.toNodeId);
    if (!toNode || toNode.nodeType == "BIGCHECK") continue;
    totalSkillPoints += await calculateTotalSkillPoints(
      dep.toNodeId,
      progressMap,
      nodesMap
    );
  }

  return totalSkillPoints;
}

// 定义返回类型接口
interface UnlockStatus {
  nodeId: number;
  unlocked: boolean;
  level: number;
  totalSkillPoints: number;
  unlockStartTime?: Date | null;
}

interface LockAndReleaseResult {
  releasedSkillPoints: number;
  updatedUnlockStatuses: Map<number, UnlockStatus>;
}

// 递归函数：遍历子节点并返回解锁状态和释放的技能点
async function lockAndReleaseSkillPoints(
  nodeId: number,
  progressMap: Map<number, any>,
  nodesMap: Map<number, any>,
  lockRoot: boolean = true
): Promise<LockAndReleaseResult> {
  const node = nodesMap.get(nodeId);
  if (!node)
    return {
      releasedSkillPoints: 0,
      updatedUnlockStatuses: new Map<number, UnlockStatus>(),
    };

  let releasedSkillPoints = 0;
  let level = 0;
  const updatedUnlockStatuses = new Map<number, UnlockStatus>();

  const progress = progressMap.get(nodeId);
  if (node.nodeType === "BIGCHECK") {
    level = 1; // BIGCHECK 节点的级别为1
  } else {
    // 获取当前节点的进度
    if (progress && progress.level > 0) {
      releasedSkillPoints += progress.level; // 释放的技能点等于当前节点的等级
      level = 0; // 非BIGCHECK节点，锁住后level设为0
    }
  }

  if (nodeId === 480) {
    console.log(
      "nodeId: ",
      nodeId,
      "unlockStartTime: ",
      progress.unlockStartTime
    );
  }
  // 更新 unlockStatuses Map，锁住该节点
  updatedUnlockStatuses.set(nodeId, {
    nodeId: nodeId,
    unlocked: !lockRoot,
    level: level,
    totalSkillPoints: 0,
    unlockStartTime: lockRoot ? progress.unlockStartTime : null, // Set unlockStartTime to null when locked
  });

  // 递归锁住子节点
  if (node.unlockDependenciesFrom) {
    for (const dep of node.unlockDependenciesFrom) {
      const {
        releasedSkillPoints: childReleased,
        updatedUnlockStatuses: childStatuses,
      } = await lockAndReleaseSkillPoints(dep.toNodeId, progressMap, nodesMap);
      releasedSkillPoints += childReleased;
      // 合并子节点的状态到 updatedUnlockStatuses，自动覆盖旧的状态
      childStatuses.forEach((value, key) => {
        updatedUnlockStatuses.set(key, value); // 使用 set 更新状态
      });
    }
  }

  return { releasedSkillPoints, updatedUnlockStatuses };
}

// 定义节点类型，确保是明确的类型，而不是 any
type NodeType = "BIGCHECK" | "MAJOR_NODE" | "MINOR_NODE";

// 排序函数：按照解锁状态和节点类型排序
function sortNodes(nodes: any[], progressMap: Map<number, any>): any[] {
  const nodeTypeOrder: { [key in NodeType]: number } = {
    BIGCHECK: 1,
    MAJOR_NODE: 2,
    MINOR_NODE: 3,
  };

  return nodes.sort((a: any, b: any) => {
    const progressA = progressMap.get(a.id);
    const progressB = progressMap.get(b.id);

    // 1. 锁住的节点排在已解锁节点之前
    const unlockDiff =
      (progressA?.unlocked ? 1 : 0) - (progressB?.unlocked ? 1 : 0);
    if (unlockDiff !== 0) return unlockDiff;

    // 2. 同样状态下，按节点类型排序：BIGCHECK > MajorNode > MinorNode
    return (
      (nodeTypeOrder[a.nodeType as NodeType] || 4) -
      (nodeTypeOrder[b.nodeType as NodeType] || 4)
    );
  });
}

// 遍历节点并计算状态
async function processNodes(
  nodes: any,
  progressMap: any,
  nodesMap: any,
  unlockStatuses: Map<number, UnlockStatus>
) {
  let totalReleasedSkillPoints = 0;

  // 标记已经处理过的节点
  const processedNodes = new Set<number>();

  // 先对节点排序
  const sortedNodes = sortNodes(nodes, progressMap);

  for (const node of sortedNodes) {
    // 如果节点已被处理过，跳过该节点
    if (processedNodes.has(node.id)) {
      continue;
    }

    // 计算当前节点的解锁状态
    const { unlocked, totalSkillPoints } = await calculateUnlockStatus(
      node,
      progressMap,
      nodesMap
    );

    // 如果节点被锁住并且有子节点，锁住并释放技能点
    const nodeProgress = progressMap.get(node.id);
    if (
      (unlocked && nodeProgress.level === 0) ||
      (!unlocked && nodeProgress.unlockStartTime)
    ) {
      // 如果节点解锁状态(或待解锁状态)，但等级降为0，需要对其子节点进行lockandrelease
      const { releasedSkillPoints, updatedUnlockStatuses } =
        await lockAndReleaseSkillPoints(
          node.id,
          progressMap,
          nodesMap,
          !unlocked
        );

      totalReleasedSkillPoints += releasedSkillPoints;

      // 标记所有递归处理的节点，防止重复处理
      updatedUnlockStatuses.forEach((status, nodeId) => {
        processedNodes.add(nodeId); // 标记处理过的节点
        unlockStatuses.set(nodeId, status); // 更新到 unlockStatuses，覆盖旧的状态
      });
    } else if (!unlocked && nodeProgress) {
      const { releasedSkillPoints, updatedUnlockStatuses } =
        await lockAndReleaseSkillPoints(node.id, progressMap, nodesMap);

      totalReleasedSkillPoints += releasedSkillPoints;

      // 标记所有递归处理的节点，防止重复处理
      updatedUnlockStatuses.forEach((status, nodeId) => {
        processedNodes.add(nodeId); // 标记处理过的节点
        unlockStatuses.set(nodeId, status); // 更新到 unlockStatuses，覆盖旧的状态
      });
    }

    // 将当前节点状态添加到 unlockStatuses
    unlockStatuses.set(node.id, {
      nodeId: node.id,
      unlocked,
      totalSkillPoints,
      level: unlockStatuses.get(node.id)?.level || nodeProgress.level, // level值不作处理
      unlockStartTime: unlockStatuses.get(node.id)?.unlockStartTime || null,
    });

    // 标记当前节点为已处理
    processedNodes.add(node.id);
  }

  return totalReleasedSkillPoints;
}

// 主逻辑函数，执行两次遍历
async function checkUnlockStatus(courseId: number, studentId: number) {
  const nodes = await prisma.node.findMany({
    where: { courseId },
    include: {
      // 本node所依赖的目标node
      unlockDependenciesTo: { include: { fromNode: true } },
      // 依赖本node的所有其他node
      unlockDependenciesFrom: { include: { toNode: true } },
      lockDependenciesFrom: { include: { fromNode: true } },
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

  let unlockStatuses = new Map<number, UnlockStatus>();
  let totalReleasedSkillPoints = 0;

  // 第一次遍历，更新初始的 unlocked 状态
  totalReleasedSkillPoints += await processNodes(
    nodes,
    progressMap,
    nodesMap,
    unlockStatuses
  );

  // 第一次遍历完成后，将 unlockStatuses 的结果回写到 progressMap
  unlockStatuses.forEach((status: any) => {
    const nodeProgress = progressMap.get(status.nodeId);
    if (nodeProgress) {
      nodeProgress.unlocked = status.unlocked;
      nodeProgress.clusterSkillPt = status.totalSkillPoints;
      nodeProgress.level = status.level;
      nodeProgress.unlockStartTime = status.unlockStartTime;
    }
  });

  // 第二次遍历，处理二级连锁的解锁状态
  totalReleasedSkillPoints += await processNodes(
    nodes,
    progressMap,
    nodesMap,
    unlockStatuses
  );

  return { unlockStatuses, totalReleasedSkillPoints };
}

async function calculateUserLevel(currentExp: number) {
  // 获取所有经验等级配置
  const configs = await prisma.experienceConfig.findMany({
    orderBy: { level: "asc" },
  });

  // 找到符合当前经验值的最高等级
  let newLevel = 1;
  for (const config of configs) {
    if (currentExp >= config.expPoints) {
      currentExp -= config.expPoints;
      newLevel = config.level + 1;
    } else {
      break;
    }
  }
  
  const maxLevel = configs[configs.length - 1].level;
  if (newLevel > maxLevel) {
    newLevel = maxLevel;
  }
  return newLevel;
}

async function calculateUserRewardLevel(currentReward: number) {
  const configs = await prisma.rewardConfig.findMany({
    orderBy: { level: "asc" },
  });

  let newLevel = 1;
  for (const config of configs) {
    if (currentReward >= config.rewardPoints) {
      currentReward -= config.rewardPoints;
      newLevel = config.level + 1;
    } else {
      break;
    }
  }
  
  const maxLevel = configs[configs.length - 1].level;
  if (newLevel > maxLevel) {
    newLevel = maxLevel;
  }
  return newLevel;
}

// 创建 API 路由
const router = createRouter<ExtendedNextApiRequest, NextApiResponse>();

// 使用 authMiddleware 中间件，确保请求已通过鉴权
router.use(authMiddleware);

router.put(async (req: ExtendedNextApiRequest, res: NextApiResponse) => {
  const { nodeId, points, studentId } = req.body;

  if (!nodeId || points === undefined || !studentId) {
    return res
      .status(400)
      .json({ message: "nodeId, points, and studentId are required" });
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
      return res.status(404).json({ message: "Node not found" });
    }
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!progress) {
      return res
        .status(404)
        .json({ message: "Progress not found for the given node and student" });
    }

    // 检查节点是否已解锁
    if (!progress.unlocked) {
      return res.status(400).json({
        error: "Node is locked and cannot be leveled up.",
      });
    }

    // Check cooldown
    if (node.coolDown && progress.lastUpgradeTime) {
      const now = new Date();
      const lastUpgradeTime = new Date(progress.lastUpgradeTime);
      const timeSinceLastUpgrade =
        (now.getTime() - lastUpgradeTime.getTime()) / 1000; // in seconds

      if (timeSinceLastUpgrade < node.coolDown) {
        return res.status(400).json({
          error: `Cooldown period not yet passed. Please wait ${
            node.coolDown - timeSinceLastUpgrade
          } more seconds.`,
        });
      }
    }

    // Current skill point level
    const currentNodeLevel = progress.level;
    const maxNodeLevel = node.maxLevel;

    // 计算新的等级
    const newNodeLevel = currentNodeLevel + points;

    // 检查新等级是否合法
    if (newNodeLevel < 0) {
      return res.status(400).json({
        error: "Cannot reduce skill points. Level cannot be below 0.",
      });
    } else if (newNodeLevel > maxNodeLevel) {
      return res.status(400).json({
        error: `Cannot add skill points. Max level of ${maxNodeLevel} reached.`,
      });
    }

    // 检查学生是否有足够的技能点来增加等级
    if (points > 0 && user.skillPt && user.skillPt < points) {
      return res
        .status(400)
        .json({ message: "Not enough skill points to add to this node." });
    }

    // 如果没有历史记录，则增加经验值和奖励点数
    let expGained = 0;
    let rewardGained = 0;
    expGained = node.exp || 0;
    rewardGained = node.rewardPt || 0;

    // 更新用户的经验值和奖励点数
    const newExp = user.experience + expGained;
    const newLevel = await calculateUserLevel(newExp);
    const newRewardPoint = user.rewardPoints + rewardGained;
    const newRewardLevel = await calculateUserRewardLevel(newRewardPoint);

    // 检查是否已经记录过升级历史
    const upgradeHistory = await prisma.nodeUpgradeHistory.findUnique({
      where: {
        userId_nodeId_level: {
          userId: Number(studentId),
          nodeId: Number(nodeId),
          level: newNodeLevel,
        },
      },
    });

    if (!upgradeHistory && points > 0) {
      // 插入升级历史
      await prisma.nodeUpgradeHistory.create({
        data: {
          userId: Number(studentId),
          nodeId: Number(nodeId),
          level: newNodeLevel,
        },
      });

      await prisma.user.update({
        where: { id: Number(studentId) },
        data: {
          experience: newExp,
          experienceLevel: newLevel,
          rewardPoints: newRewardPoint,
          rewardLevel: newRewardLevel,
        },
      });
    }

    // 更新节点的进度
    await prisma.courseProgress.update({
      where: {
        userId_nodeId: {
          userId: Number(studentId),
          nodeId: Number(nodeId),
        },
      },
      data: {
        level: newNodeLevel,
        lastUpgradeTime: new Date(), // Update last upgrade time
      },
    });

    // 检查解锁状态并更新课程进度
    const { unlockStatuses, totalReleasedSkillPoints } =
      await checkUnlockStatus(node.courseId, studentId);

    // 计算最终的技能点数变化：原来的 points 加上 totalReleasedSkillPoints
    const finalPoints = points - totalReleasedSkillPoints;

    // 更新学生的技能点数
    await prisma.user.update({
      where: { id: Number(studentId) },
      data: {
        skillPt: {
          decrement: finalPoints,
        },
      },
    });

    const updatedUnlockStatusArray = Array.from(unlockStatuses.values());

    await Promise.all(
      updatedUnlockStatusArray.map((status) =>
        prisma.courseProgress.update({
          where: {
            userId_nodeId: {
              userId: Number(studentId),
              nodeId: status.nodeId,
            },
          },
          data: {
            unlocked: status.unlocked,
            level: status.level,
            clusterSkillPt: status.totalSkillPoints,
            unlockStartTime: status.unlockStartTime,
          },
        })
      )
    );

    res.status(200).json({
      message: `Skill point ${points > 0 ? "added" : "reduced"} successfully`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Failed to modify skill points: ${error}` });
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
