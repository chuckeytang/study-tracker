import prisma from "@/lib/prisma";

/**
 * 当用户完成某种财务行为时，触发技能树更新
 * 例如：如果分类是 "Learning"，则给特定 Node 加分
 */
export async function syncExpenseToSkillTree(
  userId: number,
  categoryName: string,
  amount: number
) {
  // 这里编写联动逻辑
  // 1. 查找对应的 Node
  // 2. 调用更新进度方法
}
