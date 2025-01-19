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

  // Initialize ExperienceConfig
  await prisma.experienceConfig.createMany({
    data: [
      { level: 1, expPoints: 100 },
      { level: 2, expPoints: 200 },
      { level: 3, expPoints: 300 },
      { level: 4, expPoints: 400 },
      { level: 5, expPoints: 500 },
      { level: 6, expPoints: 600 },
      { level: 7, expPoints: 700 },
    ],
  });

  // Initialize RewardConfig
  await prisma.rewardConfig.createMany({
    data: [{ level: 1, rewardPoints: 50 }],
  });

  console.log("ExperienceConfig and RewardConfig initialized!");

  // Insert two teachers
  const teacher1 = await prisma.user.create({
    data: {
      name: "Teacher1",
      email: "teacher1@example.com",
      role: "TEACHER", // Enum type TEACHER
      skillPt: 100,
      password: "$2a$10$Ha1S1eCa1roNLC53amp0U.hX2p.v/r72.E5auJ9FMDyCkQKuRnSRO", //123456
    },
  });

  const teacher2 = await prisma.user.create({
    data: {
      name: "Teacher2",
      email: "teacher2@example.com",
      role: "TEACHER", // Enum type TEACHER
      skillPt: 100,
      password: "$2a$10$Ha1S1eCa1roNLC53amp0U.hX2p.v/r72.E5auJ9FMDyCkQKuRnSRO",
    },
  });

  // Insert five students
  const student1 = await prisma.user.create({
    data: {
      name: "Student1",
      email: "student1@example.com",
      role: "STUDENT", // Enum type STUDENT
      skillPt: 100,
      password: "$2a$10$Ha1S1eCa1roNLC53amp0U.hX2p.v/r72.E5auJ9FMDyCkQKuRnSRO",
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: "Student2",
      email: "student2@example.com",
      role: "STUDENT", // Enum type STUDENT
      skillPt: 100,
      password: "$2a$10$Ha1S1eCa1roNLC53amp0U.hX2p.v/r72.E5auJ9FMDyCkQKuRnSRO",
    },
  });

  const student3 = await prisma.user.create({
    data: {
      name: "Student3",
      email: "student3@example.com",
      role: "STUDENT", // Enum type STUDENT
      skillPt: 100,
      password: "$2a$10$Ha1S1eCa1roNLC53amp0U.hX2p.v/r72.E5auJ9FMDyCkQKuRnSRO",
    },
  });

  const student4 = await prisma.user.create({
    data: {
      name: "Student4",
      email: "student4@example.com",
      role: "STUDENT", // Enum type STUDENT
      skillPt: 100,
      password: "$2a$10$Ha1S1eCa1roNLC53amp0U.hX2p.v/r72.E5auJ9FMDyCkQKuRnSRO",
    },
  });

  const admin1 = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@example.com",
      role: "ADMIN",
      skillPt: 100,
      password: "$2a$10$Ha1S1eCa1roNLC53amp0U.hX2p.v/r72.E5auJ9FMDyCkQKuRnSRO",
    },
  });

  console.log("2 teachers and 5 students created successfully!");

  // Create swimming course
  const swimmingCourse = await prisma.course.create({
    data: {
      name: "Swimming Courses",
      description:
        "Learn from water adaptation to mastering various swimming styles",
      iconUrl: "/images/course_default_icon.png",
    },
  });

  // Associate students with course
  // const studentCourse = await prisma.userCourse.create({
  //   data: {
  //     userId: student1.id, // Student ID
  //     courseId: swimmingCourse.id,
  //   },
  // });

  const teacherCourse = await prisma.userCourse.create({
    data: {
      userId: teacher1.id,
      courseId: swimmingCourse.id,
    },
  });

  // Create BigCheck: Water Adaptation
  const bigCheck1 = await prisma.node.create({
    data: {
      name: "Water Adaptation",
      description:
        "Helps students adapt to the water environment and learn basic water movements and safety skills",
      nodeType: "BIGCHECK",
      courseId: swimmingCourse.id,
      unlockDepClusterTotalSkillPt: 0,
      maxLevel: -1, // BigCheck has no levels
      iconUrl: "/images/node_water_adaption.jpg",
      coolDown: 0,
      unlockType: UnlockType.CLUSTER_TOTAL_SKILL_POINT,
      exp: 0,
      rewardPt: 0,
    },
  });

  // Create MajorNode: Basic Breathing
  const majorNode1 = await prisma.node.create({
    data: {
      name: "Basic Breathing",
      description: "Learn how to control breathing in the water",
      nodeType: "MAJOR_NODE",
      courseId: swimmingCourse.id,
      unlockDepNodeCount: 1,
      maxLevel: 3,
      iconUrl: "/images/node_basic_breathing.jpg",
      coolDown: 0,
      unlockType: UnlockType.TIME_BASED,
      unlockDepTimeInterval: 6,
      exp: 50,
      rewardPt: 10,
    },
  });

  // Create child nodes: Holding Breath and Underwater Breathing
  const minorNode1_1 = await prisma.node.create({
    data: {
      name: "Holding Breath",
      description: "Learn how to hold your breath in water",
      nodeType: "MINOR_NODE",
      courseId: swimmingCourse.id,
      unlockDepNodeCount: 1,
      maxLevel: 1,
      iconUrl: "/images/node_holding_breath.jpg",
      coolDown: 10,
      unlockType: UnlockType.SKILL_POINT,
      exp: 30,
      rewardPt: 5,
    },
  });

  const minorNode1_2 = await prisma.node.create({
    data: {
      name: "Underwater Breathing",
      description: "Learn how to control breathing underwater",
      nodeType: "MINOR_NODE",
      courseId: swimmingCourse.id,
      unlockDepNodeCount: 1,
      maxLevel: 2,
      iconUrl: "/images/node_underwater_breathing.jpg",
      unlockType: UnlockType.TIME_BASED,
      unlockDepTimeInterval: 10,
      exp: 30,
      rewardPt: 5,
    },
  });

  // Create unlock dependencies
  await prisma.unlockDependency.createMany({
    data: [
      { fromNodeId: bigCheck1.id, toNodeId: majorNode1.id },
      { fromNodeId: majorNode1.id, toNodeId: minorNode1_1.id },
      { fromNodeId: majorNode1.id, toNodeId: minorNode1_2.id },
    ],
  });

  // Create MajorNode: Buoyancy Control
  const majorNode2 = await prisma.node.create({
    data: {
      name: "Buoyancy Control",
      description: "Learn how to maintain buoyancy in the water",
      nodeType: "MAJOR_NODE",
      courseId: swimmingCourse.id,
      unlockDepNodeCount: 1,
      maxLevel: 3,
      iconUrl: "/images/node_buoyancy_control.jpg",
      coolDown: 10,
      unlockType: UnlockType.SKILL_POINT,
      exp: 50,
      rewardPt: 10,
    },
  });

  // Create child nodes: Floating and Back Float
  const minorNode2_1 = await prisma.node.create({
    data: {
      name: "Floating",
      description: "Learn to maintain a float in the water",
      nodeType: "MINOR_NODE",
      courseId: swimmingCourse.id,
      unlockDepNodeCount: 1,
      maxLevel: 2,
      iconUrl: "/images/node_floating.jpg",
      coolDown: 0,
      unlockType: UnlockType.SKILL_POINT,
      exp: 30,
      rewardPt: 5,
    },
  });

  const minorNode2_2 = await prisma.node.create({
    data: {
      name: "Back Float",
      description: "Learn back floating techniques",
      nodeType: "MINOR_NODE",
      courseId: swimmingCourse.id,
      unlockDepNodeCount: 1,
      maxLevel: 1,
      iconUrl: "/images/node_back_float.jpg",
      coolDown: 0,
      unlockType: UnlockType.SKILL_POINT,
      exp: 30,
      rewardPt: 5,
    },
  });

  // Create unlock dependencies
  await prisma.unlockDependency.createMany({
    data: [
      { fromNodeId: bigCheck1.id, toNodeId: majorNode2.id },
      { fromNodeId: majorNode2.id, toNodeId: minorNode2_1.id },
      { fromNodeId: majorNode2.id, toNodeId: minorNode2_2.id },
    ],
  });

  // Create BigCheck: Basic Swimming Strokes
  const bigCheck2 = await prisma.node.create({
    data: {
      name: "Basic Swimming Strokes",
      description:
        "Learn basic swimming strokes like freestyle, breaststroke, and backstroke",
      nodeType: "BIGCHECK",
      courseId: swimmingCourse.id,
      unlockDepNodeCount: 1,
      unlockDepClusterTotalSkillPt: 5,
      maxLevel: -1, // BigCheck has no levels
      iconUrl: "/images/node_basic_swimming_strokes.jpg",
      coolDown: 0,
      unlockType: UnlockType.TIME_BASED,
      unlockDepTimeInterval: 10,
      exp: 0,
      rewardPt: 0,
    },
  });

  // Create MajorNode: Freestyle
  const majorNode3 = await prisma.node.create({
    data: {
      name: "Freestyle",
      description: "Learn the basics of freestyle swimming",
      nodeType: "MAJOR_NODE",
      courseId: swimmingCourse.id,
      unlockDepNodeCount: 1,
      maxLevel: 3,
      iconUrl: "/images/node_freestyle.jpg",
      coolDown: 0,
      unlockType: UnlockType.TIME_BASED,
      unlockDepTimeInterval: 5,
      exp: 50,
      rewardPt: 10,
    },
  });

  // Create child nodes: Freestyle Arm Movements and Freestyle Leg Movements
  const minorNode3_1 = await prisma.node.create({
    data: {
      name: "Freestyle Arm Movements",
      description: "Learn freestyle arm movements",
      nodeType: "MINOR_NODE",
      courseId: swimmingCourse.id,
      unlockDepNodeCount: 1,
      maxLevel: 2,
      iconUrl: "/images/node_freestyle_arm_movements.jpg",
      coolDown: 0,
      unlockType: UnlockType.SKILL_POINT,
      exp: 30,
      rewardPt: 5,
    },
  });

  const minorNode3_2 = await prisma.node.create({
    data: {
      name: "Freestyle Leg Movements",
      description: "Learn freestyle leg movements",
      nodeType: "MINOR_NODE",
      courseId: swimmingCourse.id,
      unlockDepNodeCount: 1,
      maxLevel: 2,
      iconUrl: "/images/node_freestyle_leg_movements.jpg",
      coolDown: 0,
      unlockType: UnlockType.SKILL_POINT,
      exp: 30,
      rewardPt: 5,
    },
  });

  await prisma.unlockDependency.createMany({
    data: [
      { fromNodeId: bigCheck2.id, toNodeId: majorNode3.id },
      { fromNodeId: majorNode3.id, toNodeId: minorNode3_1.id },
      { fromNodeId: majorNode3.id, toNodeId: minorNode3_2.id },
    ],
  });

  // Continue creating nodes for breaststroke, advanced swimming skills, etc.
  const majorNode4 = await prisma.node.create({
    data: {
      name: "Breaststroke",
      description: "Learn the basics of breaststroke",
      nodeType: "MAJOR_NODE",
      courseId: swimmingCourse.id,
      unlockDepNodeCount: 1,
      maxLevel: 3,
      iconUrl: "/images/node_breaststroke.jpg",
      coolDown: 0,
      unlockType: UnlockType.SKILL_POINT,
      exp: 50,
      rewardPt: 10,
    },
  });

  const minorNode4_1 = await prisma.node.create({
    data: {
      name: "Breaststroke Arm Movements",
      description: "Learn breaststroke arm movements",
      nodeType: "MINOR_NODE",
      courseId: swimmingCourse.id,
      unlockDepNodeCount: 1,
      maxLevel: 2,
      iconUrl: "/images/node_breaststroke_arm_movements.jpg",
      coolDown: 0,
      unlockType: UnlockType.SKILL_POINT,
      exp: 30,
      rewardPt: 5,
    },
  });

  const minorNode4_2 = await prisma.node.create({
    data: {
      name: "Breaststroke Leg Movements",
      description: "Learn breaststroke leg movements",
      nodeType: "MINOR_NODE",
      courseId: swimmingCourse.id,
      unlockDepNodeCount: 1,
      maxLevel: 2,
      iconUrl: "/images/node_breaststroke_leg_movements.jpg",
      coolDown: 0,
      unlockType: UnlockType.SKILL_POINT,
      exp: 30,
      rewardPt: 5,
    },
  });

  await prisma.unlockDependency.createMany({
    data: [
      { fromNodeId: bigCheck2.id, toNodeId: majorNode4.id },
      { fromNodeId: majorNode4.id, toNodeId: minorNode4_1.id },
      { fromNodeId: majorNode4.id, toNodeId: minorNode4_2.id },
    ],
  });
  // Create BigCheck: Advanced Swimming Skills
  const bigCheck3 = await prisma.node.create({
    data: {
      name: "Advanced Swimming Skills",
      description:
        "Master advanced techniques like turns, efficient strokes, and breathing.",
      nodeType: "BIGCHECK",
      courseId: swimmingCourse.id,
      unlockDepNodeCount: 1,
      unlockDepClusterTotalSkillPt: 4,
      maxLevel: -1, // BigCheck has no levels
      coolDown: 0,
      unlockType: UnlockType.TIME_BASED,
      unlockDepTimeInterval: 10,
      exp: 0,
      rewardPt: 0,
    },
  });

  // Create MajorNode: Turn Techniques
  const majorNode5 = await prisma.node.create({
    data: {
      name: "Turn Techniques",
      description: "Learn how to perform turns at the pool wall.",
      nodeType: "MAJOR_NODE",
      courseId: swimmingCourse.id,
      unlockDepNodeCount: 1,
      maxLevel: 3,
      coolDown: 0,
      unlockType: UnlockType.SKILL_POINT,
      exp: 50,
      rewardPt: 10,
    },
  });

  // Create child nodes: Freestyle Turn and Breaststroke Turn
  const minorNode5_1 = await prisma.node.create({
    data: {
      name: "Freestyle Turn",
      description: "Learn how to turn during freestyle swimming.",
      nodeType: "MINOR_NODE",
      courseId: swimmingCourse.id,
      unlockDepNodeCount: 1,
      maxLevel: 2,
      coolDown: 0,
      unlockType: UnlockType.SKILL_POINT,
      exp: 30,
      rewardPt: 5,
    },
  });

  const minorNode5_2 = await prisma.node.create({
    data: {
      name: "Breaststroke Turn",
      description: "Learn how to turn during breaststroke swimming.",
      nodeType: "MINOR_NODE",
      courseId: swimmingCourse.id,
      unlockDepNodeCount: 1,
      maxLevel: 2,
      coolDown: 0,
      unlockType: UnlockType.SKILL_POINT,
      exp: 30,
      rewardPt: 5,
    },
  });

  // Create unlock dependencies for MajorNode: Turn Techniques
  await prisma.unlockDependency.createMany({
    data: [
      { fromNodeId: bigCheck3.id, toNodeId: majorNode5.id },
      { fromNodeId: majorNode5.id, toNodeId: minorNode5_1.id },
      { fromNodeId: majorNode5.id, toNodeId: minorNode5_2.id },
    ],
  });

  // Create MajorNode: Stroke Efficiency
  const majorNode6 = await prisma.node.create({
    data: {
      name: "Stroke Efficiency",
      description: "Improve stroke efficiency and increase swimming speed.",
      nodeType: "MAJOR_NODE",
      courseId: swimmingCourse.id,
      unlockDepNodeCount: 1,
      maxLevel: 3,
      coolDown: 0,
      unlockType: UnlockType.SKILL_POINT,
      exp: 50,
      rewardPt: 10,
    },
  });

  // Create child nodes: Freestyle Stroke Efficiency and Breaststroke Stroke Efficiency
  const minorNode6_1 = await prisma.node.create({
    data: {
      name: "Freestyle Stroke Efficiency",
      description: "Improve freestyle stroke efficiency.",
      nodeType: "MINOR_NODE",
      courseId: swimmingCourse.id,
      unlockDepNodeCount: 1,
      maxLevel: 2,
      coolDown: 0,
      unlockType: UnlockType.SKILL_POINT,
      exp: 30,
      rewardPt: 5,
    },
  });

  const minorNode6_2 = await prisma.node.create({
    data: {
      name: "Breaststroke Stroke Efficiency",
      description: "Improve breaststroke stroke efficiency.",
      nodeType: "MINOR_NODE",
      courseId: swimmingCourse.id,
      unlockDepNodeCount: 1,
      maxLevel: 2,
      coolDown: 0,
      unlockType: UnlockType.SKILL_POINT,
      exp: 30,
      rewardPt: 5,
    },
  });

  // Create unlock dependencies for MajorNode: Stroke Efficiency
  await prisma.unlockDependency.createMany({
    data: [
      { fromNodeId: bigCheck3.id, toNodeId: majorNode6.id },
      { fromNodeId: majorNode6.id, toNodeId: minorNode6_1.id },
      { fromNodeId: majorNode6.id, toNodeId: minorNode6_2.id },
    ],
  });

  // Create unlock dependencies for MajorNode: Stroke Efficiency
  await prisma.unlockDependency.createMany({
    data: [
      { fromNodeId: bigCheck3.id, toNodeId: majorNode6.id },
      { fromNodeId: majorNode6.id, toNodeId: minorNode6_1.id },
      { fromNodeId: majorNode6.id, toNodeId: minorNode6_2.id },
    ],
  });

  // Create BigCheck: Endurance and Speed
  const bigCheck4 = await prisma.node.create({
    data: {
      name: "Endurance and Speed",
      description:
        "Increase endurance and speed for long-distance swimming or competition.",
      nodeType: "BIGCHECK",
      courseId: swimmingCourse.id,
      unlockDepNodeCount: 1,
      unlockDepClusterTotalSkillPt: 6,
      maxLevel: -1, // BigCheck has no levels
      coolDown: 0,
      unlockType: UnlockType.TIME_BASED,
      unlockDepTimeInterval: 10,
      exp: 0,
      rewardPt: 0,
    },
  });

  // Create MajorNode: Long Distance Swimming
  const majorNode7 = await prisma.node.create({
    data: {
      name: "Long Distance Swimming",
      description: "Increase endurance to complete longer distance swims.",
      nodeType: "MAJOR_NODE",
      courseId: swimmingCourse.id,
      unlockDepNodeCount: 1,
      maxLevel: 3,
      coolDown: 0,
      unlockType: UnlockType.SKILL_POINT,
      exp: 50,
      rewardPt: 10,
    },
  });

  // Create child nodes: 500m Freestyle and 500m Breaststroke
  const minorNode7_1 = await prisma.node.create({
    data: {
      name: "500m Freestyle",
      description: "Complete 500m freestyle swimming.",
      nodeType: "MINOR_NODE",
      courseId: swimmingCourse.id,
      unlockDepNodeCount: 1,
      maxLevel: 2,
      coolDown: 0,
      unlockType: UnlockType.SKILL_POINT,
      exp: 30,
      rewardPt: 5,
    },
  });

  const minorNode7_2 = await prisma.node.create({
    data: {
      name: "500m Breaststroke",
      description: "Complete 500m breaststroke swimming.",
      nodeType: "MINOR_NODE",
      courseId: swimmingCourse.id,
      unlockDepNodeCount: 1,
      maxLevel: 2,
      coolDown: 0,
      unlockType: UnlockType.SKILL_POINT,
      exp: 30,
      rewardPt: 5,
    },
  });

  // Create unlock dependencies for MajorNode: Long Distance Swimming
  await prisma.unlockDependency.createMany({
    data: [
      { fromNodeId: bigCheck4.id, toNodeId: majorNode7.id },
      { fromNodeId: majorNode7.id, toNodeId: minorNode7_1.id },
      { fromNodeId: majorNode7.id, toNodeId: minorNode7_2.id },
    ],
  });
  // Create MajorNode: Speed Enhancement
  const majorNode8 = await prisma.node.create({
    data: {
      name: "Speed Enhancement",
      description: "Increase swimming speed.",
      nodeType: "MAJOR_NODE",
      courseId: swimmingCourse.id,
      unlockDepNodeCount: 1,
      maxLevel: 3,
      coolDown: 0,
      unlockType: UnlockType.SKILL_POINT,
      exp: 50,
      rewardPt: 10,
    },
  });

  // Create child nodes: 100m Freestyle and 100m Breaststroke
  const minorNode8_1 = await prisma.node.create({
    data: {
      name: "100m Freestyle",
      description: "Complete 100m freestyle swimming.",
      nodeType: "MINOR_NODE",
      courseId: swimmingCourse.id,
      unlockDepNodeCount: 1,
      maxLevel: 2,
      coolDown: 0,
      unlockType: UnlockType.SKILL_POINT,
      exp: 30,
      rewardPt: 5,
    },
  });

  const minorNode8_2 = await prisma.node.create({
    data: {
      name: "100m Breaststroke",
      description: "Complete 100m breaststroke swimming.",
      nodeType: "MINOR_NODE",
      courseId: swimmingCourse.id,
      unlockDepNodeCount: 1,
      maxLevel: 2,
      coolDown: 0,
      unlockType: UnlockType.SKILL_POINT,
      exp: 30,
      rewardPt: 5,
    },
  });

  // Create unlock dependencies for MajorNode: Speed Enhancement
  await prisma.unlockDependency.createMany({
    data: [
      { fromNodeId: bigCheck4.id, toNodeId: majorNode8.id },
      { fromNodeId: majorNode8.id, toNodeId: minorNode8_1.id },
      { fromNodeId: majorNode8.id, toNodeId: minorNode8_2.id },
    ],
  });

  // Create unlock dependencies between BigChecks
  await prisma.unlockDependency.createMany({
    data: [
      { fromNodeId: bigCheck1.id, toNodeId: bigCheck2.id },
      { fromNodeId: bigCheck2.id, toNodeId: bigCheck3.id },
      { fromNodeId: bigCheck3.id, toNodeId: bigCheck4.id },
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
