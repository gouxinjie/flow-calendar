/**
 * @description 月历相关状态管理（Zustand）
 * @author gouxinjie
 * @created 2026-06-22
 */
import { create } from "zustand";
import dayjs from "dayjs";

interface CalendarState {
  /** 当前查看的月份 YYYY-MM */
  currentMonth: string;
  /** 选中的日期 YYYY-MM-DD */
  selectedDate: string;
  /** 今天的日期 YYYY-MM-DD */
  today: string;

  /** 设置当前月份 */
  setCurrentMonth: (month: string) => void;
  /** 设置选中日期 */
  setSelectedDate: (date: string) => void;
  /** 切换到上个月 */
  goToPrevMonth: () => void;
  /** 切换到下个月 */
  goToNextMonth: () => void;
  /** 回到今天 */
  goToToday: () => void;
}

export const useCalendarStore = create<CalendarState>((set, get) => {
  const today = dayjs().format("YYYY-MM-DD");
  const currentMonth = dayjs().format("YYYY-MM");

  return {
    currentMonth,
    selectedDate: today,
    today,

    setCurrentMonth: (month) => set({ currentMonth: month }),
    setSelectedDate: (date) => set({ selectedDate: date }),

    goToPrevMonth: () => {
      const prev = dayjs(`${get().currentMonth}-01`).subtract(1, "month");
      set({
        currentMonth: prev.format("YYYY-MM"),
        selectedDate: prev.format("YYYY-MM-DD"),
      });
    },

    goToNextMonth: () => {
      const next = dayjs(`${get().currentMonth}-01`).add(1, "month");
      // 不能超过当月
      const thisMonth = dayjs().format("YYYY-MM");
      if (next.format("YYYY-MM") > thisMonth) return;
      set({
        currentMonth: next.format("YYYY-MM"),
        selectedDate: next.format("YYYY-MM-DD"),
      });
    },

    goToToday: () => {
      set({
        currentMonth: dayjs().format("YYYY-MM"),
        selectedDate: dayjs().format("YYYY-MM-DD"),
      });
    },
  };
});
