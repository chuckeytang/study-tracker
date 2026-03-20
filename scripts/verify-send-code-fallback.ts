import assert from "node:assert/strict";
import { sendVerificationCodeEmail } from "../src/lib/verification-email";

async function main() {
  const warnings: string[] = [];

  const devResult = await sendVerificationCodeEmail({
    email: "dev@example.com",
    type: "register",
    code: "123456",
    env: {
      NODE_ENV: "development",
    },
    logger: {
      warn: (message: string) => warnings.push(message),
    },
    sendEmail: async () => {
      throw new Error("sendEmail should not be called without SES config");
    },
  });

  assert.equal(devResult.delivery, "dev-fallback");
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /123456/);

  await assert.rejects(
    () =>
      sendVerificationCodeEmail({
        email: "prod@example.com",
        type: "forgot-password",
        code: "654321",
        env: {
          NODE_ENV: "production",
        },
        logger: {
          warn: () => undefined,
        },
        sendEmail: async () => undefined,
      }),
    /AWS SES is not configured/
  );

  console.log("verification email fallback tests passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
