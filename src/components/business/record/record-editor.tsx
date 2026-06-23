"use client";

/**
 * @component RecordEditor
 * @description 新增/编辑记录弹层
 * @author gouxinjie
 * @created 2026-06-22
 */
import { useState } from "react";

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
): Required<RecordFormData> {
  return {
    title: initialData?.title ?? "",
    tagId: initialData?.tagId ?? "",
    date: initialData?.date ?? defaultDate,
    timeType: initialData?.timeType ?? "all_day",
    startTime: initialData?.startTime ?? "",
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
  const [date, setDate] = useState(initialForm.date);
  const [timeType, setTimeType] = useState<TimeType>(initialForm.timeType);
  const [startTime, setStartTime] = useState(initialForm.startTime);
  const [note, setNote] = useState(initialForm.note);

  const handleSave = async () => {
    if (!title.trim() || saving) return;
    await onSave({
      title: title.trim(),
      tagId,
      date,
      timeType,
      startTime: timeType === "scheduled" ? startTime : undefined,
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
                ? "bg-[#22C3A6] active:opacity-80"
                : "bg-[#A8B8B0] cursor-not-allowed",
            )}
          >
            {saving ? "保存中…" : "保存"}
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {errorMessage ? (
          <div className="rounded-[14px] border border-[#F2C0C0] bg-[#FFF5F5] px-4 py-3 text-[13px] text-[#D85A5A]">
            {errorMessage}
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
            className="w-full rounded-[14px] border border-[#DCE7E4] px-4 py-3 text-[14px] text-[#1F2A2A] placeholder-[#A8B8B0] outline-none focus:border-[#22C3A6]"
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
            日期
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            className="w-full rounded-[14px] border border-[#DCE7E4] px-4 py-3 text-[14px] text-[#1F2A2A] outline-none focus:border-[#22C3A6]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#6B7A7A]">
            时间类型
          </label>
          <div className="mb-3 flex gap-2">
            <button
              onClick={() => setTimeType("all_day")}
              className={cn(
                "rounded-[10px] px-4 py-2 text-[13px] font-medium transition-colors",
                timeType === "all_day" ? "bg-[#22C3A6] text-white" : "bg-[#F3F7F6] text-[#6B7A7A]",
              )}
            >
              全天
            </button>
            <button
              onClick={() => setTimeType("scheduled")}
              className={cn(
                "rounded-[10px] px-4 py-2 text-[13px] font-medium transition-colors",
                timeType === "scheduled"
                  ? "bg-[#22C3A6] text-white"
                  : "bg-[#F3F7F6] text-[#6B7A7A]",
              )}
            >
              指定时间
            </button>
          </div>

          {timeType === "scheduled" ? (
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full rounded-[14px] border border-[#DCE7E4] px-4 py-3 text-[14px] text-[#1F2A2A] outline-none focus:border-[#22C3A6]"
            />
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
            className="w-full resize-none rounded-[14px] border border-[#DCE7E4] px-4 py-3 text-[14px] text-[#1F2A2A] placeholder-[#A8B8B0] outline-none focus:border-[#22C3A6]"
          />
        </div>
      </div>
    </BottomSheet>
  );
}
