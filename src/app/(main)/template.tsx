"use client";

/**
 * @component MainTemplate
 * @description 主路由组页面切换动效模板，每次导航时重新挂载并播放入场动画
 * @author gouxinjie
 * @created 2026-06-30
 */

import type { ReactNode } from "react";

export default function MainTemplate({ children }: { children: ReactNode }) {
  return <div className="animate-page-enter h-full">{children}</div>;
}
