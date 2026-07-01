"use client";

/**
 * @component BottomNav
 * @description 移动端底部主导航，3 个入口：月历、回顾、我的
 * @author gouxinjie
 * @created 2026-06-22
 * @updated 2026-06-24
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarBlank, ChartBar, User } from "@phosphor-icons/react";

import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { href: "/calendar", label: "月历", icon: CalendarBlank },
  { href: "/review", label: "回顾", icon: ChartBar },
  { href: "/me", label: "我的", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="safe-pb z-20 mt-auto shrink-0 border-t border-[#ECF1EF] bg-white px-4 pt-2 backdrop-blur">
      <div className="grid grid-cols-3 gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-[62px] flex-col items-center justify-center gap-1 px-2 py-2 text-[12px] transition-colors active:scale-[0.98]",
                isActive ? "text-[#3D9428]" : "text-[#A3AEAB]",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={21} weight={isActive ? "fill" : "regular"} />
              <span className={cn("leading-none", isActive && "font-semibold")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
