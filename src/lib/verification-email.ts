export type VerificationCodeType = "register" | "forgot-password";

type VerificationEmail = {
  subject: string;
  html: string;
  text: string;
};

type VerificationEnv = {
  NODE_ENV?: string;
  AWS_REGION?: string;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  AWS_FROM_EMAIL?: string;
};

type SendEmailArgs = {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
};

type SendEmailFn = (args: SendEmailArgs) => Promise<void>;

type Logger = {
  warn: (message: string) => void;
};

const SES_ENV_KEYS = [
  "AWS_REGION",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_FROM_EMAIL",
] as const;

export function isVerificationCodeType(
  value: string
): value is VerificationCodeType {
  return value === "register" || value === "forgot-password";
}

export function hasSesConfiguration(env: VerificationEnv = process.env): boolean {
  return SES_ENV_KEYS.every((key) => Boolean(env[key]));
}

function buildVerificationEmail(
  type: VerificationCodeType,
  code: string
): VerificationEmail {
  if (type === "register") {
    return {
      subject: "Verify your email - Trackahabit",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Welcome to Trackahabit!</h2>
          <p>Please use the verification code below to complete your registration:</p>
          <p><b style="font-size: 24px; color: #0070f3;">${code}</b></p>
          <p style="color: #666; font-size: 12px;">This code expires in 5 minutes.</p>
        </div>
      `,
      text: `Your verification code is: ${code}`,
    };
  }

  return {
    subject: "Reset your password - Trackahabit",
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Use the code below to proceed:</p>
        <p><b style="font-size: 24px; color: #0070f3;">${code}</b></p>
        <p style="color: #666; font-size: 12px;">If you did not request this, please ignore this email.</p>
      </div>
    `,
    text: `Your verification code is: ${code}`,
  };
}

export async function sendVerificationCodeEmail({
  email,
  type,
  code,
  env = process.env,
  logger = console,
  sendEmail,
}: {
  email: string;
  type: VerificationCodeType;
  code: string;
  env?: VerificationEnv;
  logger?: Logger;
  sendEmail?: SendEmailFn;
}): Promise<{ delivery: "ses" | "dev-fallback" }> {
  const message = buildVerificationEmail(type, code);

  if (!hasSesConfiguration(env)) {
    if (env.NODE_ENV === "production") {
      throw new Error("AWS SES is not configured");
    }

    logger.warn(
      `[Dev Email Fallback] ${type} code for ${email}: ${code}`
    );
    return { delivery: "dev-fallback" };
  }

  if (!sendEmail) {
    throw new Error("Email sender is not available");
  }

  await sendEmail({
    from: env.AWS_FROM_EMAIL!,
    to: email,
    subject: message.subject,
    html: message.html,
    text: message.text,
  });

  return { delivery: "ses" };
}
