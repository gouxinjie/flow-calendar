/**
 * @component StateBanner
 * @description 通用状态提示条
 * @author gouxinjie
 * @created 2026-06-22
 */
import { cn } from "@/lib/cn";

type BannerTone = "success" | "error" | "info";

const TONE_CLASS_MAP: Record<BannerTone, string> = {
  success: "border-[#B9EBDD] bg-[#ECFAF5] text-[#16967F]",
  error: "border-[#F2C0C0] bg-[#FFF5F5] text-[#D85A5A]",
  info: "border-[#DCE7E4] bg-white text-[#516262]",
};

interface StateBannerProps {
  tone?: BannerTone;
  message: string;
  className?: string;
}

export function StateBanner({
  tone = "info",
  message,
  className,
}: StateBannerProps) {
  return (
    <div
      className={cn(
        "rounded-[16px] border px-4 py-3 text-[13px] leading-6",
        TONE_CLASS_MAP[tone],
        className,
      )}
    >
      {message}
    </div>
  );
}
