import { PrismaClient } from "@prisma/client";
import { createRouter } from "next-connect";
import { authMiddleware } from "@/utils/auth";
import { ExtendedNextApiRequest } from "@/types/ExtendedNextApiRequest";
import { NextApiResponse } from "next";

const prisma = new PrismaClient();

// 创建 API 路由
const router = createRouter<ExtendedNextApiRequest, NextApiResponse>();

// 使用 authMiddleware 中间件，确保请求已通过鉴权
router.use(authMiddleware);

router.get(async (req: ExtendedNextApiRequest, res: NextApiResponse) => {
  const { courseId } = req.query;

  if (!courseId) {
    return res.status(400).json({ error: "courseId is required" });
  }

  try {
    // 查询该课程下所有的bigcheck节点
    const bigCheckNodes = await prisma.node.findMany({
      where: {
        courseId: Number(courseId),
        nodeType: "BIGCHECK", // 仅返回bigcheck类型的节点
      },
      include: {
        unlockDependenciesTo: {
          include: {
            fromNode: true, // 获取解锁依赖的节点信息
          },
        },
      },
    });

    // 查询所有与这些 bigcheck 节点相关的依赖关系
    const dependencies = await prisma.unlockDependency.findMany({
      where: {
        toNodeId: {
          in: bigCheckNodes.map((node) => node.id),
        },
      },
      include: {
        fromNode: true,
        toNode: true,
      },
    });

    // 构造依赖链表结构
    const nodeMap: { [key: number]: any } = {}; // 存储每个节点信息
    const fromNodeMap: { [key: number]: number } = {}; // 记录 fromNodeId 到 toNodeId 的映射
    const toNodeMap: { [key: number]: number } = {}; // 记录 toNodeId 到 fromNodeId 的映射

    // 将所有节点存入 nodeMap 中，并保留 unlockDependencies 信息
    bigCheckNodes.forEach((node) => {
      nodeMap[node.id] = {
        nodeId: node.id,
        nodeName: node.name,
        nodeDescription: node.description,
        maxLevel: node.maxLevel,
        nodeType: node.nodeType,
        picUrl: node.iconUrl,
        lockDepNodeCount: node.lockDepNodeCount,
        unlockDepNodeCount: node.unlockDepNodeCount,
        unlockDepClusterTotalSkillPt: node.unlockDepClusterTotalSkillPt,
        unlockDependencies: node.unlockDependenciesTo.map((dep) => ({
          nodeId: dep.fromNode.id,
          nodeName: dep.fromNode.name,
          nodeDescription: dep.fromNode.description,
          nodeType: dep.fromNode.nodeType,
          maxLevel: dep.fromNode.maxLevel,
        })),
      };
    });

    // 将所有依赖关系记录到 fromNodeMap 和 toNodeMap 中
    dependencies.forEach((dep) => {
      fromNodeMap[dep.fromNodeId] = dep.toNodeId;
      toNodeMap[dep.toNodeId] = dep.fromNodeId;
    });

    // 找到起始节点（没有依赖它的节点，即 toNodeId 不在 fromNodeId 列表中的节点）
    const startNodes = bigCheckNodes.filter((node) => !toNodeMap[node.id]);

    const orderedNodes: any = [];

    // 递归查找并排序依赖链表
    const buildNodeList = (nodeId: number) => {
      let currentNode = nodeMap[nodeId];
      orderedNodes.push(currentNode);
      // 查找下一个依赖的节点
      while (fromNodeMap[currentNode.nodeId]) {
        const nextNodeId = fromNodeMap[currentNode.nodeId];
        currentNode = nodeMap[nextNodeId];
        orderedNodes.push(currentNode);
      }
    };

    // 遍历所有起始节点并构建链表
    startNodes.forEach((startNode) => {
      buildNodeList(startNode.id);
    });

    // 返回排好序的节点，同时保留 unlockDependencies 信息
    res.status(200).json({
      data: orderedNodes,
    });
  } catch (error) {
    console.error("Error fetching and sorting bigcheck nodes:", error);
    res.status(500).json({
      error: `Failed to fetch and sort bigcheck nodes: ${error}`,
    });
  }
});

// 错误处理
export default router.handler({
  onError: (err, req, res) => {
    res.status(500).json({ error: `An error occurred: ${err}` });
  },
  onNoMatch: (req, res) => {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});
