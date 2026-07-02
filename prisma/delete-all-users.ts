/**
 * @description 生产环境数据修复脚本 - 删除所有已注册用户及其关联数据
 * @description 级联删除：用户 → 活动标签、活动记录、用户设置
 * @description 注意：数据直接内联，不依赖 src/ 源码（部署包不含 src 目录）
 * @author gouxinjie
 * @created 2026-07-02
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== 删除所有已注册用户 ===\n");

  // 统计当前数据
  const userCount = await prisma.user.count();
  const logCount = await prisma.activityLog.count();
  const tagCount = await prisma.activityTag.count();
  const settingsCount = await prisma.userSettings.count();

  if (userCount === 0) {
    console.log("当前没有注册用户，无需操作。");
    return;
  }

  console.log(`即将删除以下数据：
  - 用户：${userCount} 条
  - 活动标签：${tagCount} 条（级联删除）
  - 活动记录：${logCount} 条（级联删除）
  - 用户设置：${settingsCount} 条（级联删除）
  `);

  // 删除所有用户（级联删除关联数据）
  const result = await prisma.user.deleteMany();

  console.log(`✅ 已删除 ${result.count} 个用户及其所有关联数据。`);

  // 验证清理结果
  const remainingUsers = await prisma.user.count();
  const remainingLogs = await prisma.activityLog.count();
  const remainingTags = await prisma.activityTag.count();
  const remainingSettings = await prisma.userSettings.count();

  console.log(`\n清理后数据：
  - 用户：${remainingUsers}
  - 活动标签：${remainingTags}
  - 活动记录：${remainingLogs}
  - 用户设置：${remainingSettings}
  `);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ 执行失败：", e);
    await prisma.$disconnect();
    process.exit(1);
  });
