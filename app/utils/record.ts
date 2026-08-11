/**
 * @description 记录排序与展示工具
 */
import type { ActivityLog } from "@/types/models";

/**
 * @description 按时间正序排列同一天记录（默认按创建时间正序）
 */
export function sortRecordsByTimeline(records: ActivityLog[]): ActivityLog[] {
  return [...records].sort((left, right) => {
    return left.createdAt.localeCompare(right.createdAt);
  });
}

/**
 * @description 按时间倒序排列记录
 */
export function sortRecordsByRecent(records: ActivityLog[]): ActivityLog[] {
  return [...records].sort((left, right) => {
    if (left.date !== right.date) {
      return right.date.localeCompare(left.date);
    }
    return right.createdAt.localeCompare(left.createdAt);
  });
}
