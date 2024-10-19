import { PrismaClient } from "@prisma/client";
import { createRouter } from "next-connect";
import { authMiddleware } from "@/utils/auth"; // 引入 authMiddleware
import { ExtendedNextApiRequest } from "@/types/ExtendedNextApiRequest";
import { NextApiResponse } from "next";

const prisma = new PrismaClient();

// 创建 API 路由
const router = createRouter<ExtendedNextApiRequest, NextApiResponse>();

// 使用 authMiddleware 中间件，确保请求已通过鉴权
router.use(authMiddleware);

router.get(async (req: ExtendedNextApiRequest, res: NextApiResponse) => {
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
