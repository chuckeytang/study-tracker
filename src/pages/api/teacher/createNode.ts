import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, NodeType } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    name,
    description,
    nodeType,
    courseId,
    maxLevel,
    iconUrl,
    unlockDepNodes,
    unlockDepNodeCount,
    lockDepNodes,
    lockDepNodeCount,
  } = req.body;

  // 验证基本参数
  if (!name || !nodeType || !courseId || maxLevel === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // 默认解锁和锁住依赖的节点数处理
    const computedUnlockDepNodeCount =
      unlockDepNodeCount !== undefined ? unlockDepNodeCount : -1;
    const computedLockDepNodeCount =
      lockDepNodeCount !== undefined ? lockDepNodeCount : -1;

    // 创建节点
    const createdNode = await prisma.node.create({
      data: {
        name,
        description,
        nodeType: nodeType as NodeType,
        courseId: Number(courseId),
        maxLevel: Number(maxLevel),
        iconUrl: iconUrl || "", // 默认空字符串
        unlockDepNodeCount: computedUnlockDepNodeCount,
        lockDepNodeCount: computedLockDepNodeCount,
      },
    });

    // 更新解锁依赖节点关系
    if (unlockDepNodes && unlockDepNodes.length > 0) {
      await prisma.unlockDependency.createMany({
        data: unlockDepNodes.map((depNodeId: number) => ({
          fromNodeId: createdNode.id,
          toNodeId: depNodeId,
        })),
      });
    }

    // 更新锁住依赖节点关系
    if (lockDepNodes && lockDepNodes.length > 0) {
      await prisma.lockDependency.createMany({
        data: lockDepNodes.map((depNodeId: number) => ({
          fromNodeId: createdNode.id,
          toNodeId: depNodeId,
        })),
      });
    }

    res.status(201).json({ data: createdNode });
  } catch (error) {
    res.status(500).json({ error: `Failed to create node: ${error}` });
  }
}
