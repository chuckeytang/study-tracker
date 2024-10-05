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

    // 规则 1: BigCheck 类型节点
    if (currentNode.nodeType === NodeType.BIGCHECK) {
      availableNodes = await prisma.node.findMany({
        where: {
          nodeType: NodeType.MAJOR_NODE,
          // 排除已经依赖于其他 BigCheck 的 MajorNode 节点
          unlockDependenciesTo: {
            none: {
              fromNode: { nodeType: NodeType.BIGCHECK },
            },
          },
        },
      });
    }

    // 规则 2: MajorNode 类型节点
    else if (currentNode.nodeType === NodeType.MAJOR_NODE) {
      availableNodes = await prisma.node.findMany({
        where: {
          nodeType: NodeType.MINOR_NODE,
          // 排除已经依赖于其他 MajorNode 或 MinorNode 的 MinorNode 节点
          unlockDependenciesTo: {
            none: {
              fromNode: {
                nodeType: {
                  in: [NodeType.MAJOR_NODE, NodeType.MINOR_NODE],
                },
              },
            },
          },
        },
      });
    }

    // 规则 3: MinorNode 类型节点
    else if (currentNode.nodeType === NodeType.MINOR_NODE) {
      availableNodes = await prisma.node.findMany({
        where: {
          nodeType: NodeType.MINOR_NODE,
          // 排除已经依赖于其他 MajorNode 或 MinorNode 的 MinorNode 节点
          unlockDependenciesTo: {
            none: {
              fromNode: {
                nodeType: {
                  in: [NodeType.MAJOR_NODE, NodeType.MINOR_NODE],
                },
              },
            },
          },
        },
      });
    }

    res.status(200).json({ data: availableNodes });
  } catch (error) {
    res
      .status(500)
      .json({ error: `Failed to fetch unlock dependency nodes: ${error}` });
  }
}
