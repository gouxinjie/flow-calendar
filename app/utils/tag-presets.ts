/**
 * @description 标签颜色与分类预设
 */
import type { TagCategory, TagColorTone } from "@/types/models";
import { TAG_COLOR_MAP } from "@/types/models";

export const TAG_COLOR_OPTIONS: Array<{ tone: TagColorTone; label: string }> = [
  { tone: "green", label: "生活" },
  { tone: "blue", label: "工作" },
  { tone: "orange", label: "外出" },
  { tone: "purple", label: "社交" },
  { tone: "greyGreen", label: "休息" },
  { tone: "gray", label: "中性" },
];

export const TAG_CATEGORY_OPTIONS: Array<{ value: TagCategory; label: string }> = [
  { value: "work", label: "工作学习" },
  { value: "health", label: "运动健康" },
  { value: "social", label: "社交聚会" },
  { value: "leisure", label: "休闲娱乐" },
  { value: "rest", label: "休息居家" },
  { value: "other", label: "其他" },
];

/**
 * @description 根据颜色值推断语义色调，便于编辑页回填
 */
export function resolveTagToneByColor(color: string): TagColorTone {
  const normalized = color.trim().toLowerCase();
  const matched = Object.entries(TAG_COLOR_MAP).find(([, value]) => {
    return value.bg.toLowerCase() === normalized || value.border.toLowerCase() === normalized;
  });

  return (matched?.[0] as TagColorTone | undefined) ?? "green";
}
