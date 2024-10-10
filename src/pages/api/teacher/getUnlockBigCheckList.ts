// pages/api/teacher/getUnlockBigCheckList.ts
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, NodeType } from "@prisma/client";

const prisma = new PrismaClient();

// 递归函数：获取整个依赖链中的所有 BIGCHECK 节点
async function getBigCheckDependencyChain(
  nodeId: number,
  visitedNodes = new Set<number>()
) {
  if (visitedNodes.has(nodeId)) {
    return []; // 避免循环依赖
  }

  visitedNodes.add(nodeId);

  // 获取与当前节点相关的所有解锁依赖关系
  const dependencies = await prisma.unlockDependency.findMany({
    where: {
      fromNodeId: nodeId,
      toNode: { nodeType: NodeType.BIGCHECK },
    },
    select: { toNodeId: true },
  });

  // 提取 fromNodeId，并递归获取它们的依赖链
  const dependentNodeIds = dependencies.map((dep) => dep.toNodeId);

  const recursiveResults: any = await Promise.all(
    dependentNodeIds.map((id) => getBigCheckDependencyChain(id, visitedNodes))
  );

  return [...dependentNodeIds, ...recursiveResults.flat()];
}

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

    // 获取当前节点的依赖链中的所有 BIGCHECK 节点
    const bigCheckDependencyChain = await getBigCheckDependencyChain(
      Number(nodeId)
    );

    // 获取所有的 BIGCHECK 节点
    const allBigCheckNodes = await prisma.node.findMany({
      where: { nodeType: NodeType.BIGCHECK, id: { not: Number(nodeId) } },
      select: { id: true, name: true, description: true, maxLevel: true },
    });

    // 获取所有 BIGCHECK 的依赖关系中的 fromNodeId
    const bigCheckDependencies = await prisma.unlockDependency.findMany({
      where: {
        fromNode: { nodeType: NodeType.BIGCHECK },
        toNode: { nodeType: NodeType.BIGCHECK },
      },
      select: {
        fromNodeId: true,
      },
    });

    // 提取 fromNodeId 集合
    const fromNodeIds = bigCheckDependencies.map((dep) => dep.fromNodeId);

    // 合并 fromNodeIds 和当前节点依赖链中的所有节点
    const nodesToExclude = new Set([
      ...fromNodeIds,
      ...bigCheckDependencyChain,
    ]);

    // 从所有的 BIGCHECK 节点中排除那些已经存在于依赖链中的节点
    const availableNodes = allBigCheckNodes.filter(
      (node) => !nodesToExclude.has(node.id)
    );

    res.status(200).json({ data: availableNodes });
  } catch (error) {
    res.status(500).json({
      error: `Failed to fetch unlock BIGCHECK nodes: ${error}`,
    });
  }
}
