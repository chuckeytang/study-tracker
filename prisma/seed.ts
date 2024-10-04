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
      name: "Swimming Courses",
      description: "学习从适应水环境到掌握各种泳姿的技能",
      iconUrl: "/images/course_default_icon.png",
    },
  });

  // 创建学生与课程的关联
  const userCourse = await prisma.userCourse.create({
    data: {
      userId: student1.id, // 学生 ID

      courseId: swimmingCourse.id,
    },
  });

  // 创建 BigCheck: 水中适应
  const bigCheck1 = await prisma.node.create({
    data: {
      name: "水中适应",
      description: "帮助学生适应水环境，学习基本的水中动作和安全技巧",
      nodeType: "BIGCHECK",

      courseId: swimmingCourse.id,
      unlockDepNodeCount: 1,
      maxLevel: -1, // BigCheck 没有等级
    },
  });

  // 创建基础呼吸节点
  const majorNode1 = await prisma.node.create({
    data: {
      name: "基础呼吸",
      description: "学习如何在水中控制呼吸",
      nodeType: "MAJOR_NODE",

      courseId: swimmingCourse.id,
      unlockDepNodeCount: 1,
      maxLevel: 3,
    },
  });

  // 创建子节点：屏气 和 水下呼吸
  const minorNode1_1 = await prisma.node.create({
    data: {
      name: "屏气",
      description: "学习如何在水中屏住呼吸",
      nodeType: "MINOR_NODE",

      courseId: swimmingCourse.id,
      unlockDepNodeCount: 1,
      maxLevel: 1,
    },
  });

  const minorNode1_2 = await prisma.node.create({
    data: {
      name: "水下呼吸",
      description: "学习如何在水下控制呼吸",
      nodeType: "MINOR_NODE",

      courseId: swimmingCourse.id,
      unlockDepNodeCount: 1,
      maxLevel: 2,
    },
  });

  // 创建解锁依赖关系
  await prisma.unlockDependency.createMany({
    data: [
      { fromNodeId: bigCheck1.id, toNodeId: majorNode1.id },
      { fromNodeId: majorNode1.id, toNodeId: minorNode1_1.id },
      { fromNodeId: majorNode1.id, toNodeId: minorNode1_2.id },
    ],
  });

  // 创建浮力控制节点
  const majorNode2 = await prisma.node.create({
    data: {
      name: "浮力控制",
      description: "学习如何在水中保持浮力",
      nodeType: "MAJOR_NODE",

      courseId: swimmingCourse.id,
      unlockDepNodeCount: 1,
      maxLevel: 3,
    },
  });

  // 创建子节点：水中漂浮 和 背漂
  const minorNode2_1 = await prisma.node.create({
    data: {
      name: "水中漂浮",
      description: "学习在水中保持漂浮",
      nodeType: "MINOR_NODE",

      courseId: swimmingCourse.id,
      unlockDepNodeCount: 1,
      maxLevel: 2,
    },
  });

  const minorNode2_2 = await prisma.node.create({
    data: {
      name: "背漂",
      description: "学习背部漂浮",
      nodeType: "MINOR_NODE",

      courseId: swimmingCourse.id,
      unlockDepNodeCount: 1,
      maxLevel: 1,
    },
  });

  // 创建解锁依赖关系
  await prisma.unlockDependency.createMany({
    data: [
      { fromNodeId: bigCheck1.id, toNodeId: majorNode2.id },
      { fromNodeId: majorNode2.id, toNodeId: minorNode2_1.id },
      { fromNodeId: majorNode2.id, toNodeId: minorNode2_2.id },
    ],
  });

  // 创建其他 BigCheck 以及相应的 MajorNode 和 MinorNode，重复以上的模式

  // 创建 BigCheck: 基础泳姿
  const bigCheck2 = await prisma.node.create({
    data: {
      name: "基础泳姿",
      description: "学习基本的泳姿，如自由泳、蛙泳和仰泳",
      nodeType: "BIGCHECK",

      courseId: swimmingCourse.id,
      unlockDepNodeCount: 1,
      maxLevel: -1, // BigCheck 没有等级
    },
  });

  // // 创建 MajorNode 和相应的 MinorNode 以及 UnlockDependency
  // const majorNode3 = await prisma.node.create({
  //   data: {
  //     name: "自由泳",
  //     description: "学习自由泳的基础技巧",
  //     nodeType: "MAJOR_NODE",

  //     courseId: swimmingCourse.id,
  //     unlockDepNodeCount: 1,
  //     maxLevel: 3,
  //   },
  // });

  // const minorNode3_1 = await prisma.node.create({
  //   data: {
  //     name: "自由泳手部动作",
  //     description: "学习自由泳的手部动作",
  //     nodeType: "MINOR_NODE",

  //     courseId: swimmingCourse.id,
  //     unlockDepNodeCount: 1,
  //     maxLevel: 2,
  //   },
  // });

  // const minorNode3_2 = await prisma.node.create({
  //   data: {
  //     name: "自由泳腿部动作",
  //     description: "学习自由泳的腿部动作",
  //     nodeType: "MINOR_NODE",

  //     courseId: swimmingCourse.id,
  //     unlockDepNodeCount: 1,
  //     maxLevel: 2,
  //   },
  // });

  // await prisma.unlockDependency.createMany({
  //   data: [
  //     { fromNodeId: bigCheck2.id, toNodeId: majorNode3.id },
  //     { fromNodeId: majorNode3.id, toNodeId: minorNode3_1.id },
  //     { fromNodeId: majorNode3.id, toNodeId: minorNode3_2.id },
  //   ],
  // });
  // // 创建 BigCheck: 基础泳姿（续）
  // const majorNode4 = await prisma.node.create({
  //   data: {
  //     name: "蛙泳",
  //     description: "学习蛙泳的基础技巧",
  //     nodeType: "MAJOR_NODE",

  //     courseId: swimmingCourse.id,
  //     unlockDepNodeCount: 1,
  //     maxLevel: 3,
  //   },
  // });

  // const minorNode4_1 = await prisma.node.create({
  //   data: {
  //     name: "蛙泳手部动作",
  //     description: "学习蛙泳的手部动作",
  //     nodeType: "MINOR_NODE",

  //     courseId: swimmingCourse.id,
  //     unlockDepNodeCount: 1,
  //     maxLevel: 2,
  //   },
  // });

  // const minorNode4_2 = await prisma.node.create({
  //   data: {
  //     name: "蛙泳腿部动作",
  //     description: "学习蛙泳的腿部动作",
  //     nodeType: "MINOR_NODE",

  //     courseId: swimmingCourse.id,
  //     unlockDepNodeCount: 1,
  //     maxLevel: 2,
  //   },
  // });

  // await prisma.unlockDependency.createMany({
  //   data: [
  //     { fromNodeId: bigCheck2.id, toNodeId: majorNode4.id },
  //     { fromNodeId: majorNode4.id, toNodeId: minorNode4_1.id },
  //     { fromNodeId: majorNode4.id, toNodeId: minorNode4_2.id },
  //   ],
  // });

  // // 创建 BigCheck: 进阶游泳技巧
  // const bigCheck3 = await prisma.node.create({
  //   data: {
  //     name: "进阶游泳技巧",
  //     description: "掌握转身技巧、划水效率和换气等复杂的技巧",
  //     nodeType: "BIGCHECK",

  //     courseId: swimmingCourse.id,
  //     unlockDepNodeCount: 1,
  //     maxLevel: -1, // BigCheck 没有等级
  //   },
  // });

  // // 创建 MajorNode: 转身技巧
  // const majorNode5 = await prisma.node.create({
  //   data: {
  //     name: "转身技巧",
  //     description: "学习在池壁转身的技巧",
  //     nodeType: "MAJOR_NODE",

  //     courseId: swimmingCourse.id,
  //     unlockDepNodeCount: 1,
  //     maxLevel: 3,
  //   },
  // });

  // // 创建子节点：自由泳转身 和 蛙泳转身
  // const minorNode5_1 = await prisma.node.create({
  //   data: {
  //     name: "自由泳转身",
  //     description: "学习自由泳转身的技巧",
  //     nodeType: "MINOR_NODE",

  //     courseId: swimmingCourse.id,
  //     unlockDepNodeCount: 1,
  //     maxLevel: 2,
  //   },
  // });

  // const minorNode5_2 = await prisma.node.create({
  //   data: {
  //     name: "蛙泳转身",
  //     description: "学习蛙泳转身的技巧",
  //     nodeType: "MINOR_NODE",

  //     courseId: swimmingCourse.id,
  //     unlockDepNodeCount: 1,
  //     maxLevel: 2,
  //   },
  // });

  // // 创建解锁依赖关系
  // await prisma.unlockDependency.createMany({
  //   data: [
  //     { fromNodeId: bigCheck3.id, toNodeId: majorNode5.id },
  //     { fromNodeId: majorNode5.id, toNodeId: minorNode5_1.id },
  //     { fromNodeId: majorNode5.id, toNodeId: minorNode5_2.id },
  //   ],
  // });

  // // 创建 MajorNode: 划水效率
  // const majorNode6 = await prisma.node.create({
  //   data: {
  //     name: "划水效率",
  //     description: "提高划水效率，增强游泳速度",
  //     nodeType: "MAJOR_NODE",

  //     courseId: swimmingCourse.id,
  //     unlockDepNodeCount: 1,
  //     maxLevel: 3,
  //   },
  // });

  // // 创建子节点：自由泳划水 和 蛙泳划水
  // const minorNode6_1 = await prisma.node.create({
  //   data: {
  //     name: "自由泳划水",
  //     description: "学习提高自由泳的划水效率",
  //     nodeType: "MINOR_NODE",

  //     courseId: swimmingCourse.id,
  //     unlockDepNodeCount: 1,
  //     maxLevel: 2,
  //   },
  // });

  // const minorNode6_2 = await prisma.node.create({
  //   data: {
  //     name: "蛙泳划水",
  //     description: "学习提高蛙泳的划水效率",
  //     nodeType: "MINOR_NODE",

  //     courseId: swimmingCourse.id,
  //     unlockDepNodeCount: 1,
  //     maxLevel: 2,
  //   },
  // });

  // // 创建解锁依赖关系
  // await prisma.unlockDependency.createMany({
  //   data: [
  //     { fromNodeId: bigCheck3.id, toNodeId: majorNode6.id },
  //     { fromNodeId: majorNode6.id, toNodeId: minorNode6_1.id },
  //     { fromNodeId: majorNode6.id, toNodeId: minorNode6_2.id },
  //   ],
  // });

  // // 创建其他课程的依赖关系：如耐力与速度等...

  // // 创建 BigCheck: 耐力与速度
  // const bigCheck4 = await prisma.node.create({
  //   data: {
  //     name: "耐力与速度",
  //     description: "提高耐力和速度，以便完成长距离游泳或比赛。",
  //     nodeType: "BIGCHECK",

  //     courseId: swimmingCourse.id,
  //     unlockDepNodeCount: 1,
  //     maxLevel: -1, // BigCheck 没有等级
  //   },
  // });

  // // 创建 MajorNode: 长距离游泳
  // const majorNode7 = await prisma.node.create({
  //   data: {
  //     name: "长距离游泳",
  //     description: "提升学生的耐力，完成更长距离的游泳。",
  //     nodeType: "MAJOR_NODE",

  //     courseId: swimmingCourse.id,
  //     unlockDepNodeCount: 1,
  //     maxLevel: 3,
  //   },
  // });

  // // 创建子节点：500米自由泳 和 500米蛙泳
  // const minorNode7_1 = await prisma.node.create({
  //   data: {
  //     name: "500米自由泳",
  //     description: "完成500米自由泳",
  //     nodeType: "MINOR_NODE",

  //     courseId: swimmingCourse.id,
  //     unlockDepNodeCount: 1,
  //     maxLevel: 2,
  //   },
  // });

  // const minorNode7_2 = await prisma.node.create({
  //   data: {
  //     name: "500米蛙泳",
  //     description: "完成500米蛙泳",
  //     nodeType: "MINOR_NODE",

  //     courseId: swimmingCourse.id,
  //     unlockDepNodeCount: 1,
  //     maxLevel: 2,
  //   },
  // });

  // // 创建解锁依赖关系
  // await prisma.unlockDependency.createMany({
  //   data: [
  //     { fromNodeId: bigCheck4.id, toNodeId: majorNode7.id },
  //     { fromNodeId: majorNode7.id, toNodeId: minorNode7_1.id },
  //     { fromNodeId: majorNode7.id, toNodeId: minorNode7_2.id },
  //   ],
  // });

  // // 创建 MajorNode: 速度提升
  // const majorNode8 = await prisma.node.create({
  //   data: {
  //     name: "速度提升",
  //     description: "提升学生的游泳速度。",
  //     nodeType: "MAJOR_NODE",

  //     courseId: swimmingCourse.id,
  //     unlockDepNodeCount: 1,
  //     maxLevel: 3,
  //   },
  // });

  // // 创建子节点：100米自由泳 和 100米蛙泳
  // const minorNode8_1 = await prisma.node.create({
  //   data: {
  //     name: "100米自由泳",
  //     description: "完成100米自由泳",
  //     nodeType: "MINOR_NODE",

  //     courseId: swimmingCourse.id,
  //     unlockDepNodeCount: 1,
  //     maxLevel: 2,
  //   },
  // });

  // const minorNode8_2 = await prisma.node.create({
  //   data: {
  //     name: "100米蛙泳",
  //     description: "完成100米蛙泳",
  //     nodeType: "MINOR_NODE",

  //     courseId: swimmingCourse.id,
  //     unlockDepNodeCount: 1,
  //     maxLevel: 2,
  //   },
  // });

  // // 创建解锁依赖关系
  // await prisma.unlockDependency.createMany({
  //   data: [
  //     { fromNodeId: bigCheck4.id, toNodeId: majorNode8.id },
  //     { fromNodeId: majorNode8.id, toNodeId: minorNode8_1.id },
  //     { fromNodeId: majorNode8.id, toNodeId: minorNode8_2.id },
  //   ],
  // });

  // 创建bigcheck解锁依赖关系
  await prisma.unlockDependency.createMany({
    data: [
      { fromNodeId: bigCheck1.id, toNodeId: bigCheck2.id },
      // { fromNodeId: bigCheck2.id, toNodeId: bigCheck3.id },
      // { fromNodeId: bigCheck3.id, toNodeId: bigCheck4.id },
    ],
  });

  console.log(
    "Swimming course and nodes created successfully with dependencies."
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
