// pages/api/teacher/getAlreadyLockDepNodeList.ts
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { nodeId } = req.query;

  if (!nodeId) {
    return res.status(400).json({ error: "nodeId is required" });
  }

  try {
    // 查询当前节点已经设置的 lockDependencies
    const currentNode = await prisma.node.findUnique({
      where: { id: Number(nodeId) },
      include: {
        lockDependenciesFrom: {
          include: {
            toNode: true, // 查询锁住该节点的所有目标节点信息
          },
        },
      },
    });

    if (!currentNode) {
      return res.status(404).json({ error: "Node not found" });
    }

    // 提取已锁住的节点
    const alreadyLockedNodes = currentNode.lockDependenciesFrom.map((dep) => ({
      nodeId: dep.toNode.id,
      nodeName: dep.toNode.name,
      nodeDescription: dep.toNode.description,
      nodeType: dep.toNode.nodeType,
      maxLevel: dep.toNode.maxLevel,
    }));

    res.status(200).json({ data: alreadyLockedNodes });
  } catch (error) {
    res.status(500).json({
      error: `Failed to fetch already locked dependency nodes: ${error}`,
    });
  }
}
