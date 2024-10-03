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
      select: { id: true, nodeType: true, unlockDepNodes: true },
    });

    if (!currentNode) {
      return res.status(404).json({ error: "Node not found" });
    }

    let availableNodes: any = [];

    // 规则1: 如果是BigCheck类型，返回空
    if (currentNode.nodeType === NodeType.BIGCHECK) {
      availableNodes = []; // BigCheck没有可以锁住它的节点
    }

    // 规则2: 如果是MajorNode类型
    else if (currentNode.nodeType === NodeType.MAJOR_NODE) {
      // 获取与其解锁依赖相连的BigCheck节点
      const connectedBigChecks = currentNode.unlockDepNodes.filter(
        (node) => node.nodeType === NodeType.BIGCHECK
      );

      if (connectedBigChecks.length === 0) {
        availableNodes = []; // 没有相连的BigCheck，返回空
      } else {
        // 查询与相连BigCheck周围的其他MajorNode
        availableNodes = await prisma.node.findMany({
          where: {
            nodeType: NodeType.MAJOR_NODE,
            unlockDepNodes: {
              some: {
                nodeType: NodeType.BIGCHECK,
                id: { in: connectedBigChecks.map((bc) => bc.id) },
              },
            },
          },
        });
      }
    }

    // 规则3: 如果是MinorNode类型
    else if (currentNode.nodeType === NodeType.MINOR_NODE) {
      // 获取与其解锁依赖相连的MajorNode或者MinorNode
      const connectedNodes = currentNode.unlockDepNodes.filter(
        (node) =>
          node.nodeType === NodeType.MAJOR_NODE ||
          node.nodeType === NodeType.MINOR_NODE
      );

      if (connectedNodes.length === 0) {
        availableNodes = []; // 没有相连的MajorNode或者MinorNode，返回空
      } else {
        // 查询与相连MajorNode或者MinorNode周围的其他MinorNode
        availableNodes = await prisma.node.findMany({
          where: {
            nodeType: NodeType.MINOR_NODE,
            unlockDepNodes: {
              some: {
                nodeType: { in: [NodeType.MAJOR_NODE, NodeType.MINOR_NODE] },
                id: { in: connectedNodes.map((n) => n.id) },
              },
            },
          },
        });
      }
    }

    res.status(200).json({ data: availableNodes });
  } catch (error) {
    res.status(500).json({
      error: `Failed to fetch lock dependency nodes: ${error}`,
    });
  }
}