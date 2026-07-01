/**
 * @component MobileShell
 * @description 提供移动端页面壳层、通用卡片、标签徽章等共享 UI
 * @author gouxinjie
 * @created 2026-06-22
 * @updated 2026-06-27
 */
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

import { cn } from "@/lib/cn";

/**
 * @description 主应用壳层，限制最大宽度，模拟手机视口
 */
export function AppCanvas({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="min-h-[100dvh] sm:px-6 sm:py-6">
      <div
        className={cn(
          "relative flex h-[100dvh] w-full flex-col overflow-hidden bg-transparent sm:mx-auto sm:h-[calc(100dvh-48px)] sm:max-w-[430px] sm:rounded-[30px] sm:surface-card",
          className,
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,195,166,0.09),_transparent_34%)]" />
        {children}
      </div>
    </div>
  );
}

/**
 * @description 二级页面通用头部
 */
export function ScreenHeader({
  title,
  subtitle,
  backHref,
  rightSlot,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  rightSlot?: ReactNode;
}) {
  return (
    <header className="relative z-10 flex items-start justify-between gap-4 px-4 pt-4">
      <div className="flex items-start gap-3">
        {backHref ? (
          <Link
            href={backHref}
            className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#DCEAD2] bg-white/92 text-[#1F2A2A] shadow-[0_10px_24px_rgba(31,42,42,0.06)]"
          >
            <ArrowLeft size={18} weight="bold" />
          </Link>
        ) : null}
        <div>
          <h1 className="text-[24px] font-semibold tracking-[-0.03em] text-[#1F2A2A] text-balance">
            {title}
          </h1>
          {subtitle ? <p className="mt-1 text-sm text-[#6B7A7A]">{subtitle}</p> : null}
        </div>
      </div>
      {rightSlot}
    </header>
  );
}

/**
 * @description 通用卡片容器
 */
export function SectionCard({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return <section className={cn("surface-card !rounded-[16px] p-4", className)}>{children}</section>;
}

/**
 * @description 记录标签徽章，颜色由传入的 hex 决定
 */
export function TagBadge({
  label,
  color,
  compact = false,
}: {
  label: string;
  color: string;
  compact?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[10px] font-medium",
        compact ? "h-5 px-1.5 text-[10px]" : "h-6 px-2 text-[11px]",
      )}
      style={{ backgroundColor: `${color}18`, color }}
    >
      {label}
    </span>
  );
}


