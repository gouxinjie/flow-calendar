"use client";

/**
 * @component RecordEditor
 * @description 新增/编辑记录弹层
 * @author gouxinjie
 * @created 2026-06-22
 * @updated 2026-06-27
 */
import { useState } from "react";
import { Clock, CaretRight } from "@phosphor-icons/react";

import type { ActivityTag, RecordFormData, TimeType } from "@/types/models";
import { BottomSheet } from "@/components/business/shared/bottom-sheet";
import { cn } from "@/lib/cn";

interface RecordEditorProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: RecordFormData) => Promise<void> | void;
  onDelete?: () => void;
  initialData?: RecordFormData;
  tags: ActivityTag[];
  defaultDate: string;
  saving?: boolean;
  errorMessage?: string;
}

function getInitialRecordForm(
  initialData: RecordFormData | undefined,
  defaultDate: string,
): Required<RecordFormData> & { endTime: string } {
  return {
    title: initialData?.title ?? "",
    tagId: initialData?.tagId ?? "",
    date: initialData?.date ?? defaultDate,
    timeType: initialData?.timeType ?? "all_day",
    startTime: initialData?.startTime ?? "",
    endTime: initialData?.endTime ?? "",
    note: initialData?.note ?? "",
  };
}

export function RecordEditor({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
  tags,
  defaultDate,
  saving = false,
  errorMessage,
}: RecordEditorProps) {
  const initialForm = getInitialRecordForm(initialData, defaultDate);
  const [title, setTitle] = useState(initialForm.title);
  const [tagId, setTagId] = useState<string | undefined>(initialForm.tagId || undefined);
  const [timeType, setTimeType] = useState<TimeType>(initialForm.timeType);
  const [startTime, setStartTime] = useState(initialForm.startTime);
  const [endTime, setEndTime] = useState(initialForm.endTime);
  const [note, setNote] = useState(initialForm.note);
  const [localError, setLocalError] = useState("");

  const handleSave = async () => {
    setLocalError("");

    if (!title.trim()) {
      return;
    }

    // 指定时间记录必须填写合法时间段
    if (timeType === "scheduled") {
      if (!startTime) {
        setLocalError("请选择开始时间");
        return;
      }
      if (!endTime) {
        setLocalError("请选择结束时间");
        return;
      }
      if (startTime >= endTime) {
        setLocalError("结束时间必须晚于开始时间");
        return;
      }
    }

    if (saving) return;

    await onSave({
      title: title.trim(),
      tagId,
      date: defaultDate,
      timeType,
      startTime: timeType === "scheduled" ? startTime : undefined,
      endTime: timeType === "scheduled" ? endTime : undefined,
      note: note.trim() || undefined,
    });
  };

  const isEdit = !!initialData;

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={isEdit ? "编辑记录" : "新增记录"}
      footer={
        <div className="flex gap-3">
          {isEdit && onDelete ? (
            <button
              onClick={onDelete}
              className="flex h-[48px] shrink-0 items-center justify-center rounded-[14px] border border-[#E06060] px-6 text-[14px] font-medium text-[#E06060] active:opacity-80"
            >
              删除
            </button>
          ) : null}
          <button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            className={cn(
              "flex h-[48px] flex-1 items-center justify-center rounded-[14px] text-[14px] font-semibold text-white transition-opacity",
              title.trim() && !saving
                ? "bg-[#169968] active:opacity-80"
                : "bg-[#A8B8B0] cursor-not-allowed",
            )}
          >
            {saving ? "保存中…" : "保存"}
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {errorMessage || localError ? (
          <div className="rounded-[14px] border border-[#F2C0C0] bg-[#FFF5F5] px-4 py-3 text-[13px] text-[#D85A5A]">
            {localError || errorMessage}
          </div>
        ) : null}

        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#6B7A7A]">
            记录标题 *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="做了什么？"
            maxLength={50}
            className="w-full rounded-[14px] border border-[#DCE7E4] px-4 py-3 text-[14px] text-[#1F2A2A] placeholder-[#A8B8B0] outline-none focus:border-[#169968]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#6B7A7A]">
            标签（可选）
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTagId(undefined)}
              className={cn(
                "rounded-[10px] px-3 py-1.5 text-[13px] font-medium transition-colors",
                !tagId ? "bg-[#1F2A2A] text-white" : "bg-[#F3F7F6] text-[#6B7A7A]",
              )}
            >
              无标签
            </button>
            {tags
              .filter((t) => t.enabled)
              .map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => setTagId(tag.id)}
                  className="rounded-[10px] px-3 py-1.5 text-[13px] font-medium transition-colors"
                  style={{
                    backgroundColor: tagId === tag.id ? tag.color : `${tag.color}18`,
                    color: tagId === tag.id ? "#FFFFFF" : tag.color,
                  }}
                >
                  {tag.name}
                </button>
              ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#6B7A7A]">
            时间类型
          </label>
          <div className="mb-3 flex gap-2">
            <button
              onClick={() => { setTimeType("all_day"); setLocalError(""); }}
              className={cn(
                "rounded-[10px] px-4 py-2 text-[13px] font-medium transition-colors",
                timeType === "all_day" ? "bg-[#169968] text-white" : "bg-[#F3F7F6] text-[#6B7A7A]",
              )}
            >
              全天
            </button>
            <button
              onClick={() => setTimeType("scheduled")}
              className={cn(
                "rounded-[10px] px-4 py-2 text-[13px] font-medium transition-colors",
                timeType === "scheduled"
                  ? "bg-[#169968] text-white"
                  : "bg-[#F3F7F6] text-[#6B7A7A]",
              )}
            >
              指定时间段
            </button>
          </div>

          {timeType === "scheduled" ? (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Clock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#A8B8B0]" />
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => { setStartTime(e.target.value); setLocalError(""); }}
                  className="w-full rounded-[14px] border border-[#DCE7E4] py-3 pl-10 pr-3 text-[14px] text-[#1F2A2A] outline-none focus:border-[#169968]"
                  aria-label="开始时间"
                />
              </div>
              <CaretRight size={16} weight="bold" className="shrink-0 text-[#C7D4D0]" />
              <div className="relative flex-1">
                <Clock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#A8B8B0]" />
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => { setEndTime(e.target.value); setLocalError(""); }}
                  className="w-full rounded-[14px] border border-[#DCE7E4] py-3 pl-10 pr-3 text-[14px] text-[#1F2A2A] outline-none focus:border-[#169968]"
                  aria-label="结束时间"
                />
              </div>
            </div>
          ) : null}
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#6B7A7A]">
            备注（可选）
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="补充一些细节…"
            maxLength={200}
            rows={3}
            className="w-full resize-none rounded-[14px] border border-[#DCE7E4] px-4 py-3 text-[14px] text-[#1F2A2A] placeholder-[#A8B8B0] outline-none focus:border-[#169968]"
          />
        </div>
      </div>
    </BottomSheet>
  );
}
