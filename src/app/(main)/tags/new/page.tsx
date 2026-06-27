"use client";

/**
 * @page NewTagPage
 * @description 新建标签页
 * @author gouxinjie
 * @created 2026-06-22
 * @updated 2026-06-22
 */
import { useState } from "react";
import { useRouter } from "next/navigation";

import { ScreenHeader } from "@/components/business/shared/mobile-shell";
import { StateBanner } from "@/components/commons/state-banner";
import { cn } from "@/lib/cn";
import { TAG_CATEGORY_OPTIONS, TAG_COLOR_OPTIONS } from "@/lib/tag-presets";
import { requestApi } from "@/services/api-client";
import type { ActivityTag, TagCategory, TagColorTone } from "@/types/models";
import { TAG_COLOR_MAP } from "@/types/models";

export default function NewTagPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState<TagColorTone>("green");
  const [selectedCategory, setSelectedCategory] = useState<TagCategory>("other");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setNotice("");

    try {
      await requestApi<ActivityTag>("/api/tags", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          color: TAG_COLOR_MAP[selectedColor].border,
          category: selectedCategory,
        }),
      });

      router.push("/tags");
      router.refresh();
    } catch (requestError) {
      setNotice(requestError instanceof Error ? requestError.message : "创建标签失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="新建标签" backHref="/tags" />

      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-2">
        {notice ? <StateBanner tone="error" message={notice} className="mb-4" /> : null}

        <div className="surface-card flex flex-col gap-5 p-4">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[#6B7A7A]">标签名称 *</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="如：跑步、阅读、聚会"
              maxLength={10}
              className="w-full rounded-[14px] border border-[#DCE7E4] px-4 py-3 text-[14px] text-[#1F2A2A] outline-none focus:border-[#22C3A6]"
            />
          </div>

          <div>
            <label className="mb-2 block text-[13px] font-medium text-[#6B7A7A]">颜色</label>
            <div className="flex flex-wrap gap-3">
              {TAG_COLOR_OPTIONS.map(({ tone, label }) => {
                const colors = TAG_COLOR_MAP[tone];
                return (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => setSelectedColor(tone)}
                    className="flex flex-col items-center gap-1"
                  >
                    <span
                      className={cn(
                        "h-10 w-10 rounded-full border-2 transition-colors",
                        selectedColor === tone ? "border-[#1F2A2A]" : "border-transparent",
                      )}
                      style={{ backgroundColor: colors.border }}
                    />
                    <span className="text-[11px] text-[#6B7A7A]">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[13px] font-medium text-[#6B7A7A]">分类</label>
            <div className="flex flex-wrap gap-2">
              {TAG_CATEGORY_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelectedCategory(value)}
                  className={cn(
                    "rounded-[10px] px-4 py-2 text-[13px] font-medium transition-colors",
                    selectedCategory === value
                      ? "bg-[#22C3A6] text-white"
                      : "bg-[#F3F7F6] text-[#6B7A7A]",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="shrink-0 px-4 pb-4 safe-pb">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={!name.trim() || saving}
          className={cn(
            "flex h-[48px] w-full items-center justify-center rounded-[14px] text-[14px] font-semibold text-white transition-opacity",
            name.trim() && !saving ? "bg-[#22C3A6]" : "bg-[#A8B8B0] cursor-not-allowed",
          )}
        >
          {saving ? "保存中…" : "保存"}
        </button>
      </div>
    </div>
  );
}
