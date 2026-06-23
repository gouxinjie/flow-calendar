/**
 * @description 主应用布局，包含底部导航。
 */
import type { ReactNode } from "react";

import { BottomNav } from "@/components/business/shared/bottom-nav";
import { AppCanvas } from "@/components/business/shared/mobile-shell";
import { requireUserId } from "@/server/auth";

export default async function MainLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  await requireUserId();

  return (
    <AppCanvas className="bg-[#f7faf9]">
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">{children}</main>
      <BottomNav />
    </AppCanvas>
  );
}
