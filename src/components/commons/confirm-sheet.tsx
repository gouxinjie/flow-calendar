"use client";

/**
 * @component ConfirmSheet
 * @description 通用删除确认抽屉
 * @author gouxinjie
 * @created 2026-06-22
 */
import { BottomSheet } from "@/components/business/shared/bottom-sheet";

interface ConfirmSheetProps {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmSheet({
  open,
  title,
  description,
  confirmText = "确认删除",
  cancelText = "取消",
  loading = false,
  onConfirm,
  onClose,
}: ConfirmSheetProps) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex h-[48px] flex-1 items-center justify-center rounded-[14px] border border-[#DCE7E4] text-[14px] font-medium text-[#60716E]"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex h-[48px] flex-1 items-center justify-center rounded-[14px] bg-[#D85A5A] text-[14px] font-semibold text-white disabled:opacity-60"
          >
            {loading ? "处理中…" : confirmText}
          </button>
        </div>
      }
    >
      <p className="text-[14px] leading-7 text-[#60716E]">{description}</p>
    </BottomSheet>
  );
}
