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
    const updatedExperienceConfig = await prisma.experienceConfig.update({
      where: { id: Number(id) },
      data,
    });

    res.status(200).json(updatedExperienceConfig);
  } catch (error) {
    console.error("Error updating experience configuration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}