"use client";

/**
 * @page CalendarPage
 * @description 月历首页
 * @author gouxinjie
 * @created 2026-06-22
 * @updated 2026-06-22
 */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarBlank,
  CaretDown,
  CaretLeft,
  CaretRight,
  MagnifyingGlass,
  Plus,
} from "@phosphor-icons/react";
import dayjs from "dayjs";

import { EmptyState } from "@/components/commons/empty-state";
import { StateBanner } from "@/components/commons/state-banner";
import { CalendarMonth } from "@/components/business/calendar/calendar-month";
import { MonthPickerSheet } from "@/components/business/calendar/month-picker-sheet";
import { RecordEditor } from "@/components/business/record/record-editor";
import { useCalendarStore } from "@/stores/calendar-store";
import { requestApi } from "@/services/api-client";
import { buildMonthCells, formatMonthTitle, getWeekdayLabels } from "@/lib/calendar";
import type { ActivityLog, ActivityTag, RecordFormData } from "@/types/models";

export default function CalendarPage() {
  const {
    currentMonth,
    selectedDate,
    today,
    goToPrevMonth,
    goToNextMonth,
    goToToday,
    setCurrentMonth,
  } = useCalendarStore();

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
    <div className="relative flex h-full flex-col">
      <header className="relative z-10 shrink-0 px-4 pb-3 pt-4">
        <div className="flex items-start justify-between">
          <div>
            <button
              type="button"
              onClick={() => setShowMonthPicker(true)}
              className="inline-flex items-center gap-1 text-[26px] font-semibold tracking-[-0.04em] text-[#1F2A2A]"
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
              aria-label="选择月份"
            >
              <CalendarBlank size={18} />
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="inline-flex items-center gap-1 rounded-full bg-white/72 p-1 shadow-[0_8px_20px_rgba(31,42,42,0.04)]">
            <button
              type="button"
              onClick={goToPrevMonth}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#6B7A7A]"
              aria-label="上一月"
            >
              <CaretLeft size={16} />
            </button>
            <button
              type="button"
              onClick={goToNextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#6B7A7A]"
              aria-label="下一月"
            >
              <CaretRight size={16} />
            </button>
          </div>
          <button
            type="button"
            onClick={goToToday}
            className="rounded-full bg-white/86 px-4 py-2 text-[12px] font-medium text-[#5E6E6B] shadow-[0_12px_20px_rgba(31,42,42,0.05)]"
          >
            今天
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-28">
        {feedback ? <StateBanner tone="success" message={feedback} className="mb-4" /> : null}
        {pageError ? <StateBanner tone="error" message={pageError} className="mb-4" /> : null}

        <CalendarMonth cells={cells} weekdays={weekdays} />

        {!loading && !pageError && records.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="这个月还没有记录"
              description="先写下一件已经发生的小事，月历就会慢慢长出内容。"
              action={
                <button
                  type="button"
                  onClick={() => setShowRecordEditor(true)}
                  className="rounded-full bg-[#22C3A6] px-4 py-2 text-[13px] font-semibold text-white"
                >
                  新增第一条记录
                </button>
              }
            />
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => setShowRecordEditor(true)}
        className="absolute bottom-[92px] left-1/2 z-20 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-[#22C3A6] text-white shadow-[0_18px_36px_rgba(34,195,166,0.34)] active:scale-[0.98]"
        aria-label="新增记录"
      >
        <Plus size={28} weight="bold" />
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
