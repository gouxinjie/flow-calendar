/**
 * @description 数据库种子脚本 - 初始化 demo 用户和示例数据
 * @author gouxinjie
 * @created 2026-06-22
 */
import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";

import { hashPassword, isHashedPassword } from "../src/server/password";

const prisma = new PrismaClient();

async function main() {
  // 创建 Demo 用户（如果不存在）
  const demoEmail = "2562755718@qq.com";
  const demoPassword = "xinjie123";
  const passwordHash = hashPassword(demoPassword);

  const existing = await prisma.user.findUnique({
    where: { id: "user_demo_001" },
  });

  await prisma.user.upsert({
    where: { id: "user_demo_001" },
    create: {
      id: "user_demo_001",
      name: "小律",
      email: demoEmail,
      passwordHash,
    },
    update: {
      name: "小律",
      email: demoEmail,
      passwordHash: existing && isHashedPassword(existing.passwordHash)
        ? hashPassword(demoPassword)
        : passwordHash,
    },
  });

  console.log(
    `${existing ? "Demo 用户已更新" : "Demo 用户已创建"}: 2562755718@qq.com / xinjie123`,
  );

  // 创建默认标签
  const defaultTags = [
    { id: "tag_work", name: "工作", color: "#5DA9E9", icon: "briefcase", category: "work", sortOrder: 1 },
    { id: "tag_study", name: "学习", color: "#5F6EF3", icon: "book", category: "work", sortOrder: 2 },
    { id: "tag_sport", name: "运动", color: "#FF9F43", icon: "barbell", category: "health", sortOrder: 3 },
    { id: "tag_outdoor", name: "外出", color: "#F46D5E", icon: "compass", category: "leisure", sortOrder: 4 },
    { id: "tag_social", name: "聚会", color: "#8B8AEF", icon: "users", category: "social", sortOrder: 5 },
    { id: "tag_movie", name: "观影", color: "#C27BFF", icon: "film", category: "leisure", sortOrder: 6 },
    { id: "tag_rest", name: "休息", color: "#A8B8B0", icon: "moon", category: "rest", sortOrder: 7 },
    { id: "tag_read", name: "阅读", color: "#22C3A6", icon: "book-open", category: "leisure", sortOrder: 8 },
  ];

  for (const tag of defaultTags) {
    await prisma.activityTag.upsert({
      where: { id: tag.id },
      create: { ...tag, userId: "user_demo_001" },
      update: { name: tag.name, color: tag.color },
    });
  }

  console.log("默认标签已创建");

  const recordCount = await prisma.activityLog.count({
    where: { userId: "user_demo_001" },
  });

  if (recordCount === 0) {
    const today = dayjs();
    const demoRecords = [
      {
        id: "log_demo_01",
        title: "晨间拉伸 20 分钟",
        note: "状态慢慢醒过来，整天都更轻一点。",
        date: today.format("YYYY-MM-DD"),
        timeType: "scheduled",
        startTime: "07:30",
        tagId: "tag_sport",
      },
      {
        id: "log_demo_02",
        title: "梳理本周工作清单",
        note: "把遗留事项整理到一起，下午推进顺了很多。",
        date: today.subtract(1, "day").format("YYYY-MM-DD"),
        timeType: "scheduled",
        startTime: "10:00",
        tagId: "tag_work",
      },
      {
        id: "log_demo_03",
        title: "晚饭后散步",
        note: "沿江边走了半小时，风很舒服。",
        date: today.subtract(2, "day").format("YYYY-MM-DD"),
        timeType: "scheduled",
        startTime: "20:10",
        tagId: "tag_outdoor",
      },
      {
        id: "log_demo_04",
        title: "看完一本随笔集",
        note: "断断续续读了一周，今天终于翻完。",
        date: today.subtract(4, "day").format("YYYY-MM-DD"),
        timeType: "all_day",
        startTime: null,
        tagId: "tag_read",
      },
      {
        id: "log_demo_05",
        title: "和朋友吃了顿饭",
        note: "聊了很多近况，整个人轻松不少。",
        date: today.subtract(6, "day").format("YYYY-MM-DD"),
        timeType: "scheduled",
        startTime: "19:30",
        tagId: "tag_social",
      },
    ] as const;

    for (const record of demoRecords) {
      await prisma.activityLog.upsert({
        where: { id: record.id },
        update: record,
        create: {
          ...record,
          userId: "user_demo_001",
        },
      });
    }

    console.log("示例记录已创建");
  }
}

main()
  .catch((e) => {
    console.error("Seed 失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
