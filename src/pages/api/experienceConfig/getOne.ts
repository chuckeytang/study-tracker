import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: "Missing id parameter" });
  }

  try {
    // 获取单条 experienceConfig 数据
    const experienceConfig = await prisma.experienceConfig.findUnique({
      where: { id: Number(id) },
    });

    if (!experienceConfig) {
      return res.status(404).json({ message: "ExperienceConfig not found" });
    }

    res.status(200).json(experienceConfig);
  } catch (error) {
    console.error("Error fetching experience configuration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}