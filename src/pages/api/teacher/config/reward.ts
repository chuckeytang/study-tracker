import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { config } = req.body;

  if (!Array.isArray(config)) {
    return res.status(400).json({ message: "Invalid configuration data" });
  }

  try {
    // Clear existing configuration
    await prisma.rewardConfig.deleteMany();

    // Insert new configuration
    await prisma.rewardConfig.createMany({
      data: config.map((rewardPoints, index) => ({
        level: index + 1,
        rewardPoints,
      })),
    });

    res.status(200).json({ message: "Reward configuration updated successfully" });
  } catch (error) {
    console.error("Error updating reward configuration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
} 