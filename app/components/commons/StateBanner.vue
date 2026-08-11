<script setup lang="ts">
/**
 * @component StateBanner
 * @description 通用状态提示条
 * @author gouxinjie
 * @created 2026-08-10
 */

type BannerTone = "success" | "error" | "info";

const props = withDefaults(
  defineProps<{
    tone?: BannerTone;
    message: string;
    className?: string;
  }>(),
  {
    tone: "info",
    className: "",
  },
);

const TONE_CLASS_MAP: Record<BannerTone, string> = {
  success: "border-[#B5EBDE] bg-[#EDFBF7] text-[#3D9428]",
  error: "border-[#F2C0C0] bg-[#FFF5F5] text-[#D85A5A]",
  info: "border-[#DCEAD2] bg-white text-[#516262]",
};
</script>

<template>
  <div
    :class="[
      'rounded-[16px] border px-4 py-3 text-[13px] leading-6',
      TONE_CLASS_MAP[props.tone],
      className,
    ]"
  >
    {{ message }}
  </div>
</template>
