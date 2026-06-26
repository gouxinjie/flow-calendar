"use client";

/**
 * @component ToggleSwitch
 * @description 基于 Radix Switch 的移动端开关组件
 * @author gouxinjie
 * @created 2026-06-26
 * @updated 2026-06-26
 */
import * as Switch from "@radix-ui/react-switch";

import { cn } from "@/lib/cn";

interface ToggleSwitchProps {
  checked: boolean;
  disabled?: boolean;
  ariaLabel: string;
  onCheckedChange: (checked: boolean) => void;
}

export function ToggleSwitch({
  checked,
  disabled = false,
  ariaLabel,
  onCheckedChange,
}: ToggleSwitchProps) {
  return (
    <Switch.Root
      checked={checked}
      disabled={disabled}
      aria-label={ariaLabel}
      onCheckedChange={onCheckedChange}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full border transition-colors duration-200 ease-out outline-none",
        "data-[state=checked]:border-[#16967F] data-[state=checked]:bg-[#22C3A6]",
        "data-[state=unchecked]:border-[#D8DADF] data-[state=unchecked]:bg-[#D8DADF]",
        "focus-visible:ring-2 focus-visible:ring-[#BEEDE3] focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        "disabled:cursor-not-allowed disabled:opacity-60",
      )}
    >
      <Switch.Thumb
        className={cn(
          "block h-6 w-6 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.22)] transition-transform duration-200 ease-out will-change-transform",
          "translate-x-[2px] data-[state=checked]:translate-x-[22px]",
        )}
      />
    </Switch.Root>
  );
}
