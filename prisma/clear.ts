import { PrismaClient, UnlockType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear tables in the order of dependencies
  await prisma.unlockDependency.deleteMany();
  await prisma.lockDependency.deleteMany();
  await prisma.courseProgress.deleteMany();
  await prisma.userCourse.deleteMany();
  await prisma.nodeUpgradeHistory.deleteMany();
  await prisma.node.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();
  await prisma.experienceConfig.deleteMany();
  await prisma.rewardConfig.deleteMany();

  console.log("Tables cleared!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
