/**
 * @description 月历构建、日期格式与农历/节气工具
 */
import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData";
import "dayjs/locale/zh-cn";
import { Solar } from "lunar-typescript";

import type { ActivityLog, ActivityTag, CalendarCell } from "@/types/models";

dayjs.extend(localeData);
dayjs.locale("zh-cn");

/** 星期标题（中文单字） */
export const WEEKDAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"];

/**
 * @description 获取星期标题列表
 */
export function getWeekdayLabels(): string[] {
  return WEEKDAY_LABELS;
}

/**
 * @description 格式化日期为页面标题用的中文格式，如 "6月22日 周一"
 */
export function formatHeaderDate(date: string): string {
  return dayjs(date).format("M月D日 ddd");
}

/**
 * @description 格式化月份标题，如 "2024年6月"
 */
export function formatMonthTitle(month: string): string {
  const d = dayjs(`${month}-01`);
  return d.format("YYYY年M月");
}

/**
 * @description 获取农历或节气标签
 * 优先级：节气 > 公历节日 > 农历（初一显示月份，其他显示日）
 */
export function getLunarLabel(date: string): string {
  const d = dayjs(date);
  const solar = Solar.fromYmd(d.year(), d.month() + 1, d.date());
  const lunar = solar.getLunar();
  const jieQi = lunar.getJieQi();
  const solarFestival = solar.getFestivals()[0];

  if (jieQi) return jieQi;
  if (solarFestival) return solarFestival;

  const lunarDay = lunar.getDayInChinese();
  if (lunarDay === "初一") {
    return `${lunar.getMonthInChinese()}月`;
  }
  return lunarDay;
}

/**
 * @description 构建月历网格数据
 * @param month - YYYY-MM 格式的月份
 * @param records - 当月及前后补白日期的活动记录
 * @param tags - 用户标签列表
 * @param selectedDate - 当前选中日期
 * @param today - 今天日期 YYYY-MM-DD
 */
export function buildMonthCells(
  month: string,
  records: ActivityLog[],
  tags: ActivityTag[],
  selectedDate: string,
  today: string,
): CalendarCell[] {
  const monthStart = dayjs(`${month}-01`);
  // 从该月第一天所在周的周日开始
  const gridStart = monthStart.subtract(monthStart.day(), "day");

  // 标签 id -> 标签 映射
  const tagMap = new Map(tags.map((t) => [t.id, t]));

  // 按日期分组记录
  const groupedRecords = new Map<string, ActivityLog[]>();
  for (const r of records) {
    const list = groupedRecords.get(r.date) ?? [];
    list.push(r);
    groupedRecords.set(r.date, list);
  }

  return Array.from({ length: 42 }, (_, index) => {
    const currentDay = gridStart.add(index, "day");
    const dateKey = currentDay.format("YYYY-MM-DD");
    const dateRecords = (groupedRecords.get(dateKey) ?? []).sort((left, right) => {
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

    // 取前 2 条记录作为摘要，优先展示标题，标签颜色仅作为辅助识别
    const recordSummaries = dateRecords.slice(0, 2).map((r) => {
      const tag = r.tagId ? tagMap.get(r.tagId) : undefined;
      return {
        id: r.id,
        title: r.title,
        tagColor: tag?.color,
      };
    });

    return {
      date: dateKey,
      dayNumber: currentDay.date(),
      lunarLabel: getLunarLabel(dateKey),
      isCurrentMonth: currentDay.month() === monthStart.month(),
      isToday: dateKey === today,
      isSelected: dateKey === selectedDate,
      recordSummaries,
      overflowCount: Math.max(dateRecords.length - 2, 0),
    };
  });
}
