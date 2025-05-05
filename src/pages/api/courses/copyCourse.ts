import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { courseId } = req.body;

  if (!courseId) {
    return res.status(400).json({ message: "Missing courseId" });
  }

  try {
    const course = await prisma.course.findUnique({
      where: { id: Number(courseId) },
      include: {
        nodes: {
          include: {
            unlockDependenciesFrom: true,
            unlockDependenciesTo: true,
            lockDependenciesFrom: true,
            lockDependenciesTo: true,
          },
        },
      },
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // 生成新课程名，如 "原名 Copy"、"原名 Copy2"
    const baseName = course.name + " Copy";
    let newCourseName = baseName;
    let suffix = 2;

    while (
      await prisma.course.findFirst({
        where: { name: newCourseName },
      })
    ) {
      newCourseName = `${baseName}${suffix}`;
      suffix++;
    }

    // 创建新课程
    const newCourse = await prisma.course.create({
      data: {
        name: newCourseName,
        description: course.description,
        iconUrl: course.iconUrl,
        published: false,
      },
    });

    // 复制节点
    const nodeIdMap = new Map<number, number>(); // 旧 nodeId -> 新 nodeId

    for (const node of course.nodes) {
      const newNode = await prisma.node.create({
        data: {
          name: node.name,
          description: node.description,
          nodeType: node.nodeType,
          courseId: newCourse.id,
          maxLevel: node.maxLevel,
          iconUrl: node.iconUrl,
          unlockType: node.unlockType,
          unlockDepTimeInterval: node.unlockDepTimeInterval,
          unlockDepNodeCount: node.unlockDepNodeCount,
          lockDepNodeCount: node.lockDepNodeCount,
          coolDown: node.coolDown,
          exp: node.exp,
          rewardPt: node.rewardPt,
          positionX: node.positionX,
          positionY: node.positionY,
          unlockDepClusterTotalSkillPt: node.unlockDepClusterTotalSkillPt,
        },
      });
      nodeIdMap.set(node.id, newNode.id);
    }

    // 复制依赖关系（解锁和锁住）
    for (const node of course.nodes) {
      const newFromId = nodeIdMap.get(node.id);
      if (!newFromId) continue;

      // UnlockDependency
      for (const dep of node.unlockDependenciesFrom) {
        const newToId = nodeIdMap.get(dep.toNodeId);
        if (newToId) {
          await prisma.unlockDependency.create({
            data: {
              fromNodeId: newFromId,
              toNodeId: newToId,
            },
          });
        }
      }

      // LockDependency
      for (const dep of node.lockDependenciesFrom) {
        const newToId = nodeIdMap.get(dep.toNodeId);
        if (newToId) {
          await prisma.lockDependency.create({
            data: {
              fromNodeId: newFromId,
              toNodeId: newToId,
            },
          });
        }
      }
    }

    // 复制 TEACHER 角色的课程归属记录
    const userCourses = await prisma.userCourse.findMany({
      where: {
        courseId: course.id,
      },
      include: {
        user: true,
      },
    });

    const teacherUsers = userCourses.filter((uc) => uc.user.role === "TEACHER");

    for (const uc of teacherUsers) {
      await prisma.userCourse.create({
        data: {
          userId: uc.userId,
          courseId: newCourse.id,
        },
      });
    }

    res.status(200).json({ data: newCourse });
  } catch (error) {
    console.error("Error copying course:", error);
    res.status(500).json({ message: `Failed to copy course: ${error}` });
  }
}
