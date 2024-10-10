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
    fromNodeId,
    toNodeId,
    unlockDepNodeCount,
    unlockDepClusterTotalSkillPt,
    lockDepNodeCount,
  } = req.body;

  // 验证是否提供了 BigCheck 节点的 ID
  if (!fromNodeId || !toNodeId) {
    return res
      .status(400)
      .json({ error: "Both fromNodeId and toNodeId are required" });
  }

  try {
    // 1. 验证两个节点是否都是 BigCheck 类型
    const [fromNode, toNode] = await Promise.all([
      prisma.node.findUnique({
        where: { id: Number(fromNodeId) },
        select: { id: true, nodeType: true },
      }),
      prisma.node.findUnique({
        where: { id: Number(toNodeId) },
        select: { id: true, nodeType: true },
      }),
    ]);

    if (!fromNode || fromNode.nodeType !== NodeType.BIGCHECK) {
      return res
        .status(400)
        .json({ error: "fromNodeId is not a valid BigCheck node" });
    }

    if (!toNode || toNode.nodeType !== NodeType.BIGCHECK) {
      return res
        .status(400)
        .json({ error: "toNodeId is not a valid BigCheck node" });
    }

    // 2. 检查是否已经存在解锁依赖，且依赖的都是 BigCheck 类型节点
    let existingDependency = await prisma.unlockDependency.findFirst({
      where: {
        fromNodeId: Number(fromNodeId),
        toNode: {
          nodeType: NodeType.BIGCHECK, // 只检查关联的 BigCheck 节点
        },
      },
    });

    if (existingDependency) {
      return res.status(400).json({
        error:
          "fromNodeId already has an unlock dependency for another BigCheck node",
      });
    }

    existingDependency = await prisma.unlockDependency.findFirst({
      where: {
        toNodeId: Number(toNodeId),
        fromNode: {
          nodeType: NodeType.BIGCHECK, // 只检查关联的 BigCheck 节点
        },
      },
    });

    if (existingDependency) {
      return res.status(400).json({
        error: "toNodeId already has an existing unlock dependency",
      });
    }

    // 3. 创建新的解锁依赖关系
    const newDependency = await prisma.unlockDependency.create({
      data: {
        fromNodeId: Number(fromNodeId),
        toNodeId: Number(toNodeId),
      },
    });

    // 4. 更新解锁和锁住依赖节点的数量
    await prisma.node.update({
      where: { id: Number(toNodeId) },
      data: {
        unlockDepNodeCount: Number(unlockDepNodeCount || 0),
        unlockDepClusterTotalSkillPt: Number(unlockDepClusterTotalSkillPt || 0),
        lockDepNodeCount: Number(lockDepNodeCount || 0),
      },
    });

    res.status(200).json({
      success: true,
      message: "BigCheck nodes connected successfully",
      data: newDependency,
    });
  } catch (error) {
    console.error("Error connecting BigCheck nodes:", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
}
