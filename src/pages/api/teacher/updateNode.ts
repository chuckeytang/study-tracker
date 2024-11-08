import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, NodeType } from "@prisma/client";
import { upload } from "@/lib/middleware/multer";
import { createRouter } from "next-connect";
import { runMiddleware } from "@/lib/middleware/runMiddleware";
import { ExtendedNextApiRequest } from "@/types/ExtendedNextApiRequest";
import { AppError } from "@/types/AppError";
import { authMiddleware } from "@/utils/auth";

import prisma from "@/lib/prisma";

// 使用 createRouter 创建 API 路由
const router = createRouter<ExtendedNextApiRequest, NextApiResponse>();

// 使用 authMiddleware 中间件，确保请求已通过鉴权
router.use(authMiddleware);

// PUT 请求处理逻辑
router.put(async (req: ExtendedNextApiRequest, res: NextApiResponse) => {
  try {
    // 手动运行 multer 中间件来处理文件上传
    await runMiddleware(req, res, upload.single("icon"));

    const {
      id,
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

    const host = req.headers.host || process.env.NEXT_PUBLIC_BASE_URL;
    const protocol = req.headers["x-forwarded-proto"] || "http";
    let iconUrl;

    if (file) {
      // 使用 API 路由提供图片
      iconUrl = `${protocol}://${host}/api/uploads/${file.filename}`;
    }

    // 验证基本参数
    if (!id || !name || !nodeType || !courseId || maxLevel === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 默认解锁和锁住依赖的节点数处理
    const computedUnlockDepNodeCount =
      unlockDepNodeCount !== undefined ? unlockDepNodeCount : 0;
    const computedUnlockDepClusterTotalSkillPt =
      unlockDepClusterTotalSkillPt !== undefined
        ? Number(unlockDepClusterTotalSkillPt)
        : 0;
    const computedLockDepNodeCount =
      lockDepNodeCount !== undefined ? lockDepNodeCount : 0;

    // 更新节点
    const updatedNode = await prisma.node.update({
      where: { id: Number(id) },
      data: {
        name,
        description,
        nodeType: nodeType as NodeType,
        courseId: Number(courseId),
        maxLevel: Number(maxLevel),
        iconUrl: iconUrl || undefined, // 如果有上传文件则更新 iconUrl
        unlockDepNodeCount: Number(computedUnlockDepNodeCount),
        unlockDepClusterTotalSkillPt: Number(
          computedUnlockDepClusterTotalSkillPt
        ),
        lockDepNodeCount: Number(computedLockDepNodeCount),
      },
    });

    // 更新解锁依赖节点关系
    if (unlockDepNodes && unlockDepNodes.length > 0) {
      for (const depNodeId of unlockDepNodes) {
        try {
          // 尝试创建依赖关系，如果已经存在则跳过
          await prisma.unlockDependency.create({
            data: {
              fromNodeId: updatedNode.id,
              toNodeId: Number(depNodeId),
            },
          });
        } catch (error: any) {
          // 如果是违反唯一约束的错误，意味着依赖关系已经存在，跳过该错误
          if (error.code === "P2002") {
            console.log(
              `Unlock dependency from node ${updatedNode.id} to ${depNodeId} already exists, skipping.`
            );
          } else {
            throw error; // 处理其他类型的错误
          }
        }
      }
    }

    // 1. 先删除现有的锁住依赖关系
    await prisma.lockDependency.deleteMany({
      where: { fromNodeId: updatedNode.id },
    });
    // 更新锁住依赖节点关系
    if (lockDepNodes && lockDepNodes.length > 0) {
      // 2. 重新添加新的锁住依赖关系
      for (const depNodeId of lockDepNodes) {
        try {
          await prisma.lockDependency.create({
            data: {
              fromNodeId: updatedNode.id,
              toNodeId: Number(depNodeId),
            },
          });
        } catch (error: any) {
          // 如果出现任何问题，这里处理错误
          console.error(
            `Error adding lock dependency from node ${updatedNode.id} to ${depNodeId}:`,
            error
          );
          throw error; // 抛出错误供外层捕获
        }
      }
    }

    res.status(200).json({ data: updatedNode });
  } catch (error) {
    res.status(500).json({ message: `Failed to update node: ${error}` });
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
    res.status(405).json({ message: `Method '${req.method}' Not Allowed` });
  },
});

// 禁用默认 body 解析
export const config = {
  api: {
    bodyParser: false,
  },
};
