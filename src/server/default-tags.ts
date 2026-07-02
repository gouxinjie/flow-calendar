/**
 * @description 默认标签定义 - 新用户注册时自动初始化，与 prisma/seed.ts 保持数据一致
 * @author gouxinjie
 * @created 2026-07-02
 */

/**
 * 单个默认标签的数据结构（不含 id，由数据库自动生成）
 */
export interface DefaultTagData {
  name: string;
  color: string;
  icon: string;
  category: string;
  sortOrder: number;
}

/**
 * 新用户注册时自动创建的默认标签列表
 * 与 prisma/seed.ts 中的标签保持一致
 */
export const DEFAULT_TAGS: DefaultTagData[] = [
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
