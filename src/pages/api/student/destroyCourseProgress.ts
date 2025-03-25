// pages/api/student/destroyCourseProgress.ts
import { createRouter } from "next-connect";
import { authMiddleware } from "@/utils/auth";
import { ExtendedNextApiRequest } from "@/types/ExtendedNextApiRequest";
import { NextApiResponse } from "next";
import prisma from "@/lib/prisma";

const router = createRouter<ExtendedNextApiRequest, NextApiResponse>();
router.use(authMiddleware);

router.delete(async (req: ExtendedNextApiRequest, res: NextApiResponse) => {
  const { studentId, courseId } = req.body;

  // 参数校验
  if (!studentId || !courseId) {
    return res.status(400).json({
      code: "INVALID_PARAMS",
      message: "Missing required parameters",
    });
  }

  try {
    // 验证1：用户必须是教师
    if (req.user?.role !== "TEACHER") {
      return res.status(403).json({
        code: "FORBIDDEN",
        message: "Access denied: Teacher role required",
      });
    }

    // 验证2：课程必须属于当前教师
    const courseOwnership = await prisma.userCourse.findFirst({
      where: {
        userId: req.user.id,
        courseId: Number(courseId),
        user: {
          role: "TEACHER",
        },
      },
    });

    if (!courseOwnership) {
      return res.status(403).json({
        code: "COURSE_OWNERSHIP",
        message: "Course does not belong to this teacher",
      });
    }

    // 验证3：目标学生必须在该课程中
    const studentInCourse = await prisma.userCourse.findFirst({
      where: {
        userId: Number(studentId),
        courseId: Number(courseId),
      },
    });

    if (!studentInCourse) {
      return res.status(404).json({
        code: "STUDENT_NOT_FOUND",
        message: "Student is not enrolled in this course",
      });
    }

    // 执行删除操作（事务处理）
    const [progressResult] = await prisma.$transaction([
      // 1. Delete course progress
      prisma.courseProgress.deleteMany({
        where: {
          userId: Number(studentId),
          courseId: Number(courseId),
        },
      }),

      // 2. Delete node upgrade history for this course
      prisma.nodeUpgradeHistory.deleteMany({
        where: {
          userId: Number(studentId),
          node: {
            courseId: Number(courseId), // 通过节点关联课程
          },
        },
      }),

      // 3. Reset user stats
      prisma.user.update({
        where: { id: Number(studentId) },
        data: {
          experience: 0,
          experienceLevel: 1,
          rewardPoints: 0,
          rewardLevel: 1,
          updatedAt: new Date(), // 触发更新时间戳
        },
      }),
    ]);

    res.status(200).json({
      code: "SUCCESS",
      data: {
        deletedProgress: progressResult.count,
      },
    });
  } catch (error) {
    console.error("[DESTROY_COURSE_ERROR]", error);
    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router.handler({
  onError: (err, req, res) => {
    res.status(500).json({
      code: "SERVER_ERROR",
      message: `Server error: ${err}`,
    });
  },
  onNoMatch: (req, res) => {
    res.status(405).json({
      code: "METHOD_NOT_ALLOWED",
      message: `Method ${req.method} not allowed`,
    });
  },
});
