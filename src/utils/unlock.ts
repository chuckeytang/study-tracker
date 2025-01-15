import prisma from "@/lib/prisma";

export async function calculateUnlockStatus(
  node: any,
  progressMap: Map<number, any>,
  nodesMap: Map<number, any>
) {
  let unlocked = false;
  let totalSkillPoints = 0;

  if (node.nodeType === "BIGCHECK") {
    if (node.unlockDependenciesTo.length === 0) {
      unlocked = true; // No dependencies, directly unlocked
    } else if (node.unlockType === "CLUSTER_TOTAL_SKILL_POINT") {
      totalSkillPoints = await Promise.all(
        node.unlockDependenciesTo.map(async (dep: any) => {
          return await calculateTotalSkillPoints(
            dep.fromNodeId,
            progressMap,
            nodesMap
          );
        })
      ).then((results) => results.reduce((sum, points) => sum + points, 0));

      if (totalSkillPoints >= (node.unlockDepClusterTotalSkillPt || 0)) {
        unlocked = true;
      }
    } else if (node.unlockType === "TIME_BASED") {
      const allDependenciesUnlocked = node.unlockDependenciesTo.every(
        (dep: any) => {
          const depProgress = progressMap.get(dep.fromNodeId);
          return depProgress && depProgress.unlocked;
        }
      );

      if (allDependenciesUnlocked) {
        unlocked = false;       // 依赖节点未解锁，需要等待倒计时结束才能解锁
        // Set unlockStartTime if not already set
        const nodeProgress = progressMap.get(node.id);
        if (nodeProgress.unlocked) {
          // 如果已经解锁，则不需要做什么了
          unlocked = true;
        }
        else if (nodeProgress && !nodeProgress.unlockStartTime) {
          nodeProgress.unlockStartTime = new Date();
        }
        else {
          const unlockDepTimeInterval = node.unlockDepTimeInterval || 0;
          const now = new Date();
          if (nodeProgress && nodeProgress.unlockStartTime) {
            const unlockEndTime = new Date(nodeProgress.unlockStartTime.getTime() + unlockDepTimeInterval);
            if (now >= unlockEndTime) {
              unlocked = true; // Unlock the node if the time interval has passed
              nodeProgress.unlockStartTime = null; // Reset unlockStartTime
            }
          }
        }
      }
      else {
        unlocked = false;
        const nodeProgress = progressMap.get(node.id);
        if (nodeProgress) {
          nodeProgress.unlockStartTime = null;
        }
      }
    }
  } else {
    // MAJOR_NODE or MINOR_NODE unlock dependencies
    if (node.unlockType === "SKILL_POINT") {
      unlocked = node.unlockDependenciesTo.every((dep: any) => {
        const depProgress = progressMap.get(dep.fromNodeId);
        return depProgress && depProgress.unlocked && depProgress.level > 0;
      });
    }
    else if (node.unlockType === "TIME_BASED") {
      const allDependenciesUnlocked = node.unlockDependenciesTo.every(
        (dep: any) => {
          const depProgress = progressMap.get(dep.fromNodeId);
          return depProgress && depProgress.unlocked && depProgress.level > 0;
        }
      );

      if (allDependenciesUnlocked) {
        unlocked = false;       // 依赖节点未解锁，需要等待倒计时结束才能解锁
        // Set unlockStartTime if not already set
        const nodeProgress = progressMap.get(node.id);
        if (nodeProgress.unlocked) {
          // 如果已经解锁，则不需要做什么了
          unlocked = true;
        }
        else if (nodeProgress && !nodeProgress.unlockStartTime) {
          nodeProgress.unlockStartTime = new Date();
        }
        else {
          const unlockDepTimeInterval = node.unlockDepTimeInterval || 0;
          const now = new Date();
          if (nodeProgress && nodeProgress.unlockStartTime) {
            const unlockEndTime = new Date(nodeProgress.unlockStartTime.getTime() + unlockDepTimeInterval*1000);
            if (now >= unlockEndTime) {
              unlocked = true; // Unlock the node if the time interval has passed
              nodeProgress.unlockStartTime = null; // Reset unlockStartTime
            }
          }
        }
      }
      else {
        unlocked = false;
        const nodeProgress = progressMap.get(node.id);
        if (nodeProgress) {
          nodeProgress.unlockStartTime = null;
        }
      }
    }
  }

  return { unlocked, totalSkillPoints };
}

async function calculateTotalSkillPoints(
  nodeId: number,
  progressMap: Map<number, any>,
  nodesMap: Map<number, any>
) {
  const node = nodesMap.get(nodeId);
  const progress = progressMap.get(nodeId);
  let totalSkillPoints = progress ? progress.level : 0;

  if (!node || node.nodeType === "BIGCHECK") {
    totalSkillPoints = 0;
  }

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