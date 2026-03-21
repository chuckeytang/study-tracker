import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const storePath = resolve(
  process.cwd(),
  "src/lib/verification-code-store.ts",
);

assert(existsSync(storePath), "verification-code store module should exist");

const storeSource = readFileSync(storePath, "utf8");

assert(
  storeSource.includes("memoryVerificationCodes"),
  "verification-code store should provide an in-memory fallback",
);
assert(
  storeSource.includes('process.env.NODE_ENV !== "production"'),
  "verification-code store should only use memory fallback outside production",
);
assert(
  storeSource.includes("setVerificationCode"),
  "verification-code store should support saving codes",
);
assert(
  storeSource.includes("getVerificationCode"),
  "verification-code store should support reading codes",
);
assert(
  storeSource.includes("deleteVerificationCode"),
  "verification-code store should support deleting codes",
);
assert(
  storeSource.includes("Redis"),
  "verification-code store should still attempt to use Redis when available",
);

const authRoutes = [
  "src/pages/api/auth/send-code.ts",
  "src/pages/api/auth/register.ts",
  "src/pages/api/auth/reset-password.ts",
];

for (const route of authRoutes) {
  const source = readFileSync(resolve(process.cwd(), route), "utf8");

  assert(
    !source.includes('import redis from "@/lib/redis"'),
    `${route} should not import the raw redis client directly`,
  );
  assert(
    source.includes('from "@/lib/verification-code-store"'),
    `${route} should use the verification-code store abstraction`,
  );
}

console.log("verification-code store checks passed");
