"use client";

/**
 * @component CalendarMonth
 * @description 月历网格组件
 * @author gouxinjie
 * @created 2026-06-22
 * @updated 2026-06-22
 */
import Link from "next/link";

import { cn } from "@/lib/cn";
import type { CalendarCell } from "@/types/models";

interface CalendarMonthProps {
  cells: CalendarCell[];
  weekdays: string[];
}

function truncateLabel(text: string, maxLen = 6): string {
  return text.length > maxLen ? `${text.slice(0, maxLen)}…` : text;
}

export function CalendarMonth({
  cells,
  weekdays,
}: CalendarMonthProps) {
  return (
    <div className="surface-card rounded-[22px] px-3 pb-3 pt-4">
      <div className="mb-1 grid grid-cols-7 text-center text-[11px] font-medium text-[#A8B8B0]">
        {weekdays.map((day) => (
          <span key={day} className="py-1.5">
            {day}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((cell) => (
          <Link
            key={cell.date}
            href={`/calendar/${cell.date}`}
            className={cn(
              "relative flex min-h-[74px] flex-col rounded-[16px] px-1.5 py-1.5 transition-all active:scale-[0.97]",
              cell.isSelected && "bg-[#EAF8F4] ring-1 ring-[#55CBB3]",
              !cell.isSelected && cell.isToday && "bg-white/72",
              !cell.isSelected && !cell.isToday && "bg-transparent",
              !cell.isCurrentMonth && "opacity-55",
            )}
          >
            <div className="flex items-start justify-between">
              <span
                className={cn(
                  "font-numeric text-[13px] font-semibold leading-none",
                  cell.isToday && !cell.isSelected && "text-[#16967F]",
                  cell.isSelected && "text-[#16967F]",
                  !cell.isToday && !cell.isSelected && cell.isCurrentMonth && "text-[#1F2A2A]",
                  !cell.isCurrentMonth && "text-[#B9C3C0]",
                )}
              >
                {cell.dayNumber}
              </span>
              {cell.isToday && !cell.isSelected ? (
                <span className="mt-[2px] h-1.5 w-1.5 rounded-full bg-[#22C3A6]" />
              ) : null}
            </div>

            {cell.lunarLabel ? (
              <p
                className={cn(
                  "mt-1 text-[9px] leading-none",
                  cell.isCurrentMonth ? "text-[#A8B8B0]" : "text-[#C8CFCD]",
                )}
              >
                {cell.lunarLabel}
              </p>
            ) : null}

            <div className="mt-auto flex flex-col gap-1">
              {cell.recordSummaries.length > 0 ? (
                <>
                  {cell.recordSummaries.map((summary) => (
                    <span
                      key={summary.id}
                      className={cn(
                        "flex items-center gap-1 truncate rounded-[6px] px-1.5 py-[3px] text-[8px] font-medium leading-none",
                        cell.isCurrentMonth
                          ? "text-white"
                          : "bg-transparent text-[#C0C9C7]",
                      )}
                      style={summary.tagColor ? { backgroundColor: summary.tagColor } : undefined}
                    >
                      {truncateLabel(summary.title, 4)}
                    </span>
                  ))}
                  {cell.overflowCount > 0 ? (
                    <span
                      className={cn(
                        "rounded-[6px] bg-[#EFF4F2] px-1.5 py-[3px] text-[8px] font-medium leading-none",
                        cell.isCurrentMonth ? "text-[#7F918E]" : "text-[#C0C9C7]",
                      )}
                    >
                      +{cell.overflowCount}
                    </span>
                  ) : null}
                </>
              ) : (
                !cell.isCurrentMonth && <span className="h-4" />
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
