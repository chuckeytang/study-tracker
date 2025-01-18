import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id, data } = req.body;

  if (!id || !data) {
    return res.status(400).json({ message: "Invalid request body" });
  }

  try {
    // 更新单条 rewardConfig 数据
    const updatedRewardConfig = await prisma.rewardConfig.update({
      where: { id: Number(id) },
      data,
    });

    res.status(200).json(updatedRewardConfig);
  } catch (error) {
    console.error("Error updating reward configuration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}