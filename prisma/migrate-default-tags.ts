/**
 * @description 一次性数据修复脚本 - 为已有注册用户补齐默认标签
 * @description 仅对没有任何标签的用户补标签，已有标签的用户不处理
 * @author gouxinjie
 * @created 2026-07-02
 */
import { PrismaClient } from "@prisma/client";
import { DEFAULT_TAGS } from "../src/server/default-tags";

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
