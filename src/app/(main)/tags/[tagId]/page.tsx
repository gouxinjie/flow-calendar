"use client";

/**
 * @page EditTagPage
 * @description 编辑标签页
 * @author gouxinjie
 * @created 2026-06-22
 * @updated 2026-06-22
 */
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { ScreenHeader } from "@/components/business/shared/mobile-shell";
import { ConfirmSheet } from "@/components/commons/confirm-sheet";
import { StateBanner } from "@/components/commons/state-banner";
import { cn } from "@/lib/cn";
import { TAG_CATEGORY_OPTIONS, TAG_COLOR_OPTIONS, resolveTagToneByColor } from "@/lib/tag-presets";
import { requestApi } from "@/services/api-client";
import type { ActivityTag, TagCategory, TagColorTone } from "@/types/models";
import { TAG_COLOR_MAP } from "@/types/models";

export default function EditTagPage() {
  const params = useParams();
  const router = useRouter();
  const tagId = params.tagId as string;

  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState<TagColorTone>("green");
  const [selectedCategory, setSelectedCategory] = useState<TagCategory>("other");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notice, setNotice] = useState<{ tone: "error" | "success"; message: string } | null>(null);

  useEffect(() => {
    let active = true;

    async function loadTags() {
      setLoading(true);

      try {
        const tags = await requestApi<ActivityTag[]>("/api/tags");
        const currentTag = tags.find((tag) => tag.id === tagId);

        if (!active) {
          return;
        }

        if (!currentTag) {
          setNotice({ tone: "error", message: "标签不存在" });
          return;
        }

        setName(currentTag.name);
        setSelectedCategory((currentTag.category as TagCategory | null) ?? "other");
        setSelectedColor(resolveTagToneByColor(currentTag.color));
      } catch (requestError) {
        if (!active) {
          return;
        }

        setNotice({
          tone: "error",
          message: requestError instanceof Error ? requestError.message : "读取标签失败",
        });
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadTags();

    return () => {
      active = false;
    };
  }, [tagId]);

  const handleSave = async () => {
    setSaving(true);
    setNotice(null);

    try {
      await requestApi<ActivityTag>(`/api/tags/${tagId}`, {
        method: "PUT",
        body: JSON.stringify({
          name: name.trim(),
          color: TAG_COLOR_MAP[selectedColor].border,
          category: selectedCategory,
        }),
      });

      router.push("/tags");
      router.refresh();
    } catch (requestError) {
      setNotice({
        tone: "error",
        message: requestError instanceof Error ? requestError.message : "保存标签失败",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setNotice(null);

    try {
      await requestApi<null>(`/api/tags/${tagId}`, {
        method: "DELETE",
        body: JSON.stringify({}),
      });

      router.push("/tags");
      router.refresh();
    } catch (requestError) {
      setNotice({
        tone: "error",
        message: requestError instanceof Error ? requestError.message : "删除标签失败",
      });
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="编辑标签" backHref="/tags" />

      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-2">
        {notice ? <StateBanner tone={notice.tone} message={notice.message} className="mb-4" /> : null}

        <div className="surface-card flex flex-col gap-5 p-4">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[#6B7A7A]">标签名称 *</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="如：跑步、阅读、聚会"
              maxLength={10}
              disabled={loading}
              className="w-full rounded-[14px] border border-[#DCE7E4] px-4 py-3 text-[14px] text-[#1F2A2A] outline-none focus:border-[#22C3A6]"
            />
          </div>

          <div>
            <label className="mb-2 block text-[13px] font-medium text-[#6B7A7A]">颜色</label>
            <div className="flex flex-wrap gap-3">
              {TAG_COLOR_OPTIONS.map(({ tone, label }) => (
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
                    style={{ backgroundColor: TAG_COLOR_MAP[tone].border }}
                  />
                  <span className="text-[11px] text-[#6B7A7A]">{label}</span>
                </button>
              ))}
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

          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={loading}
            className="mt-1 w-full rounded-[14px] border border-[#E7D3D3] py-3 text-[14px] font-medium text-[#D85A5A]"
          >
            删除标签
          </button>
        </div>
      </div>

      <div className="shrink-0 px-4 pb-4 safe-pb">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={!name.trim() || saving || loading}
          className={cn(
            "flex h-[48px] w-full items-center justify-center rounded-[14px] text-[14px] font-semibold text-white transition-opacity",
            name.trim() && !saving && !loading ? "bg-[#22C3A6]" : "bg-[#A8B8B0] cursor-not-allowed",
          )}
        >
          {saving ? "保存中…" : "保存"}
        </button>
      </div>

      <ConfirmSheet
        open={showDeleteConfirm}
        title="删除这个标签？"
        description="删除后，原来关联这个标签的记录会变为未分类。"
        loading={deleting}
        onConfirm={() => void handleDelete()}
        onClose={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
