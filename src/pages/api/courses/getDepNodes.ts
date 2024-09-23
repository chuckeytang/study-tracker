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
    // 查询与 bigcheck 节点相关联的 majornode 和 minornode，通过 UnlockDependency 表
    const clusterNodes = await prisma.node.findMany({
      where: {
        unlockDependenciesTo: {
          some: {
            fromNodeId: Number(nodeId), // 查询解锁依赖该 bigcheck 节点的 majornode 和 minornode
          },
        },
      },
    });

    // 返回数据
    res.status(200).json({
      data: clusterNodes.map((node) => ({
        nodeId: node.id,
        nodeName: node.name,
        nodeDescription: node.description,
        nodeType: node.nodeType, // 可以是 MAJOR_NODE 或 MINOR_NODE
        maxLevel: node.maxLevel,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch cluster nodes: ${error}` });
  }
}
