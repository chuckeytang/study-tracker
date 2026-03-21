import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const pagePath = resolve(process.cwd(), "src/pages/myExpenses.tsx");
const source = readFileSync(pagePath, "utf8");

assert(
  source.includes("const IconBudgets ="),
  "myExpenses should define a custom budgets icon",
);
assert(
  source.includes("const IconDashboard ="),
  "myExpenses should define a custom dashboard icon",
);
assert(
  source.includes("const IconAccounts ="),
  "myExpenses should define a custom accounts icon",
);
assert(
  source.includes("const IconSettings ="),
  "myExpenses should define a custom settings icon",
);
assert(
  source.includes('icon: <IconBudgets active={activeMenu === "Budgets"} />'),
  "Budgets menu should use the custom budgets SVG",
);
assert(
  source.includes('icon: <IconDashboard active={activeMenu === "Dashboard"} />'),
  "Dashboard menu should use the custom dashboard SVG",
);
assert(
  source.includes('icon: <IconAccounts active={activeMenu === "Accounts"} />'),
  "Accounts menu should use the custom accounts SVG",
);
assert(
  source.includes('icon: <IconSettings active={activeMenu === "Settings"} />'),
  "Settings menu should use the custom settings SVG",
);
assert(
  !source.includes('<Settings'),
  "sidebar menu should not use lucide Settings icons",
);
assert(
  source.includes('d="M17.5001 4.1665H2.50008C2.03984 4.1665 1.66675 4.5396 1.66675 4.99984V15.8332C1.66675 16.2934 2.03984 16.6665 2.50008 16.6665H17.5001C17.9603 16.6665 18.3334 16.2934 18.3334 15.8332V4.99984C18.3334 4.5396 17.9603 4.1665 17.5001 4.1665Z"'),
  "Budgets icon should match the provided card/list SVG",
);
assert(
  source.includes('d="M2.0848 17.5965C2.0848 17.7734 2.23245 17.9168 2.41459 17.9168L17.5842 17.9168C17.7663 17.9168 17.914 17.7734 17.914 17.5965V17.214C17.9216 17.0987 17.937 16.5233 17.5578 15.8872'),
  "Accounts icon should match the provided profile/account SVG",
);

console.log("myExpenses sidebar icon checks passed");
