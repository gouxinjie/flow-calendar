"use client";

/**
 * @component TimePicker
 * @description 滚轮式时间选择器，移动端 H5 优化，支持 24 小时制、5 分钟步长
 * @author gouxinjie
 * @created 2026-06-30
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Clock, X } from "@phosphor-icons/react";

import { cn } from "@/lib/cn";

/** 生成小时列表 00-23 */
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));

/** 生成分钟列表 00-55，步长 5 */
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  /** 是否显示清除按钮 */
  clearable?: boolean;
}

/** 滚轮列组件 */
function PickerColumn({
  items,
  selectedValue,
  onSelect,
  itemHeight = 40,
}: {
  items: string[];
  selectedValue: string;
  onSelect: (val: string) => void;
  itemHeight?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 顶部占位高度（与渲染中的 spacer 保持一致）
  const topPadding = itemHeight * 2;

  // 初始化滚动到选中项
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const idx = items.indexOf(selectedValue);
    if (idx === -1) return;

    // 计算目标滚动位置：使选中项居中（需加上顶部占位）
    const targetScroll = topPadding + idx * itemHeight - (container.clientHeight - itemHeight) / 2;

    container.scrollTo({
      top: Math.max(0, targetScroll),
      behavior: "instant" as ScrollBehavior,
    });
  }, [items, selectedValue, itemHeight, topPadding]);

  // 处理滚动结束，确定最近的选项
  const handleScrollEnd = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const centerY = container.scrollTop + container.clientHeight / 2;
    // 减去顶部占位后计算最近选项索引
    const idx = Math.round((centerY - topPadding) / itemHeight - 0.5);
    const clampedIdx = Math.max(0, Math.min(idx, items.length - 1));

    if (items[clampedIdx] !== selectedValue) {
      onSelect(items[clampedIdx]);
    }

    // 自动对齐到最近的选项（需加上顶部占位）
    const targetScroll = topPadding + clampedIdx * itemHeight - (container.clientHeight - itemHeight) / 2;
    container.scrollTo({
      top: Math.max(0, targetScroll),
      behavior: "smooth",
    });
  }, [items, selectedValue, onSelect, itemHeight, topPadding]);

  // 触摸/滚动事件
  const handleTouchStart = useCallback(() => {
    isScrolling.current = true;
    if (scrollTimer.current) {
      clearTimeout(scrollTimer.current);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    scrollTimer.current = setTimeout(() => {
      isScrolling.current = false;
      handleScrollEnd();
    }, 150);
  }, [handleScrollEnd]);

  // 点击选择
  const handleItemClick = useCallback(
    (val: string) => {
      onSelect(val);
    },
    [onSelect],
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex-1 overflow-y-auto scrollbar-none",
        "snap-y snap-mandatory",
      )}
      style={{
        height: itemHeight * 5, // 显示 5 行
        scrollSnapType: "y mandatory",
        WebkitOverflowScrolling: "touch",
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onScroll={() => {
        if (!isScrolling.current) {
          isScrolling.current = true;
          if (scrollTimer.current) clearTimeout(scrollTimer.current);
          scrollTimer.current = setTimeout(() => {
            isScrolling.current = false;
            handleScrollEnd();
          }, 150);
        }
      }}
    >
      {/* 顶部占位，使第一项也能居中 */}
      <div style={{ height: itemHeight * 2 }} />
      {items.map((item) => {
        const isSelected = item === selectedValue;
        return (
          <div
            key={item}
            className={cn(
              "flex items-center justify-center snap-center select-none transition-colors duration-150",
              "cursor-pointer",
            )}
            style={{ height: itemHeight }}
            onClick={() => handleItemClick(item)}
          >
            <span
              className={cn(
                "text-[17px] transition-all duration-200",
                isSelected
                  ? "text-[#1F2A2A] font-semibold scale-110"
                  : "text-[#9BAE97] font-medium",
              )}
            >
              {item}
            </span>
          </div>
        );
      })}
      {/* 底部占位，使最后一项也能居中 */}
      <div style={{ height: itemHeight * 2 }} />
    </div>
  );
}

/**
 * TimePicker 主组件
 * 点击触发器展开底部抽屉式时间选择面板
 */
export function TimePicker({ value, onChange, clearable = true }: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  // 打开/关闭动画时序控制
  const handleOpen = useCallback(() => {
    setOpen(true);
    // 下一帧触发进场动画
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
    // 等动画结束后移除 DOM
    setTimeout(() => setOpen(false), 240);
  }, []);

  // 解析当前值
  const currentHour = value ? value.split(":")[0] : "";
  const currentMinute = value ? value.split(":")[1] : "";

  const handleHourChange = useCallback(
    (hour: string) => {
      const min = currentMinute || "00";
      onChange(`${hour}:${min}`);
    },
    [currentMinute, onChange],
  );

  const handleMinuteChange = useCallback(
    (minute: string) => {
      const hour = currentHour || "00";
      onChange(`${hour}:${minute}`);
    },
    [currentHour, onChange],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange("");
      handleClose();
    },
    [onChange, handleClose],
  );

  const handleConfirm = useCallback(() => {
    handleClose();
  }, [handleClose]);

  const displayText = value || "选择时间";

  return (
    <>
      {/* 触发器：点击展开 */}
      <button
        type="button"
        onClick={handleOpen}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-[14px] border px-4 py-3 text-left",
          "transition-colors duration-200",
          value
            ? "border-[#DCEAD2] text-[#1F2A2A]"
            : "border-[#DCEAD2] text-[#9BAE97]",
        )}
      >
        <Clock
          size={18}
          weight={value ? "fill" : "regular"}
          className={value ? "text-[#5EBF3F]" : "text-[#9BAE97]"}
        />
        <span className="flex-1 text-[14px]">{displayText}</span>
        {value && clearable ? (
          <span
            onClick={handleClear}
            className="flex h-6 w-6 items-center justify-center rounded-full text-[#9BAE97] hover:text-[#6B7A7A] active:bg-[#F4F9F1]"
          >
            <X size={14} />
          </span>
        ) : null}
      </button>

      {/* 底部抽屉遮罩 */}
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* 半透明遮罩 */}
          <div
            className={cn(
              "absolute inset-0 bg-black/30 transition-opacity duration-[240ms]",
              visible ? "opacity-100" : "opacity-0",
            )}
            onClick={handleClose}
          />

          {/* 底部抽屉面板 — 向上滑入 */}
          <div
            className={cn(
              "relative w-full max-w-[480px] rounded-t-[20px] bg-white px-4 pb-8 pt-4",
              "transition-transform duration-[240ms] ease-out",
              "shadow-[0_-8px_32px_rgba(18,46,40,0.12)]",
              visible ? "translate-y-0" : "translate-y-full",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 拖拽条 */}
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#DCEAD2]" />

            {/* 标题 */}
            <p className="mb-4 text-center text-[15px] font-semibold text-[#1F2A2A]">
              选择时间
            </p>

            {/* 滚轮选择区 */}
            <div className="relative flex gap-3">
              {/* 小时列 */}
              <div className="relative flex-1">
                <div className="mb-2 text-center text-[11px] font-medium text-[#9BAE97] uppercase tracking-wider">
                  时
                </div>
                <div className="relative">
                  {/* 选中行高亮背景 */}
                  <div
                    className="pointer-events-none absolute left-1 right-1 z-0 rounded-[10px] bg-[#F3FAF7]/60"
                    style={{
                      top: "calc(50% - 20px)",
                      height: 40,
                    }}
                  />
                  <PickerColumn
                    items={HOURS}
                    selectedValue={currentHour}
                    onSelect={handleHourChange}
                  />
                </div>
              </div>

              {/* 分隔符 */}
              <div className="flex items-center pt-5">
                <span className="text-[20px] font-semibold text-[#1F2A2A]">:</span>
              </div>

              {/* 分钟列 */}
              <div className="relative flex-1">
                <div className="mb-2 text-center text-[11px] font-medium text-[#9BAE97] uppercase tracking-wider">
                  分
                </div>
                <div className="relative">
                  {/* 选中行高亮背景 */}
                  <div
                    className="pointer-events-none absolute left-1 right-1 z-0 rounded-[10px] bg-[#F3FAF7]/60"
                    style={{
                      top: "calc(50% - 20px)",
                      height: 40,
                    }}
                  />
                  <PickerColumn
                    items={MINUTES}
                    selectedValue={currentMinute}
                    onSelect={handleMinuteChange}
                  />
                </div>
              </div>
            </div>

            {/* 底部操作按钮 */}
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  handleClose();
                }}
                className="flex-1 rounded-[14px] border border-[#DCEAD2] py-3 text-[14px] font-medium text-[#9BAE97] active:bg-[#F3FAF7]"
              >
                清除
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 rounded-[14px] bg-[#5EBF3F] py-3 text-[14px] font-semibold text-white active:opacity-80"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
