import { createRouter } from "next-connect";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import redis from "@/lib/redis";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import {
  isVerificationCodeType,
  sendVerificationCodeEmail,
} from "@/lib/verification-email";

const router = createRouter<NextApiRequest, NextApiResponse>();

router.post(async (req, res) => {
  const { email, type } = req.body;

  if (!email || !type || typeof email !== "string" || typeof type !== "string") {
    return res.status(400).json({ message: "Missing email or type" });
  }

  if (!isVerificationCodeType(type)) {
    return res.status(400).json({ message: "Invalid type" });
  }

  if (type === "forgot-password") {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await redis.set(`verify:${type}:${email}`, code, "EX", 300);

    const result = await sendVerificationCodeEmail({
      email,
      type,
      code,
      sendEmail: async ({ from, to, subject, html, text }) => {
        const sesClient = new SESClient({
          region: process.env.AWS_REGION,
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
          },
        });

        await sesClient.send(
          new SendEmailCommand({
            Source: from,
            Destination: { ToAddresses: [to] },
            Message: {
              Subject: { Data: subject },
              Body: {
                Html: {
                  Charset: "UTF-8",
                  Data: html,
                },
                Text: { Data: text },
              },
            },
          })
        );
      },
    });

    if (result.delivery === "dev-fallback") {
      return res.status(200).json({
        message: "Verification code generated for local development. Check server logs.",
      });
    }

    console.log(`[AWS SES] Sent ${type} code to ${email}`);
    return res.status(200).json({ message: "Verification code sent" });
  } catch (error: any) {
    console.error("发送验证码失败:", error);
    res.status(500).json({ message: "Failed to send email", error: error.message });
  }
});

export default router.handler({
  onNoMatch: (req, res) => {
    res.status(405).end();
  },
  onError: (err: any, req, res) => {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  },
});
