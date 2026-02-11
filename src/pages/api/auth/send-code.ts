import { createRouter } from "next-connect";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import redis from "@/lib/redis";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const router = createRouter<NextApiRequest, NextApiResponse>();

const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

router.post(async (req, res) => {
  const { email, type } = req.body; 

  if (!email || !type) {
    return res.status(400).json({ message: "Missing email or type" });
  }

  if (type === 'forgot-password') {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await redis.set(`verify:${type}:${email}`, code, 'EX', 300);

    let subject = "";
    let htmlContent = "";

    // [*] 定义英文模板
    if (type === 'register') {
      subject = "Verify your email - Trackahabit";
      htmlContent = `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Welcome to Trackahabit!</h2>
          <p>Please use the verification code below to complete your registration:</p>
          <p><b style="font-size: 24px; color: #0070f3;">${code}</b></p>
          <p style="color: #666; font-size: 12px;">This code expires in 5 minutes.</p>
        </div>
      `;
    } else if (type === 'forgot-password') {
      subject = "Reset your password - Trackahabit";
      htmlContent = `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password. Use the code below to proceed:</p>
          <p><b style="font-size: 24px; color: #0070f3;">${code}</b></p>
          <p style="color: #666; font-size: 12px;">If you did not request this, please ignore this email.</p>
        </div>
      `;
    } else {
        // 防止未知的 type
        return res.status(400).json({ message: "Invalid type" });
    }

    const params = {
      Source: process.env.AWS_FROM_EMAIL,
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: { Data: subject },
        Body: {
          // [*] 修正：这里必须使用上面生成的 htmlContent 变量，而不是写死中文
          Html: {
            Charset: "UTF-8",
            Data: htmlContent 
          },
          Text: { Data: `Your verification code is: ${code}` }
        },
      },
    };

    await sesClient.send(new SendEmailCommand(params));
    
    console.log(`[AWS SES] Sent ${type} code to ${email}`);
    res.status(200).json({ message: "Verification code sent" });
  } catch (error: any) {
    console.error("SES 发送失败:", error);
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