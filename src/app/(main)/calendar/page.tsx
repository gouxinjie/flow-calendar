"use client";

/**
 * @page CalendarPage
 * @description 日历首页
 * @author gouxinjie
 * @created 2026-06-22
 * @updated 2026-06-24
 */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarBlank, CaretDown, MagnifyingGlass, Plus } from "@phosphor-icons/react";
import dayjs from "dayjs";

import { CalendarMonth } from "@/components/business/calendar/calendar-month";
import { MonthPickerSheet } from "@/components/business/calendar/month-picker-sheet";
import { RecordEditor } from "@/components/business/record/record-editor";
import { StateBanner } from "@/components/commons/state-banner";
import { cn } from "@/lib/cn";
import { buildMonthCells, formatMonthTitle, getWeekdayLabels } from "@/lib/calendar";
import { requestApi } from "@/services/api-client";
import { useCalendarStore } from "@/stores/calendar-store";
import type { ActivityLog, ActivityTag, RecordFormData } from "@/types/models";

export default function CalendarPage() {
  const { currentMonth, selectedDate, today, setCurrentMonth } = useCalendarStore();

  const [records, setRecords] = useState<ActivityLog[]>([]);
  const [tags, setTags] = useState<ActivityTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [recordError, setRecordError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showRecordEditor, setShowRecordEditor] = useState(false);
  const [savingRecord, setSavingRecord] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadCalendarData() {
      setLoading(true);
      setPageError("");

      try {
        const [nextTags, nextRecords] = await Promise.all([
          requestApi<ActivityTag[]>("/api/tags"),
          requestApi<ActivityLog[]>(`/api/records?month=${currentMonth}`),
        ]);

        if (!active) {
          return;
        }

        setTags(nextTags);
        setRecords(nextRecords);
      } catch (requestError) {
        if (!active) {
          return;
        }

        setPageError(requestError instanceof Error ? requestError.message : "读取月历失败");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadCalendarData();

    return () => {
      active = false;
    };
  }, [currentMonth]);

  const cells = useMemo(
    () => buildMonthCells(currentMonth, records, tags, selectedDate, today),
    [currentMonth, records, selectedDate, tags, today],
  );

  const monthTitle = formatMonthTitle(currentMonth);
  const weekdays = getWeekdayLabels();
  const showInlineEmptyTip = !loading && !pageError && records.length === 0;
  const selectedDateRecordCount = useMemo(() => {
    return records.filter((r) => r.date === selectedDate).length;
  }, [records, selectedDate]);
  const isSelectedDateFull = selectedDateRecordCount >= 3;
  const lunarTodayLabel = useMemo(() => {
    const todayCell = cells.find((cell) => cell.date === today);
    return todayCell?.lunarLabel ?? "";
  }, [cells, today]);

  const handleMonthSelect = (year: number, month: number) => {
    setCurrentMonth(`${year}-${String(month).padStart(2, "0")}`);
  };

  const handleSaveRecord = async (data: RecordFormData) => {
    setSavingRecord(true);
    setRecordError("");

    try {
      await requestApi<ActivityLog>("/api/records", {
        method: "POST",
        body: JSON.stringify(data),
      });

      const nextRecords = await requestApi<ActivityLog[]>(`/api/records?month=${currentMonth}`);
      setRecords(nextRecords);
      setFeedback("记录已保存");
      setShowRecordEditor(false);
    } catch (requestError) {
      setRecordError(requestError instanceof Error ? requestError.message : "保存记录失败");
    } finally {
      setSavingRecord(false);
    }
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
      <header className="relative z-10 shrink-0 px-3 pb-2.5 pt-3.5">
        <div className="flex items-start justify-between">
          <div>
            <button
              type="button"
              onClick={() => setShowMonthPicker(true)}
              className="inline-flex items-center gap-1 text-[24px] font-semibold tracking-[-0.04em] text-[#1F2A2A]"
              aria-label="选择月份"
            >
              <span>{monthTitle}</span>
              <CaretDown size={16} weight="bold" className="mt-1 text-[#637472]" />
            </button>
            <p className="mt-1 text-[12px] text-[#7E8F8C]">
              {dayjs(today).format("M月D日 dddd")}
              {lunarTodayLabel ? ` · ${lunarTodayLabel}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/review"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/86 text-[#435351] shadow-[0_12px_22px_rgba(31,42,42,0.06)]"
              aria-label="前往回顾"
            >
              <MagnifyingGlass size={18} />
            </Link>
            <button
              type="button"
              onClick={() => setShowMonthPicker(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/86 text-[#435351] shadow-[0_12px_22px_rgba(31,42,42,0.06)]"
              aria-label="打开月份选择器"
            >
              <CalendarBlank size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 pb-[112px]">
        {feedback ? <StateBanner tone="success" message={feedback} /> : null}
        {pageError ? <StateBanner tone="error" message={pageError} /> : null}

        {showInlineEmptyTip ? (
          <section className="surface-card flex items-center justify-between gap-3 px-4 py-3 !rounded-[10px]">
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-[#1F2A2A]">这个月还没有记录</p>
              <p className="mt-0.5 text-[12px] text-[#6B7A7A]">点底部加号，先记下一条。</p>
            </div>
            <button
              type="button"
              onClick={() => setShowRecordEditor(true)}
              className="shrink-0 rounded-lg bg-[#22C3A6] px-3.5 py-2 text-[12px] font-semibold text-white"
            >
              新增
            </button>
          </section>
        ) : null}

        <div className="min-h-0 flex-1">
          <CalendarMonth cells={cells} weekdays={weekdays} />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowRecordEditor(true)}
        disabled={isSelectedDateFull}
        className={cn(
          "glass-fab absolute bottom-0 left-1/2 z-20 flex h-[52px] w-[52px] -translate-x-1/2 items-center justify-center rounded-full text-white",
          isSelectedDateFull && "cursor-not-allowed opacity-50",
        )}
        aria-label={isSelectedDateFull ? "当日记录已满" : "新增记录"}
      >
        <Plus size={26} weight="regular" />
      </button>

      <MonthPickerSheet
        key={`${currentMonth}-${showMonthPicker ? "open" : "closed"}`}
        open={showMonthPicker}
        onClose={() => setShowMonthPicker(false)}
        currentYear={Number(currentMonth.split("-")[0])}
        currentMonth={Number(currentMonth.split("-")[1])}
        onSelect={handleMonthSelect}
      />

      <RecordEditor
        key={`calendar-record-${showRecordEditor ? selectedDate : "closed"}`}
        open={showRecordEditor}
        onClose={() => {
          setShowRecordEditor(false);
          setRecordError("");
        }}
        onSave={handleSaveRecord}
        tags={tags}
        defaultDate={selectedDate}
        saving={savingRecord}
        errorMessage={recordError}

      />
    </div>
  );
}
