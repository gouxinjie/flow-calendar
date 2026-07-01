"use client";

/**
 * @component MonthPickerSheet
 * @description 月份跳转弹层
 * @author gouxinjie
 * @created 2026-06-22
 * @updated 2026-06-27
 */
import { useState } from "react";

import { BottomSheet } from "@/components/business/shared/bottom-sheet";
import { cn } from "@/lib/cn";

interface MonthPickerSheetProps {
  open: boolean;
  onClose: () => void;
  currentYear: number;
  currentMonth: number;
  onSelect: (year: number, month: number) => void;
}

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

export function MonthPickerSheet({
  open,
  onClose,
  currentYear,
  currentMonth,
  onSelect,
}: MonthPickerSheetProps) {
  const [year, setYear] = useState(currentYear);
  const currentDate = new Date();
  const thisYear = currentDate.getFullYear();
  const thisMonth = currentDate.getMonth() + 1;

  const yearOptions = Array.from({ length: thisYear - 2021 + 1 }, (_, i) => 2021 + i);

  const handleSelect = (m: number) => {
    onSelect(year, m);
    onClose();
  };

  const handleGoToThisMonth = () => {
    onSelect(thisYear, thisMonth);
    onClose();
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="选择月份"
      footer={
        <button
          onClick={handleGoToThisMonth}
          className="flex h-[48px] w-full items-center justify-center rounded-[14px] bg-[#5EBF3F] text-[14px] font-semibold text-white active:opacity-80"
        >
          回到本月
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-2 block text-[13px] font-medium text-[#6B7A7A]">年份</label>
          <div className="flex flex-wrap gap-2">
            {yearOptions.map((y) => (
              <button
                key={y}
                onClick={() => setYear(y)}
                className={cn(
                  "rounded-[10px] px-4 py-2 text-[14px] font-medium transition-colors",
                  year === y ? "bg-[#5EBF3F] text-white" : "bg-[#F4F9F1] text-[#6B7A7A]",
                )}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-[13px] font-medium text-[#6B7A7A]">月份</label>
          <div className="grid grid-cols-4 gap-2">
            {MONTHS.map((m) => {
              const isFuture = year === thisYear && m > thisMonth;
              const isCurrent = year === currentYear && m === currentMonth;

              return (
                <button
                  key={m}
                  onClick={() => !isFuture && handleSelect(m)}
                  disabled={isFuture}
                  className={cn(
                    "rounded-[10px] py-3 text-[14px] font-medium transition-colors",
                    isFuture && "cursor-not-allowed bg-[#F4F9F1] text-[#C2CCC0]",
                    !isFuture && isCurrent && "bg-[#5EBF3F] text-white",
                    !isFuture && !isCurrent && "bg-[#F4F9F1] text-[#6B7A7A] active:bg-[#E4EDDF]",
                  )}
                >
                  {m}月
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
