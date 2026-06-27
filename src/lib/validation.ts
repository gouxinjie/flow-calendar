/**
 * @description 共享校验工具函数
 * @author gouxinjie
 * @created 2026-06-27
 */
import dayjs from "dayjs";

/** 校验日期格式是否为 YYYY-MM-DD */
export function isValidDate(date: string): boolean {
  return dayjs(date, "YYYY-MM-DD", true).isValid();
}

/** 校验时间格式是否为 HH:mm 或 HH:mm:ss（兼容不同浏览器 time input 输出） */
export function isValidTime(time: string): boolean {
  // 浏览器 <input type="time"> 可能返回 HH:mm 或 HH:mm:ss，统一取前 5 位校验
  const normalized = time.slice(0, 5);
  // 使用宽松模式校验，兼容不同浏览器格式
  return /^\d{2}:\d{2}$/.test(normalized) && dayjs(normalized, "HH:mm").isValid();
}
