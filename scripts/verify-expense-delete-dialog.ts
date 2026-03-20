import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const filePath = resolve(process.cwd(), "src/pages/myExpenses.tsx");
const source = readFileSync(filePath, "utf8");

assert(!source.includes("window.confirm("), "window.confirm should not be used for expense deletion");
assert(source.includes("Delete Expense"), "custom delete dialog title should exist");
assert(source.includes("Delete this expense record?"), "custom delete dialog body text should exist");
assert(source.includes("Delete Now"), "custom delete confirm button should exist");

console.log("expense delete dialog checks passed");
