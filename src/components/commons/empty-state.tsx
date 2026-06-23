/**
 * @component EmptyState
 * @description 通用空状态组件
 * @author gouxinjie
 * @created 2026-06-22
 */
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-[#DCE7E4] bg-white/70 px-6 py-12 text-center">
      {icon ? (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF6F4] text-[#8EA19C]">
          {icon}
        </div>
      ) : null}
      <h3 className="text-[16px] font-semibold text-[#243332]">{title}</h3>
      <p className="mt-2 max-w-[18rem] text-[13px] leading-6 text-[#70807D]">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
