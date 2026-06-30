"use client";

/**
 * @component RecordEditor
 * @description 新增/编辑记录弹层
 * @author gouxinjie
 * @created 2026-06-22
 * @updated 2026-06-27
 */
import { useState } from "react";

import type { ActivityTag, RecordFormData } from "@/types/models";
import { BottomSheet } from "@/components/business/shared/bottom-sheet";
import { TimePicker } from "@/components/commons/time-picker";
import { cn } from "@/lib/cn";
import { getNeutralButtonStyle, getTagButtonStyle } from "@/lib/tag-color";

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
  /** 编辑器模式：create=新增 / edit=编辑 / copy=复制 */
  mode?: "create" | "edit" | "copy";
}

function getInitialRecordForm(
  initialData: RecordFormData | undefined,
  defaultDate: string,
): Required<RecordFormData> & { startTime: string } {
  return {
    title: initialData?.title ?? "",
    tagId: initialData?.tagId ?? "",
    date: initialData?.date ?? defaultDate,
    note: initialData?.note ?? "",
    startTime: initialData?.startTime ?? "",
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
  mode,
}: RecordEditorProps) {
  const initialForm = getInitialRecordForm(initialData, defaultDate);
  const [title, setTitle] = useState(initialForm.title);
  const [tagId, setTagId] = useState<string | undefined>(initialForm.tagId || undefined);
  const [startTime, setStartTime] = useState(initialForm.startTime);
  const [note, setNote] = useState(initialForm.note);
  const [localError, setLocalError] = useState("");

  const handleSave = async () => {
    setLocalError("");

    if (!title.trim()) {
      return;
    }

    if (saving) return;

    await onSave({
      title: title.trim(),
      tagId,
      startTime: startTime || undefined,
      date: defaultDate,
      note: note.trim() || undefined,
    });
  };

  const isEdit = mode === "edit";
  const isCopy = mode === "copy";

  // 标题按模式区分
  const editorTitle = isEdit ? "编辑记录" : isCopy ? "复制记录" : "新增记录";

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={editorTitle}
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
            className="w-full rounded-[14px] border border-[#DCE7E4] px-4 py-3 text-[14px] text-[#1F2A2A] placeholder-[#A8B8B0] outline-none focus:border-[#22C3A6]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#6B7A7A]">
            开始时间（可选）
          </label>
          <TimePicker value={startTime} onChange={setStartTime} />
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#6B7A7A]">
            标签（可选）
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTagId(undefined)}
              className="rounded-[6px] px-4 py-1.5 text-[13px] font-medium transition-opacity active:opacity-80"
              style={getNeutralButtonStyle(!tagId)}
            >
              无标签
            </button>
            {tags
              .filter((t) => t.enabled)
              .map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => setTagId(tag.id)}
                  className="rounded-[6px] px-4 py-1.5 text-[13px] font-medium transition-opacity active:opacity-80"
                  style={getTagButtonStyle(tag.color, tagId === tag.id)}
                >
                  {tag.name}
                </button>
              ))}
          </div>
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
