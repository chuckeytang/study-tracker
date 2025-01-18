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
    // 获取单条 rewardConfig 数据
    const rewardConfig = await prisma.rewardConfig.findUnique({
      where: { id: Number(id) },
    });

    if (!rewardConfig) {
      return res.status(404).json({ message: "RewardConfig not found" });
    }

    res.status(200).json(rewardConfig);
  } catch (error) {
    console.error("Error fetching reward configuration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}