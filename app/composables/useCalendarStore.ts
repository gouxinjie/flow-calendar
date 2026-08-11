/**
 * @composable useCalendarStore
 * @description 将 Zustand store 适配为 Vue 响应式组合式函数
 * 通过 ref 响应式同步 store 状态，页面可直接读写
 * @author gouxinjie
 * @created 2026-08-10
 */
import { useCalendarStore as useRawStore } from "@/stores/calendar-store";

export function useCalendarStore() {
  const store = useRawStore;

  // 响应式状态（订阅 store 变化）
  const currentMonth = ref(store.getState().currentMonth);
  const selectedDate = ref(store.getState().selectedDate);
  const today = ref(store.getState().today);
  const refreshKey = ref(store.getState().refreshKey);

  // 订阅 store 变化同步到 ref
  store.subscribe((state) => {
    currentMonth.value = state.currentMonth;
    selectedDate.value = state.selectedDate;
    today.value = state.today;
    refreshKey.value = state.refreshKey;
  });

  // actions 透传
  const setCurrentMonth = (month: string) => store.getState().setCurrentMonth(month);
  const setSelectedDate = (date: string) => store.getState().setSelectedDate(date);
  const triggerRefresh = () => store.getState().triggerRefresh();
  const goToPrevMonth = () => store.getState().goToPrevMonth();
  const goToNextMonth = () => store.getState().goToNextMonth();
  const goToToday = () => store.getState().goToToday();

  return {
    currentMonth,
    selectedDate,
    today,
    refreshKey,
    setCurrentMonth,
    setSelectedDate,
    triggerRefresh,
    goToPrevMonth,
    goToNextMonth,
    goToToday,
  };
}
