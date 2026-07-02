/**
 * @description 数据库种子脚本 - 初始化 demo 用户和示例数据
 * @author gouxinjie
 * @created 2026-06-22
 * @updated 2026-07-02
 */
import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";

import { hashPassword, isHashedPassword } from "../src/server/password";
import { DEFAULT_TAGS } from "../src/server/default-tags";

const prisma = new PrismaClient();

async function main() {
  // 创建 Demo 用户（如果不存在）
  const demoPhone = "13113183859";
  const demoPassword = "xinjie123";
  const passwordHash = hashPassword(demoPassword);

  const existing = await prisma.user.findUnique({
    where: { id: "user_demo_001" },
  });

  await prisma.user.upsert({
    where: { id: "user_demo_001" },
    create: {
      id: "user_demo_001",
      name: "小柠",
      phone: demoPhone,
      passwordHash,
    },
    update: {
      name: "小柠",
      phone: demoPhone,
      passwordHash: existing && isHashedPassword(existing.passwordHash)
        ? hashPassword(demoPassword)
        : passwordHash,
    },
  });

  console.log(
    `${existing ? "Demo 用户已更新" : "Demo 用户已创建"}: ${demoPhone} / xinjie123`,
  );

  // Demo 用户标签固定 ID 映射（用于已有 demo 记录引用）
  const demoTagIdMap: Record<string, string> = {
    "工作": "tag_work",
    "学习": "tag_study",
    "运动": "tag_sport",
    "外出": "tag_outdoor",
    "聚会": "tag_social",
    "观影": "tag_movie",
    "休息": "tag_rest",
    "旅游": "tag_read",
    "开心": "tag_mood_good",
    "低落": "tag_mood_bad",
  };

  // 创建默认标签（数据来源于共享标签定义）
  const defaultTags = DEFAULT_TAGS.map((tag) => ({
    ...tag,
    id: demoTagIdMap[tag.name] ?? `tag_${tag.name}`,
  }));

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
