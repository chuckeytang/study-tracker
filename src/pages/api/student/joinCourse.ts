// src/pages/api/student/joinCourse.ts

import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { studentId, courseId } = req.body;

  if (!studentId || !courseId) {
    return res
      .status(400)
      .json({ error: "studentId and courseId are required" });
  }

  try {
    // 清除学生与该课程的学习遗留进度
    await prisma.courseProgress.deleteMany({
      where: {
        userId: Number(studentId),
        courseId: Number(courseId),
      },
    });

    // 插入一条学生与课程的关联记录到 UserCourse 表中
    await prisma.userCourse.create({
      data: {
        userId: Number(studentId),
        courseId: Number(courseId),
      },
    });

    // 获取该课程的所有节点
    const nodes = await prisma.node.findMany({
      where: { courseId: Number(courseId) },
      include: {
        unlockDependenciesTo: {
          include: {
            fromNode: true, // 联合查询获取依赖节点的完整信息
          },
        },
      },
    });

    // 查找已经解锁的 BIGCHECK 节点（没有前置依赖的 bigcheck 节点）
    const unlockedBigCheckIds = nodes
      .filter(
        (node) =>
          node.nodeType === "BIGCHECK" && node.unlockDependenciesTo.length === 0
      )
      .map((node) => node.id);

    // 构建学习进度数据
    const courseProgressData = nodes.map((node) => {
      // 判断是否为 bigcheck，bigcheck 节点的初始 level 为 0
      const isBigCheck = node.nodeType === "BIGCHECK";
      let initialLevel = isBigCheck ? 1 : 0;

      // 判断是否有前置依赖节点
      const hasDependencies = node.unlockDependenciesTo.length > 0;

      // 检查当前节点依赖的是否只有 bigcheck 且已解锁
      let unlocked = !hasDependencies; // 如果没有依赖，则默认为解锁
      if (hasDependencies && !isBigCheck) {
        const onlyDependsOnUnlockedBigCheck = node.unlockDependenciesTo.every(
          (dependency) =>
            dependency.fromNode.nodeType === "BIGCHECK" &&
            unlockedBigCheckIds.includes(dependency.fromNodeId)
        );
        unlocked = onlyDependsOnUnlockedBigCheck; // 如果依赖的都是已解锁的 bigcheck，则解锁本节点
      }

      return {
        userId: Number(studentId),
        courseId: Number(courseId),
        nodeId: node.id,
        level: initialLevel, // bigcheck 节点初始为 1，其他节点初始为 0
        unlocked, // 根据前置依赖判断是否解锁
      };
    });

    // 插入学习进度记录
    await prisma.courseProgress.createMany({
      data: courseProgressData,
      skipDuplicates: true, // 跳过已存在的记录
    });

    res.status(200).json({ message: "Course joined successfully" });
  } catch (error) {
    console.error("Error joining course:", error);
    res.status(500).json({ error: `Failed to join course: ${error}` });
  }
}
