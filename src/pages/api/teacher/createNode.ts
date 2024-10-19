import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, NodeType } from "@prisma/client";
import { upload } from "@/lib/middleware/multer";
import { createRouter } from "next-connect";
import { runMiddleware } from "@/lib/middleware/runMiddleware";
import { ExtendedNextApiRequest } from "@/types/ExtendedNextApiRequest";
import { AppError } from "@/types/AppError";
import { authMiddleware } from "@/utils/auth";

const prisma = new PrismaClient();

// 使用 createRouter 创建 API 路由
const router = createRouter<ExtendedNextApiRequest, NextApiResponse>();

// 使用 authMiddleware 中间件，确保请求已通过鉴权
router.use(authMiddleware);

// POST 请求处理逻辑
router.post(async (req: ExtendedNextApiRequest, res: NextApiResponse) => {
  try {
    // 手动运行 multer 中间件来处理文件上传
    await runMiddleware(req, res, upload.single("icon"));

    const {
      name,
      description,
      nodeType,
      courseId,
      maxLevel,
      unlockDepNodeCount,
      unlockDepClusterTotalSkillPt,
      lockDepNodeCount,
    } = req.body;

    // 解析 unlockDepNodes 和 lockDepNodes 字段
    const unlockDepNodes = req.body.unlockDepNodes
      ? JSON.parse(req.body.unlockDepNodes)
      : [];
    const lockDepNodes = req.body.lockDepNodes
      ? JSON.parse(req.body.lockDepNodes)
      : [];

    const file = req.file;
    const iconUrl = file ? `/uploads/${file.filename}` : null; // 生成 iconUrl

    // 验证基本参数
    if (!name || !nodeType || !courseId || maxLevel === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 默认解锁和锁住依赖的节点数处理
    const computedUnlockDepNodeCount =
      unlockDepNodeCount !== undefined ? Number(unlockDepNodeCount) : 0;
    const computedUnlockDepClusterTotalSkillPt =
      unlockDepClusterTotalSkillPt !== undefined
        ? Number(unlockDepClusterTotalSkillPt)
        : 0;
    const computedLockDepNodeCount =
      lockDepNodeCount !== undefined ? Number(lockDepNodeCount) : 0;

    // 创建节点
    const createdNode = await prisma.node.create({
      data: {
        name,
        description,
        nodeType: nodeType as NodeType,
        courseId: Number(courseId),
        maxLevel: Number(maxLevel),
        iconUrl: iconUrl || "", // 使用上传的文件路径或默认空字符串
        unlockDepNodeCount: computedUnlockDepNodeCount,
        unlockDepClusterTotalSkillPt: computedUnlockDepClusterTotalSkillPt,
        lockDepNodeCount: computedLockDepNodeCount,
      },
    });

    // 更新解锁依赖节点关系
    if (unlockDepNodes && unlockDepNodes.length > 0) {
      await prisma.unlockDependency.createMany({
        data: unlockDepNodes.map((depNodeId: number) => ({
          fromNodeId: Number(depNodeId),
          toNodeId: createdNode.id,
        })),
      });
    }

    // 更新锁住依赖节点关系
    if (lockDepNodes && lockDepNodes.length > 0) {
      await prisma.lockDependency.createMany({
        data: lockDepNodes.map((depNodeId: number) => ({
          fromNodeId: Number(depNodeId),
          toNodeId: createdNode.id,
        })),
      });
    }

    res.status(201).json({ data: createdNode });
  } catch (error) {
    res.status(500).json({ error: `Failed to create node: ${error}` });
  }
});

// 错误处理
export default router.handler({
  onError: (err: unknown, req, res) => {
    if (err instanceof AppError) {
      console.error(err.stack);
      res.status(err.statusCode).end(err.message);
    } else if (err instanceof Error) {
      console.error(err.stack);
      res.status(500).end("An unexpected error occurred");
    } else {
      res.status(500).end("An unexpected error occurred");
    }
  },
  onNoMatch: (req, res) => {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

// 禁用默认 body 解析
export const config = {
  api: {
    bodyParser: false,
  },
};
