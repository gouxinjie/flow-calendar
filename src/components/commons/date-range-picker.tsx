"use client";

/**
 * @component DateRangePicker
 * @description 移动端日期范围选择器，基于 antd-mobile CalendarPicker 组件
 * @author gouxinjie
 * @created 2026-07-02
 */
import { useCallback, useState } from "react";
import { CalendarPicker } from "antd-mobile";
import dayjs from "dayjs";
import { CalendarBlank } from "@phosphor-icons/react";

import { cn } from "@/lib/cn";

interface DateRangePickerProps {
  /** 开始日期 YYYY-MM-DD */
  startDate: string;
  /** 结束日期 YYYY-MM-DD */
  endDate: string;
  /** 开始日期变更回调 */
  onStartDateChange: (date: string) => void;
  /** 结束日期变更回调 */
  onEndDateChange: (date: string) => void;
}

/** 字符串日期 → Date 对象 */
function toDate(dateStr: string): Date | undefined {
  if (!dateStr) return undefined;
  const d = dayjs(dateStr);
  return d.isValid() ? d.toDate() : undefined;
}

/** 用于按钮内展示的格式化 YYYY/MM/DD */
function display(dateStr: string, placeholder: string): string {
  if (!dateStr) return placeholder;
  return dayjs(dateStr).format("YYYY/MM/DD");
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangePickerProps) {
  const [visible, setVisible] = useState(false);

  // range 模式：value 为 [Date, Date] | null
  const [pickerValue, setPickerValue] = useState<[Date, Date] | null>(() => {
    const s = toDate(startDate);
    const e = toDate(endDate);
    return s && e ? [s, e] : null;
  });

  // 打开时同步当前值
  const handleOpen = useCallback(() => {
    const s = toDate(startDate);
    const e = toDate(endDate);
    setPickerValue(s && e ? [s, e] : null);
    setVisible(true);
  }, [startDate, endDate]);

  // 确认选择 → 写入父组件
  const handleConfirm = useCallback(
    (dates: [Date, Date] | null) => {
      if (dates && dates[0]) {
        onStartDateChange(dayjs(dates[0]).format("YYYY-MM-DD"));
      }
      if (dates && dates[1]) {
        onEndDateChange(dayjs(dates[1]).format("YYYY-MM-DD"));
      }
      setVisible(false);
    },
    [onStartDateChange, onEndDateChange],
  );

  // 关闭弹层（放弃修改）
  const handleClose = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <>
      <div className="flex items-center gap-2">
        {/* 开始日期按钮 */}
        <button
          type="button"
          onClick={handleOpen}
          className={cn(
            "flex flex-1 items-center gap-2 rounded-[14px] border px-3 py-3 text-left text-[14px] outline-none transition-colors duration-200",
            startDate
              ? "border-[#DCEAD2] text-[#1F2A2A]"
              : "border-[#DCEAD2] text-[#9BAE97]",
            "focus:border-[#5EBF3F]",
          )}
          aria-label="选择开始日期"
        >
          <CalendarBlank
            size={16}
            weight={startDate ? "fill" : "regular"}
            className={cn("shrink-0", startDate ? "text-[#5EBF3F]" : "text-[#9BAE97]")}
          />
          <span className="flex-1 truncate">{display(startDate, "开始日期")}</span>
        </button>

        <span className="shrink-0 text-[14px] text-[#9BAE97]">至</span>

        {/* 结束日期按钮 */}
        <button
          type="button"
          onClick={handleOpen}
          className={cn(
            "flex flex-1 items-center gap-2 rounded-[14px] border px-3 py-3 text-left text-[14px] outline-none transition-colors duration-200",
            endDate ? "border-[#DCEAD2] text-[#1F2A2A]" : "border-[#DCEAD2] text-[#9BAE97]",
            "focus:border-[#5EBF3F]",
          )}
          aria-label="选择结束日期"
        >
          <CalendarBlank
            size={16}
            weight={endDate ? "fill" : "regular"}
            className={cn("shrink-0", endDate ? "text-[#5EBF3F]" : "text-[#9BAE97]")}
          />
          <span className="flex-1 truncate">{display(endDate, "结束日期")}</span>
        </button>
      </div>

      {/* antd-mobile CalendarPicker 底部日历弹层 */}
        <CalendarPicker
          visible={visible}
          selectionMode="range"
          value={pickerValue}
          onChange={(v) => setPickerValue(v)}
          onConfirm={handleConfirm}
          onClose={handleClose}
          closeOnMaskClick
          confirmText="确定"
          title="选择日期范围"
          weekStartsOn="Monday"
          min={new Date(2020, 0, 1)}
        />
    </>
  );
}
