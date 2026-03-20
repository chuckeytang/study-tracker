import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const pagePath = resolve(process.cwd(), "src/pages/myExpenses.tsx");
const pageSource = readFileSync(pagePath, "utf8");

assert(
  pageSource.includes("selectedExpenseIds"),
  "myExpenses should track selected expense ids",
);
assert(
  pageSource.includes("handleToggleSelectAllExpenses"),
  "myExpenses should support selecting all visible expenses",
);
assert(
  pageSource.includes("handleToggleExpenseSelection"),
  "myExpenses should support toggling individual expenses",
);
assert(
  pageSource.includes("/api/expenses/deleteMany"),
  "myExpenses should call the bulk delete API",
);
assert(
  !/type="checkbox"[\s\S]{0,120}disabled/.test(pageSource),
  "expense table checkboxes should be interactive instead of disabled",
);

const apiPath = resolve(process.cwd(), "src/pages/api/expenses/deleteMany.ts");

assert(existsSync(apiPath), "bulk delete API route should exist");

const apiSource = readFileSync(apiPath, "utf8");

assert(
  apiSource.includes("prisma.expense.deleteMany"),
  "bulk delete API should remove multiple expense records",
);
assert(
  apiSource.includes("userId"),
  "bulk delete API should scope deletion to the authenticated user",
);

console.log("expense bulk delete checks passed");
