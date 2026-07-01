"use client";

/**
 * @component CalendarMonth
 * @description 月历网格组件
 * @author gouxinjie
 * @created 2026-06-22
 * @updated 2026-06-30
 */
import Link from "next/link";

import { cn } from "@/lib/cn";
import { getCalendarTagStyle } from "@/lib/tag-color";
import type { CalendarCell } from "@/types/models";

interface CalendarMonthProps {
  cells: CalendarCell[];
  weekdays: string[];
}

function truncateLabel(text: string, maxLen = 3): string {
  return text.slice(0, maxLen);
}

export function CalendarMonth({ cells, weekdays }: CalendarMonthProps) {
  return (
    <div className="flex flex-col rounded-[8px] border border-[#DCEAD2] bg-white px-3 pb-3 pt-2 shadow-[0_14px_30px_rgba(18,46,40,0.04)]">
      <div className="mb-2 grid grid-cols-7 text-center text-[11px] font-semibold">
        {weekdays.map((day, idx) => (
          <span
            key={day}
            className={cn(
              "py-1.5",
              (idx === 0 || idx === 6) ? "text-[#5EBF3F]" : "text-[#1F2A2A]",
            )}
          >
            {day}
          </span>
        ))}
      </div>

      <div className="grid min-h-0 grid-cols-7 gap-y-3">
        {cells.map((cell) => {
          const visibleSummaries = cell.recordSummaries.slice(0, 2);
          const cellSurfaceClass = cell.isToday
            ? cell.isSelected
              ? "border-2 border-[#3D9428] bg-[#F3FCF6] shadow-[inset_0_0_0_1px_rgba(61,148,40,0.16)]"
              : "border-2 border-[#74CC50] bg-white"
            : cell.isSelected
              ? "border-[#74CC50] bg-[#F3FCF6] shadow-[inset_0_0_0_1px_rgba(116,204,80,0.08)]"
              : "bg-white";

          return (
            <Link
              key={cell.date}
              href={`/calendar/${cell.date}`}
              className={cn(
                "relative flex min-h-0 flex-col rounded-[8px] border border-transparent px-1.5 pb-1.5 pt-2 transition-transform active:scale-[0.98]",
                cellSurfaceClass,
                !cell.isCurrentMonth && "opacity-50",
              )}
            >

              <div className="flex justify-center">
                <span
                  className={cn(
                    "font-numeric text-[15px] font-semibold leading-none",
                    cell.isToday &&
                      "inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#5EBF3F] px-1 text-white",
                    !cell.isToday && cell.isSelected && "text-[#3D9428]",
                    !cell.isToday && cell.isCurrentMonth && "text-[#1F2A2A]",
                    !cell.isCurrentMonth && "text-[#afaeb1]",
                  )}
                >
                  {cell.dayNumber}
                </span>
              </div>

              {cell.lunarLabel ? (
                <p
                  className={cn(
                    "mt-1 self-center truncate text-center text-[10px] leading-none",
                    cell.isToday
                      ? "font-medium text-[#54C1AC]"
                      : cell.isCurrentMonth
                        ? "text-[#9BAE97]"
                        : "text-[#afaeb1]",
                  )}
                >
                  {cell.lunarLabel}
                </p>
              ) : null}

              <div className="mt-[6px] flex min-h-0 flex-col items-center gap-1">
                {visibleSummaries.map((summary) => (
                  <span
                    key={summary.id}
                    className={cn(
                      "inline-flex h-6 w-[4em] items-center justify-center self-center whitespace-nowrap rounded-[4px] px-1.5 text-[11px] font-normal leading-none tracking-[-0.02em] text-white",
                      !cell.isCurrentMonth && "opacity-70",
                    )}
                    style={{ background: getCalendarTagStyle(summary.tagColor).background }}
                  >
                    {truncateLabel(summary.title)}
                  </span>
                ))}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
