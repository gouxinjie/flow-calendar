/**
 * @description 律动日历 Web 移动端共享类型定义
 * 基于 PRD v2 的记录型月历模型
 */

/** 标签分类 */
export type TagCategory =
  | "work"
  | "health"
  | "social"
  | "leisure"
  | "rest"
  | "other";

/** 标签语义色调 */
export type TagColorTone =
  | "green"
  | "blue"
  | "orange"
  | "purple"
  | "greyGreen"
  | "gray";

/** 排序方向 */
export type SortOrder = "asc" | "desc";

/** 用户信息 */
export interface UserProfile {
  id: string;
  name: string;
  email?: string | null;
  phone: string;
  avatar?: string | null;
  createdAt: string;
}

/** 活动标签 */
export interface ActivityTag {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon?: string | null;
  category?: TagCategory | null;
  sortOrder: number;
  enabled: boolean;
}

/** 活动记录 */
export interface ActivityLog {
  id: string;
  userId: string;
  tagId?: string | null;
  title: string;
  note?: string | null;
  timeType: string;          // all_day / scheduled
  status: string;             // logged（本期仅此一种状态）
  startTime?: string | null;
  date: string;
  repeatRuleId?: string | null;
  tag?: ActivityTag | null;
  createdAt: string;
  updatedAt: string;
}

/** 用户设置 */
export interface UserSettings {
  id: string;
  userId: string;
  weekStartsOn: number;
  showLunar: boolean;
  defaultView: "month" | "week";
}

/** 月历单元格数据 */
export interface CalendarCell {
  date: string;
  dayNumber: number;
  lunarLabel: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  recordSummaries: Array<{
    id: string;
    title: string;
    tagColor?: string;
  }>;
  overflowCount: number;
}

/** 日期详情 */
export interface DateDetail {
  date: string;
  lunarLabel: string;
  holidayName?: string;
  records: ActivityLog[];
  totalCount: number;
}

/** 月度回顾 */
export interface MonthReview {
  year: number;
  month: number;
  totalRecords: number;
  recordDays: number;
  topTags: Array<{
    tagId: string;
    tagName: string;
    tagColor: string;
    count: number;
  }>;
  recentRecords: ActivityLog[];
}

/** 搜索筛选条件 */
export interface SearchFilters {
  keyword?: string;
  tagId?: string;
  startDate?: string;
  endDate?: string;
  includeUncategorized?: boolean;
}

/** 搜索结果分组 */
export interface SearchResultGroup {
  date: string;
  records: ActivityLog[];
}

/** 记录查询参数 */
export interface RecordQueryParams extends SearchFilters {
  date?: string;
  month?: string;
  sort?: SortOrder;
}

/** 通用成功响应 */
export interface ApiSuccess<T> {
  success: true;
  code: number;
  message: string;
  data: T;
}

/** 通用错误响应 */
export interface ApiError {
  success: false;
  code: string;
  message: string;
  data: null;
}

/** 通用响应 */
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

/** 新建/编辑记录表单 */
export interface RecordFormData {
  title: string;
  tagId?: string;
  startTime?: string;
  date: string;
  note?: string;
}

/** 新建/编辑标签表单 */
export interface TagFormData {
  name: string;
  color: string;
  icon?: string;
  category?: TagCategory;
  sortOrder: number;
  enabled?: boolean;
}

/** 更新账号信息表单 */
export interface AccountFormData {
  name: string;
  phone?: string;
}

/** 预设标签颜色方案 */
export const TAG_COLOR_MAP: Record<TagColorTone, { bg: string; text: string; border: string }> = {
  green: { bg: "#DDF7F1", text: "#16967F", border: "#22C3A6" },
  blue: { bg: "#E8F4FD", text: "#3D8BC9", border: "#5DA9E9" },
  orange: { bg: "#FFF3E8", text: "#E08830", border: "#FF9F43" },
  purple: { bg: "#F0EFFC", text: "#6E6DCF", border: "#8B8AEF" },
  greyGreen: { bg: "#F0F3F1", text: "#7A8A82", border: "#A8B8B0" },
  gray: { bg: "#F3F4F6", text: "#6B7280", border: "#9CA3AF" },
};
