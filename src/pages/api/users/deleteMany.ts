import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { ids } = req.body;

  try {
    const deletedUsers = await prisma.user.deleteMany({
      where: { id: { in: ids.map((id: number) => Number(id)) } },
    });
    res.status(200).json(deletedUsers);
  } catch (error) {
    res.status(500).json({ error: `Failed to delete users: ${error}` });
  }
}
