"use client";

/**
 * @component CalendarMonth
 * @description 月历网格组件
 * @author gouxinjie
 * @created 2026-06-22
 * @updated 2026-06-24
 */
import type { CSSProperties } from "react";
import Link from "next/link";

import { cn } from "@/lib/cn";
import type { CalendarCell } from "@/types/models";

interface CalendarMonthProps {
  cells: CalendarCell[];
  weekdays: string[];
}

function truncateLabel(text: string, maxLen = 3): string {
  return text.slice(0, maxLen);
}

function mixColor(channel: number, target: number, ratio: number): number {
  return Math.round(channel * (1 - ratio) + target * ratio);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  return {
    r: Number.parseInt(hex.slice(1, 3), 16),
    g: Number.parseInt(hex.slice(3, 5), 16),
    b: Number.parseInt(hex.slice(5, 7), 16),
  };
}

function toRgbString(rgb: { r: number; g: number; b: number }): string {
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

function getRgbBrightness(rgb: { r: number; g: number; b: number }): number {
  return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
}

function getTagStyle(tagColor?: string): CSSProperties | undefined {
  if (!tagColor || !/^#[0-9A-Fa-f]{6}$/.test(tagColor)) {
    return undefined;
  }

  const rgb = hexToRgb(tagColor);
  const background =
    getRgbBrightness(rgb) >= 176
      ? {
          r: mixColor(rgb.r, 0, 0.16),
          g: mixColor(rgb.g, 0, 0.16),
          b: mixColor(rgb.b, 0, 0.16),
        }
      : rgb;

  return {
    backgroundColor: toRgbString(background),
    color: "#FFFFFF",
  };
}

export function CalendarMonth({ cells, weekdays }: CalendarMonthProps) {
  return (
    <div className="flex flex-col rounded-[8px] border border-[#DCE7E4] bg-white px-3 pb-3 pt-2 shadow-[0_14px_30px_rgba(18,46,40,0.04)]">
      <div className="mb-2 grid grid-cols-7 text-center text-[11px] font-semibold text-[#1F2A2A]">
        {weekdays.map((day) => (
          <span key={day} className="py-1.5">
            {day}
          </span>
        ))}
      </div>

      <div className="grid min-h-0 grid-cols-7 gap-y-3">
        {cells.map((cell) => {
          const visibleSummaries = cell.recordSummaries.slice(0, 2);
          const cellSurfaceClass = cell.isToday
            ? cell.isSelected
              ? "border-2 border-[#16967F] bg-[#F5FDFB] shadow-[inset_0_0_0_1px_rgba(22,150,127,0.16)]"
              : "border-2 border-[#5DD1B8] bg-white"
            : cell.isSelected
              ? "border-[#5DD1B8] bg-[#F5FDFB] shadow-[inset_0_0_0_1px_rgba(93,209,184,0.08)]"
              : "bg-[#F7FAF9]";

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
                      "inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#22C3A6] px-1 text-white",
                    !cell.isToday && cell.isSelected && "text-[#16967F]",
                    !cell.isToday && cell.isCurrentMonth && "text-[#1F2A2A]",
                    !cell.isCurrentMonth && "text-[#BCC6C3]",
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
                        ? "text-[#A8B8B0]"
                        : "text-[#CBD3D1]",
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
                      "inline-flex h-6 w-[4em] items-center justify-center self-center whitespace-nowrap rounded-[4px] px-1.5 text-[11px] font-normal leading-none tracking-[-0.02em]",
                      !summary.tagColor && "bg-[#22C3A6] text-white",
                      !cell.isCurrentMonth && "opacity-70",
                    )}
                    style={getTagStyle(summary.tagColor)}
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
