"use client";

/**
 * @component BottomSheet
 * @description 通用底部抽屉组件，使用 Web Animations API 控制入场/出场动画
 * @author gouxinjie
 * @created 2026-06-22
 * @updated 2026-07-01 — 改用 WAAPI 方案，解决 CSS 动画类切换不可靠的问题
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { X } from "@phosphor-icons/react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** 动画时长 ms */
const DURATION = 240;

export function BottomSheet({ open, onClose, title, children, footer }: BottomSheetProps) {
  const [mounted, setMounted] = useState(false);
  const shadeRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // 控制 body 滚动锁定
  useEffect(() => {
    if (open) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [open]);

  // 步骤 1：先挂载到 DOM（ref 此时为 null）
  useEffect(() => {
    if (open) {
      setMounted(true);
    } else {
      // 关闭时：步骤 1 不做卸载，留给 WAAPI onfinish 回调处理
    }
  }, [open]);

  // 步骤 2：ref 挂载完成后执行动画（mounted 变化触发）
  useEffect(() => {
    if (!mounted) return;
    if (!panelRef.current || !shadeRef.current) return;

    // 取消所有进行中的动画
    panelRef.current.getAnimations().forEach((a) => a.cancel());
    shadeRef.current.getAnimations().forEach((a) => a.cancel());

    if (open) {
      // 入场：从 hidden 滑入 + 淡入
      panelRef.current.animate(
        { transform: ["translateY(100%)", "translateY(0)"] },
        { duration: DURATION, easing: "ease-out", fill: "forwards" },
      );
      shadeRef.current.animate(
        { opacity: [0, 1] },
        { duration: DURATION, easing: "ease-out", fill: "forwards" },
      );
    } else {
      // 出场：滑出 + 淡出，动画完成后卸载
      const panelAnim = panelRef.current.animate(
        { transform: ["translateY(0)", "translateY(100%)"] },
        { duration: DURATION, easing: "ease-in", fill: "forwards" },
      );
      shadeRef.current.animate(
        { opacity: [1, 0] },
        { duration: DURATION, easing: "ease-in", fill: "forwards" },
      );
      panelAnim.onfinish = () => setMounted(false);
    }
  }, [open, mounted]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        ref={shadeRef}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="absolute bottom-0 left-0 right-0 z-10 max-h-[85vh] overflow-y-auto rounded-t-[28px] bg-[#FCFEFA]"
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
      </div>
    </div>
  );
}
