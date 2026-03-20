import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const authPages = [
  "src/pages/index.tsx",
  "src/pages/register.tsx",
  "src/pages/forgot-password.tsx",
];

for (const file of authPages) {
  const source = readFileSync(resolve(process.cwd(), file), "utf8");

  assert(
    source.includes('showAuthSuccessToast'),
    `${file} should use the shared auth success toast helper`
  );
  assert(
    !source.includes('fixed top-[24px] right-[24px]'),
    `${file} should not render the old fixed success panel`
  );
}

console.log("auth success toast checks passed");
