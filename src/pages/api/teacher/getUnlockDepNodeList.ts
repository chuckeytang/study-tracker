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

    // 规则1: BigCheck类型节点
    if (currentNode.nodeType === NodeType.BIGCHECK) {
      availableNodes = await prisma.node.findMany({
        where: {
          OR: [
            {
              nodeType: NodeType.MAJOR_NODE,
              unlockDependenciesTo: {
                some: { fromNode: { nodeType: NodeType.BIGCHECK } }, // MajorNode 依赖于 BigCheck
              },
            },
            {
              nodeType: NodeType.MINOR_NODE,
              unlockDependenciesTo: {
                some: { fromNode: { nodeType: NodeType.MAJOR_NODE } }, // MinorNode 依赖于 MajorNode
              },
            },
          ],
        },
      });
    }

    // 规则2: MajorNode类型节点
    else if (currentNode.nodeType === NodeType.MAJOR_NODE) {
      availableNodes = await prisma.node.findMany({
        where: {
          nodeType: NodeType.BIGCHECK,
        },
      });
    }

    // 规则3: MinorNode类型节点
    else if (currentNode.nodeType === NodeType.MINOR_NODE) {
      availableNodes = await prisma.node.findMany({
        where: {
          OR: [
            {
              nodeType: NodeType.MAJOR_NODE,
              unlockDependenciesTo: {
                some: { fromNode: { nodeType: NodeType.BIGCHECK } }, // MajorNode必须已经配置了 BigCheck 依赖
              },
            },
            {
              nodeType: NodeType.MINOR_NODE,
              unlockDependenciesTo: {
                some: {
                  fromNode: {
                    OR: [
                      { nodeType: NodeType.MAJOR_NODE }, // MinorNode 依赖于 MajorNode
                      { nodeType: NodeType.MINOR_NODE }, // MinorNode 依赖于其他 MinorNode
                    ],
                  },
                },
              },
            },
          ],
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
