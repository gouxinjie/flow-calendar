"use client";

/**
 * @component BottomNav
 * @description 移动端底部主导航，3 个入口：月历、回顾、我的
 * @author gouxinjie
 * @created 2026-06-22
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarBlank, MagnifyingGlass, UserCircle } from "@phosphor-icons/react";

import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { href: "/calendar", label: "月历", icon: CalendarBlank },
  { href: "/review", label: "回顾", icon: MagnifyingGlass },
  { href: "/me", label: "我的", icon: UserCircle },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="safe-pb z-20 mt-auto shrink-0 border-t border-[#E2ECE9] bg-white/92 px-3 pt-2 backdrop-blur">
      <div className="grid grid-cols-3 gap-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-[20px] px-2 py-2.5 text-[12px] font-medium transition-all active:scale-[0.98]",
                isActive
                  ? "bg-[#EEF8F5] text-[#16967F] shadow-[inset_0_0_0_1px_rgba(34,195,166,0.12)]"
                  : "text-[#889694]",
              )}
            >
              <Icon size={22} weight={isActive ? "fill" : "regular"} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
