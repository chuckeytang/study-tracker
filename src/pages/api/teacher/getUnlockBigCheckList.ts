// pages/api/teacher/getUnlockBigCheckList.ts
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, NodeType } from "@prisma/client";

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
    // 获取当前节点的信息
    const currentNode = await prisma.node.findUnique({
      where: { id: Number(nodeId) },
      select: { id: true, nodeType: true },
    });

    if (!currentNode) {
      return res.status(404).json({ error: "Node not found" });
    }

    // 仅在当前节点类型为 BIGCHECK 时处理
    if (currentNode.nodeType !== NodeType.BIGCHECK) {
      return res.status(400).json({
        error: "This API is only applicable for nodes of type BIGCHECK",
      });
    }

    // 查找其他的 BIGCHECK 节点
    const availableNodes = await prisma.node.findMany({
      where: {
        nodeType: NodeType.BIGCHECK,
        id: { not: currentNode.id }, // 排除当前节点
        // 排除已经有依赖的 BIGCHECK 节点
        AND: [
          {
            unlockDependenciesFrom: { none: {} }, // 没有依赖于其他节点
          },
          {
            unlockDependenciesTo: { none: {} }, // 没有其他节点依赖于它
          },
        ],
      },
    });

    res.status(200).json({ data: availableNodes });
  } catch (error) {
    res.status(500).json({
      error: `Failed to fetch unlock BIGCHECK nodes: ${error}`,
    });
  }
}
