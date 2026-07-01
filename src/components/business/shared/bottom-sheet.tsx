"use client";

/**
 * @component BottomSheet
 * @description 通用底部抽屉组件
 * @author gouxinjie
 * @created 2026-06-22
 */
import { useEffect, type ReactNode } from "react";
import { X } from "@phosphor-icons/react";

import { cn } from "@/lib/cn";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function BottomSheet({ open, onClose, title, children, footer }: BottomSheetProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 z-10",
          "max-h-[85vh] overflow-y-auto rounded-t-[28px] bg-[#FCFEFA]",
          "animate-slide-up",
        )}
        style={{ boxShadow: "0 -18px 40px rgba(45, 76, 70, 0.14)" }}
      >
        <div className="sticky top-0 z-10 rounded-t-[28px] border-b border-[#E0ECD7] bg-[#FCFEFA]/96 px-5 py-4 backdrop-blur">
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-[#D9E8E3]" />
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-[#1F2A2A]">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#6B7A7A] active:bg-[#F4F9F1]"
              aria-label="关闭"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="px-5 py-4">{children}</div>

        {footer ? (
          <div className="safe-pb sticky bottom-0 border-t border-[#E0ECD7] bg-[#FCFEFA]/96 px-5 py-4 backdrop-blur">
            {footer}
          </div>
        ) : null}

        <style jsx>{`
          @keyframes slideUp {
            from {
              transform: translateY(100%);
            }
            to {
              transform: translateY(0);
            }
          }
          .animate-slide-up {
            animation: slideUp 240ms ease-out;
          }
        `}</style>
      </div>
    </div>
  );
}
