import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { courseId } = req.body;

  try {
    await prisma.course.update({
      where: { id: Number(courseId) },
      data: { published: true },
    });

    res.status(200).json({ message: "Course published successfully" });
  } catch (error) {
    console.error("Error publishing course:", error);
    res.status(500).json({ message: "Internal server error" });
  }
} 