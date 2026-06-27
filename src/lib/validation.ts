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


