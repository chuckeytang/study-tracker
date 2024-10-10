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
        unlockDependenciesTo: true, // 查询每个节点的前置依赖
      },
    });

    // 构建学习进度数据
    const courseProgressData = nodes.map((node) => {
      // 判断是否有前置依赖节点
      const hasDependencies = node.unlockDependenciesTo.length > 0;

      return {
        userId: Number(studentId),
        courseId: Number(courseId),
        nodeId: node.id,
        level: 0, // 初始等级为0
        unlocked: !hasDependencies, // 如果没有前置依赖，则解锁；否则处于锁定状态
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
