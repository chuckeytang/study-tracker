import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 清空表数据
  await prisma.courseProgress.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  console.log("Tables cleared!");

  // 插入两个老师
  const teacher1 = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "john.doe@example.com",
      role: "TEACHER", // 使用枚举类型 TEACHER
    },
  });

  const teacher2 = await prisma.user.create({
    data: {
      name: "Jane Smith",
      email: "jane.smith@example.com",
      role: "TEACHER", // 使用枚举类型 TEACHER
    },
  });

  // 插入五个学生
  const student1 = await prisma.user.create({
    data: {
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      role: "STUDENT", // 使用枚举类型 STUDENT
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: "Bob Brown",
      email: "bob.brown@example.com",
      role: "STUDENT", // 使用枚举类型 STUDENT
    },
  });

  const student3 = await prisma.user.create({
    data: {
      name: "Charlie Clark",
      email: "charlie.clark@example.com",
      role: "STUDENT", // 使用枚举类型 STUDENT
    },
  });

  const student4 = await prisma.user.create({
    data: {
      name: "Diana Davis",
      email: "diana.davis@example.com",
      role: "STUDENT", // 使用枚举类型 STUDENT
    },
  });

  const student5 = await prisma.user.create({
    data: {
      name: "Edward Evans",
      email: "edward.evans@example.com",
      role: "STUDENT", // 使用枚举类型 STUDENT
    },
  });

  console.log("2 teachers and 5 students created successfully!");

  // 创建游泳课程
  const swimmingCourse = await prisma.course.create({
    data: {
      name: "游泳基础课程",
      description: "学习从适应水环境到掌握各种泳姿的技能",
      iconUrl: "/images/course_default_icon.png",
      teacherId: teacher1.id, // 假设这是一个已存在的教师 ID
    },
  });

  // 创建学生与课程的关联
  const studentCourse = await prisma.studentCourse.create({
    data: {
      userId: student1.id, // 学生 ID
      courseId: swimmingCourse.id, // 课程 ID
    },
  });

  // 创建 BigCheck: 水中适应
  const bigCheck1 = await prisma.node.create({
    data: {
      name: "水中适应",
      description: "帮助学生适应水环境，学习基本的水中动作和安全技巧",
      nodeType: "BIGCHECK",
      courseId: swimmingCourse.id,
      maxLevel: -1, // BigCheck 没有等级
      unlockDepNodes: {
        create: [
          {
            name: "基础呼吸",
            courseId: swimmingCourse.id,
            description: "学习如何在水中控制呼吸",
            nodeType: "MAJOR_NODE",
            maxLevel: 3,
            unlockDepNodes: {
              create: [
                {
                  name: "屏气",
                  courseId: swimmingCourse.id,
                  description: "学习如何在水中屏住呼吸",
                  nodeType: "MINOR_NODE",
                  maxLevel: 1,
                },
                {
                  name: "水下呼吸",
                  courseId: swimmingCourse.id,
                  description: "学习如何在水下控制呼吸",
                  nodeType: "MINOR_NODE",
                  maxLevel: 2,
                },
              ],
            },
          },
          {
            name: "浮力控制",
            courseId: swimmingCourse.id,
            description: "学习如何在水中保持浮力",
            nodeType: "MAJOR_NODE",
            maxLevel: 3,
            unlockDepNodes: {
              create: [
                {
                  name: "水中漂浮",
                  courseId: swimmingCourse.id,
                  description: "学习在水中保持漂浮",
                  nodeType: "MINOR_NODE",
                  maxLevel: 2,
                },
                {
                  name: "背漂",
                  courseId: swimmingCourse.id,
                  description: "学习背部漂浮",
                  nodeType: "MINOR_NODE",
                  maxLevel: 1,
                },
              ],
            },
          },
        ],
      },
    },
  });

  // 创建 BigCheck: 基础泳姿
  const bigCheck2 = await prisma.node.create({
    data: {
      name: "基础泳姿",
      description: "学习基本的泳姿，如自由泳、蛙泳和仰泳",
      nodeType: "BIGCHECK",
      courseId: swimmingCourse.id,
      maxLevel: -1, // BigCheck 没有等级
      unlockDepNodes: {
        create: [
          {
            name: "自由泳",
            courseId: swimmingCourse.id,
            description: "学习自由泳的基础技巧",
            nodeType: "MAJOR_NODE",
            maxLevel: 3,
            unlockDepNodes: {
              create: [
                {
                  name: "自由泳手部动作",
                  courseId: swimmingCourse.id,
                  description: "学习自由泳的手部动作",
                  nodeType: "MINOR_NODE",
                  maxLevel: 2,
                },
                {
                  name: "自由泳腿部动作",
                  courseId: swimmingCourse.id,
                  description: "学习自由泳的腿部动作",
                  nodeType: "MINOR_NODE",
                  maxLevel: 2,
                },
                {
                  name: "自由泳换气",
                  courseId: swimmingCourse.id,
                  description: "学习自由泳的呼吸技巧",
                  nodeType: "MINOR_NODE",
                  maxLevel: 2,
                },
              ],
            },
          },
          {
            name: "蛙泳",
            courseId: swimmingCourse.id,
            description: "学习蛙泳的基础技巧",
            nodeType: "MAJOR_NODE",
            maxLevel: 3,
            unlockDepNodes: {
              create: [
                {
                  name: "蛙泳手部动作",
                  courseId: swimmingCourse.id,
                  description: "学习蛙泳的手部动作",
                  nodeType: "MINOR_NODE",
                  maxLevel: 2,
                },
                {
                  name: "蛙泳腿部动作",
                  courseId: swimmingCourse.id,
                  description: "学习蛙泳的腿部动作",
                  nodeType: "MINOR_NODE",
                  maxLevel: 2,
                },
                {
                  name: "蛙泳换气",
                  courseId: swimmingCourse.id,
                  description: "学习蛙泳的呼吸技巧",
                  nodeType: "MINOR_NODE",
                  maxLevel: 2,
                },
              ],
            },
          },
        ],
      },
    },
  });

  // 创建 BigCheck: 进阶游泳技巧
  const bigCheck3 = await prisma.node.create({
    data: {
      name: "进阶游泳技巧",
      description: "掌握转身技巧、划水效率和换气等复杂的技巧",
      nodeType: "BIGCHECK",
      courseId: swimmingCourse.id,
      maxLevel: -1, // BigCheck 没有等级
      unlockDepNodes: {
        create: [
          {
            name: "转身技巧",
            courseId: swimmingCourse.id,
            description: "学习在池壁转身的技巧",
            nodeType: "MAJOR_NODE",
            maxLevel: 3,
            unlockDepNodes: {
              create: [
                {
                  name: "自由泳转身",
                  courseId: swimmingCourse.id,
                  description: "学习自由泳转身的技巧",
                  nodeType: "MINOR_NODE",
                  maxLevel: 2,
                },
                {
                  name: "蛙泳转身",
                  courseId: swimmingCourse.id,
                  description: "学习蛙泳转身的技巧",
                  nodeType: "MINOR_NODE",
                  maxLevel: 2,
                },
              ],
            },
          },
          {
            name: "划水效率",
            courseId: swimmingCourse.id,
            description: "提高划水效率，增强游泳速度",
            nodeType: "MAJOR_NODE",
            maxLevel: 3,
            unlockDepNodes: {
              create: [
                {
                  name: "自由泳划水",
                  courseId: swimmingCourse.id,
                  description: "学习提高自由泳的划水效率",
                  nodeType: "MINOR_NODE",
                  maxLevel: 2,
                },
                {
                  name: "蛙泳划水",
                  courseId: swimmingCourse.id,
                  description: "学习提高蛙泳的划水效率",
                  nodeType: "MINOR_NODE",
                  maxLevel: 2,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("Swimming course and nodes seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
