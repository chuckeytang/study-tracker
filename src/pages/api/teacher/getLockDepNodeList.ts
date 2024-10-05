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

    let availableNodes: any = [];

    // 规则1: BigCheck节点没有会被锁住的节点
    if (currentNode.nodeType === NodeType.BIGCHECK) {
      availableNodes = [];
    }

    // 规则2: MajorNode解锁后，依赖同一个BigCheck的兄弟MajorNode会被锁住
    else if (currentNode.nodeType === NodeType.MAJOR_NODE) {
      // 找到依赖于同一 BigCheck 的兄弟 MajorNode
      const connectedBigCheck = await prisma.unlockDependency.findFirst({
        where: {
          fromNodeId: Number(nodeId),
          fromNode: { nodeType: NodeType.BIGCHECK },
        },
        select: { toNodeId: true },
      });

      if (!connectedBigCheck) {
        availableNodes = [];
      } else {
        availableNodes = await prisma.node.findMany({
          where: {
            nodeType: NodeType.MAJOR_NODE,
            id: { not: Number(nodeId) }, // 排除自身
            unlockDependenciesTo: {
              some: {
                fromNodeId: connectedBigCheck.toNodeId, // 依赖同一个 BigCheck
              },
            },
          },
        });
      }
    }

    // 规则3: MinorNode解锁后，依赖同一父节点（MajorNode 或其他 MinorNode）的兄弟 MinorNode 会被锁住
    else if (currentNode.nodeType === NodeType.MINOR_NODE) {
      // 找到与该 MinorNode 共享相同父节点的兄弟 MinorNode
      const parentNode = await prisma.unlockDependency.findFirst({
        where: {
          fromNodeId: Number(nodeId),
        },
        select: { toNodeId: true },
      });

      if (!parentNode) {
        availableNodes = [];
      } else {
        availableNodes = await prisma.node.findMany({
          where: {
            nodeType: NodeType.MINOR_NODE,
            id: { not: Number(nodeId) }, // 排除自身
            unlockDependenciesTo: {
              some: {
                fromNodeId: parentNode.toNodeId, // 依赖相同父节点
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
