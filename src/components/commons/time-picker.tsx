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
  const scrollTimer = useRef<ReturnType<typeof setTimeout>>();

  // 初始化滚动到选中项
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const idx = items.indexOf(selectedValue);
    if (idx === -1) return;

    // 计算目标滚动位置：使选中项居中
    const targetScroll = idx * itemHeight - (container.clientHeight - itemHeight) / 2;

    container.scrollTo({
      top: Math.max(0, targetScroll),
      behavior: "instant" as ScrollBehavior,
    });
  }, [items, selectedValue, itemHeight]);

  // 处理滚动结束，确定最近的选项
  const handleScrollEnd = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const centerY = container.scrollTop + container.clientHeight / 2;
    const idx = Math.round(centerY / itemHeight - 0.5);
    const clampedIdx = Math.max(0, Math.min(idx, items.length - 1));

    if (items[clampedIdx] !== selectedValue) {
      onSelect(items[clampedIdx]);
    }

    // 自动对齐到最近的选项
    const targetScroll = clampedIdx * itemHeight - (container.clientHeight - itemHeight) / 2;
    container.scrollTo({
      top: Math.max(0, targetScroll),
      behavior: "smooth",
    });
  }, [items, selectedValue, onSelect, itemHeight]);

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
                  : "text-[#A8B8B0] font-medium",
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
 * 点击展开/收起滚轮面板，面板内联展开适配滚动容器
 */
export function TimePicker({ value, onChange, clearable = true }: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelHeight, setPanelHeight] = useState(0);

  // 点击外部关闭
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // 测量面板高度用于动画
  const measureRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      setPanelHeight(node.scrollHeight);
    }
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
      setOpen(false);
    },
    [onChange],
  );

  const displayText = value || "选择时间";

  return (
    <div className="relative" ref={panelRef}>
      {/* 触发器：点击展开 */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-[14px] border px-4 py-3 text-left",
          "transition-colors duration-200",
          value
            ? "border-[#DCE7E4] text-[#1F2A2A]"
            : "border-[#DCE7E4] text-[#A8B8B0]",
          open ? "border-[#22C3A6] ring-1 ring-[#22C3A6]/20" : "",
        )}
      >
        <Clock
          size={18}
          weight={value ? "fill" : "regular"}
          className={value ? "text-[#22C3A6]" : "text-[#A8B8B0]"}
        />
        <span className="flex-1 text-[14px]">{displayText}</span>
        {value && clearable ? (
          <span
            onClick={handleClear}
            className="flex h-6 w-6 items-center justify-center rounded-full text-[#A8B8B0] hover:text-[#6B7A7A] active:bg-[#F3F7F6]"
          >
            <X size={14} />
          </span>
        ) : null}
      </button>

      {/* 展开的滚轮面板 —— 内联展开 + 高度动画 */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-[240ms] ease-out",
        )}
        style={{
          maxHeight: open ? panelHeight : 0,
          opacity: open ? 1 : 0,
        }}
      >
        <div ref={measureRef} className="mt-1">
          <div
            className={cn(
              "rounded-[20px] border border-[#DCE7E4] bg-white p-4",
              "shadow-[0_12px_32px_rgba(18,46,40,0.1)]",
            )}
          >
            {/* 选中行高亮条 */}
            <div className="relative flex gap-3">
              {/* 小时列 */}
              <div className="relative flex-1">
                <div className="mb-2 text-center text-[11px] font-medium text-[#A8B8B0] uppercase tracking-wider">
                  时
                </div>
                <div className="relative">
                  {/* 选中行高亮背景 */}
                  <div
                    className="pointer-events-none absolute left-1 right-1 z-0 rounded-[10px] bg-[#DDF7F1]/60"
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
                <div className="mb-2 text-center text-[11px] font-medium text-[#A8B8B0] uppercase tracking-wider">
                  分
                </div>
                <div className="relative">
                  {/* 选中行高亮背景 */}
                  <div
                    className="pointer-events-none absolute left-1 right-1 z-0 rounded-[10px] bg-[#DDF7F1]/60"
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

            {/* 底部快捷操作 */}
            <div className="mt-3 flex gap-3 border-t border-[#F0F5F3] pt-3">
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                className="flex-1 rounded-[10px] py-2 text-[13px] font-medium text-[#A8B8B0] active:bg-[#F7FAF9]"
              >
                清除
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-[10px] bg-[#22C3A6] py-2 text-[13px] font-semibold text-white active:opacity-80"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
