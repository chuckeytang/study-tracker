import { NextApiResponse } from "next";
import { createRouter } from "next-connect";
import { ExtendedNextApiRequest } from "@/types/ExtendedNextApiRequest";
import { AppError } from "@/types/AppError";
import prisma from "@/lib/prisma";

const router = createRouter<ExtendedNextApiRequest, NextApiResponse>();

// GET /api/courses/getHomePageCourse
router.get(async (req, res) => {
  try {
    const course = await prisma.course.findFirst({
      where: { inHomePage: true },
    });

    if (!course) {
      return res.status(404).json({ message: "No homepage course found" });
    }

    res.status(200).json(course);
  } catch (error) {
    console.error("Error fetching homepage course:", error);
    res.status(500).json({ message: "Failed to fetch homepage course" });
  }
});

// 错误处理
export default router.handler({
  onError: (err, req, res) => {
    if (err instanceof AppError) {
      console.error(err.stack);
      res.status(err.statusCode).end(err.message);
    } else {
      console.error(err);
      res.status(500).end("Unexpected error occurred");
    }
  },
  onNoMatch: (req, res) => {
    res.status(405).json({ message: `Method '${req.method}' Not Allowed` });
  },
});
