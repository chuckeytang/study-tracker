import type { PrismaClient } from "@prisma/client";

export type ExpenseCategoryRecord = {
  id: number;
  name: string;
  iconUrl?: string | null;
};

type DefaultExpenseCategory = {
  name: string;
  iconUrl: string | null;
};

const DEFAULT_EXPENSE_CATEGORIES: DefaultExpenseCategory[] = [
  { name: "Housing", iconUrl: null },
  { name: "Utilities", iconUrl: null },
  { name: "Transportation", iconUrl: null },
  { name: "Personal Care", iconUrl: null },
  { name: "Medical", iconUrl: null },
  { name: "Loans", iconUrl: null },
  { name: "Obligations", iconUrl: null },
  { name: "Discretionary", iconUrl: null },
  { name: "Career", iconUrl: null },
];

const CATEGORY_ALIASES: Record<string, string[]> = {
  housing: ["housing"],
  utilities: ["utilities"],
  transport: ["transport", "transportation"],
  personal: ["personal", "personalcare"],
  medical: ["medical", "health", "healthcare"],
  loans: ["loan", "loans"],
  obligations: ["obligation", "obligations", "tax", "insurance"],
  discretionary: ["discretionary", "entertainment"],
  career: ["career", "education"],
};

const UI_CATEGORY_LABELS: Record<string, string> = {
  housing: "Housing",
  utilities: "Utilities",
  transport: "Transport",
  personal: "Personal",
  medical: "Medical",
  loans: "Loans",
  obligations: "Obligations",
  discretionary: "Discretionary",
  career: "Career",
};

export const normalizeExpenseCategoryKey = (value?: string | null) =>
  (value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

export function resolveUiExpenseCategoryId(
  categoryName?: string | null
): string | null {
  const normalized = normalizeExpenseCategoryKey(categoryName);
  if (!normalized) return null;

  for (const [uiId, aliases] of Object.entries(CATEGORY_ALIASES)) {
    const keys = [
      normalizeExpenseCategoryKey(uiId),
      normalizeExpenseCategoryKey(UI_CATEGORY_LABELS[uiId]),
      ...aliases.map(normalizeExpenseCategoryKey),
    ];

    if (keys.some((key) => key && (normalized.includes(key) || key.includes(normalized)))) {
      return uiId;
    }
  }

  return null;
}

export function buildExpenseCategoryIdMap(
  categories: ExpenseCategoryRecord[]
): Record<string, number> {
  const map: Record<string, number> = {};

  for (const category of categories) {
    if (!category.id) continue;

    const categoryNameKey = normalizeExpenseCategoryKey(category.name);
    if (categoryNameKey) {
      map[categoryNameKey] = category.id;
    }

    const resolvedUiId = resolveUiExpenseCategoryId(category.name);
    if (!resolvedUiId) continue;

    const keys = [
      normalizeExpenseCategoryKey(resolvedUiId),
      normalizeExpenseCategoryKey(UI_CATEGORY_LABELS[resolvedUiId]),
      ...(CATEGORY_ALIASES[resolvedUiId] ?? []).map(normalizeExpenseCategoryKey),
    ];

    for (const key of keys) {
      if (key) {
        map[key] = category.id;
      }
    }
  }

  return map;
}

export async function ensureExpenseCategories(
  prisma: PrismaClient
): Promise<ExpenseCategoryRecord[]> {
  await prisma.expenseCategory.createMany({
    data: DEFAULT_EXPENSE_CATEGORIES,
    skipDuplicates: true,
  });

  return prisma.expenseCategory.findMany({
    orderBy: { id: "asc" },
  });
}
