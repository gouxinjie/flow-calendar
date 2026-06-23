/**
 * @description 记录排序与展示工具
 */
import type { ActivityLog } from "@/types/models";

/**
 * @description 按时间正序排列同一天记录
 * 指定时间优先，全天记录排在最后
 */
export function sortRecordsByTimeline(records: ActivityLog[]): ActivityLog[] {
  return [...records].sort((left, right) => {
    if (left.timeType !== right.timeType) {
      return left.timeType === "scheduled" ? -1 : 1;
    }

    if (left.startTime && right.startTime) {
      return left.startTime.localeCompare(right.startTime);
    }

    if (left.startTime) {
      return -1;
    }

    if (right.startTime) {
      return 1;
    }

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

    if (left.startTime && right.startTime) {
      return right.startTime.localeCompare(left.startTime);
    }

    if (left.startTime) {
      return -1;
    }

    if (right.startTime) {
      return 1;
    }

    return right.createdAt.localeCompare(left.createdAt);
  });
}
