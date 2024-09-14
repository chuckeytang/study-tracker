import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { ids, data } = req.body;

  try {
    const updatedUsers = await prisma.user.updateMany({
      where: { id: { in: ids.map((id: number) => Number(id)) } },
      data,
    });

    res.status(200).json(updatedUsers);
  } catch (error) {
    res.status(500).json({ error: `Failed to update users: ${error}` });
  }
}
