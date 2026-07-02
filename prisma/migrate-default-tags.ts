/**
 * @description 一次性数据修复脚本 - 为已有注册用户补齐默认标签
 * @description 仅对没有任何标签的用户补标签，已有标签的用户不处理
 * @description 注意：数据直接内联，不依赖 src/ 源码（部署包不含 src 目录）
 * @author gouxinjie
 * @created 2026-07-02
 * @updated 2026-07-02 - 修复独立运行时 DATABASE_URL 未加载的问题
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";

// 独立脚本不会自动加载 .env，手动读取设置环境变量
function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), ".env");
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let value = trimmed.slice(eqIdx + 1).trim();
      // 去除引号
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env 文件不存在时使用当前环境变量
  }
}

loadEnv();

// 默认标签数据直接内联（与 src/server/default-tags.ts 保持一致）
// 不能 import src/ 源码，因为部署产物中不包含 src/ 目录
const DEFAULT_TAGS = [
  { name: "工作", color: "#5DA9E9", icon: "briefcase", category: "work", sortOrder: 1 },
  { name: "学习", color: "#5F6EF3", icon: "book", category: "work", sortOrder: 2 },
  { name: "运动", color: "#FF9F43", icon: "barbell", category: "health", sortOrder: 3 },
  { name: "外出", color: "#F46D5E", icon: "compass", category: "leisure", sortOrder: 4 },
  { name: "聚会", color: "#8B8AEF", icon: "users", category: "social", sortOrder: 5 },
  { name: "观影", color: "#C27BFF", icon: "film", category: "leisure", sortOrder: 6 },
  { name: "休息", color: "#22C3A6", icon: "moon", category: "rest", sortOrder: 7 },
  { name: "旅游", color: "#06B6D4", icon: "globe", category: "leisure", sortOrder: 8 },
  { name: "开心", color: "#F6AD55", icon: "smiley", category: "mood", sortOrder: 9 },
  { name: "低落", color: "#A8B8B0", icon: "smiley-sad", category: "mood", sortOrder: 10 },
];

const prisma = new PrismaClient();

async function main() {
  // 找出所有没有任何标签的用户
  const allUsers = await prisma.user.findMany({
    select: { id: true, name: true },
    where: {
      activityTags: { none: {} }, // 只查标签数为 0 的用户
    },
  });

  if (allUsers.length === 0) {
    console.log("所有用户已有标签，无需修复。");
    return;
  }

  console.log(`发现 ${allUsers.length} 个无标签用户，开始补齐默认标签...\n`);

  let totalCreated = 0;

  for (const user of allUsers) {
    await prisma.activityTag.createMany({
      data: DEFAULT_TAGS.map((tag) => ({
        ...tag,
        userId: user.id,
      })),
    });
    totalCreated += DEFAULT_TAGS.length;
    console.log(`  ✅ ${user.name}（${user.id}）— 已添加 ${DEFAULT_TAGS.length} 个默认标签`);
  }

  console.log(`\n修复完成：共为 ${allUsers.length} 个用户创建 ${totalCreated} 个标签。`);
}

main()
  .catch((e) => {
    console.error("修复失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
