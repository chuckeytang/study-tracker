import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import {
  buildExpenseCategoryIdMap,
  ensureExpenseCategories,
} from "../src/lib/expense-categories";

async function main() {
  const prisma = new PrismaClient();

  try {
    const categories = await ensureExpenseCategories(prisma);
    const names = new Set(categories.map((category) => category.name));

    for (const expected of [
      "Housing",
      "Utilities",
      "Transportation",
      "Personal Care",
      "Medical",
      "Loans",
      "Obligations",
      "Discretionary",
      "Career",
    ]) {
      assert(names.has(expected), `missing category: ${expected}`);
    }

    const categoryIdMap = buildExpenseCategoryIdMap(categories);
    assert.equal(typeof categoryIdMap.housing, "number");
    assert.equal(typeof categoryIdMap.utilities, "number");
    assert.equal(typeof categoryIdMap.transport, "number");
    assert.equal(typeof categoryIdMap.personal, "number");
    assert.equal(typeof categoryIdMap.medical, "number");
    assert.equal(typeof categoryIdMap.loans, "number");
    assert.equal(typeof categoryIdMap.obligations, "number");
    assert.equal(typeof categoryIdMap.discretionary, "number");
    assert.equal(typeof categoryIdMap.career, "number");

    console.log("expense category bootstrap tests passed");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
