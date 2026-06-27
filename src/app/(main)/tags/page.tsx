"use client";

/**
 * @page TagsPage
 * @description 标签管理页
 * @author gouxinjie
 * @created 2026-06-22
 * @updated 2026-06-22
 */
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { DotsSixVertical, PencilSimple, Plus } from "@phosphor-icons/react";

import { EmptyState } from "@/components/commons/empty-state";
import { StateBanner } from "@/components/commons/state-banner";
import { ScreenHeader, SectionCard } from "@/components/business/shared/mobile-shell";
import { requestApi } from "@/services/api-client";
import type { ActivityTag } from "@/types/models";

const ToggleSwitch = dynamic(
  () => import("@/components/commons/toggle-switch").then((module) => module.ToggleSwitch),
  { ssr: false },
);

export default function TagsPage() {
  const [tags, setTags] = useState<ActivityTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    let active = true;

    async function loadTags() {
      setLoading(true);
      setNotice(null);

      try {
        const nextTags = await requestApi<ActivityTag[]>("/api/tags");
        if (!active) {
          return;
        }

        setTags(nextTags);
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
  }, []);

  const handleToggle = async (tag: ActivityTag) => {
    try {
      const updatedTag = await requestApi<ActivityTag>(`/api/tags/${tag.id}`, {
        method: "PUT",
        body: JSON.stringify({ enabled: !tag.enabled }),
      });

      setTags((currentTags) =>
        currentTags.map((currentTag) => (currentTag.id === updatedTag.id ? updatedTag : currentTag)),
      );
      setNotice({ tone: "success", message: `${updatedTag.name}已${updatedTag.enabled ? "启用" : "停用"}` });
    } catch (requestError) {
      setNotice({
        tone: "error",
        message: requestError instanceof Error ? requestError.message : "更新标签失败",
      });
    }
  };

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader
        title="标签管理"
        subtitle={`${tags.filter((tag) => tag.enabled).length} 个启用标签`}
        backHref="/me"
        rightSlot={
          <Link
            href="/tags/new"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#169968] text-white shadow-[0_12px_24px_rgba(22,153,104,0.25)]"
          >
            <Plus size={18} weight="bold" />
          </Link>
        }
      />

      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-2">
        {notice ? <StateBanner tone={notice.tone} message={notice.message} className="mb-4" /> : null}

        {loading ? (
          <SectionCard className="h-[220px] animate-pulse bg-white/70" />
        ) : tags.length === 0 ? (
          <EmptyState
            title="还没有标签"
            description="创建一个标签，让月历中的记录更好找、更好看。"
            action={
              <Link
                href="/tags/new"
                className="rounded-full bg-[#169968] px-4 py-2 text-[13px] font-semibold text-white"
              >
                新建标签
              </Link>
            }
          />
        ) : (
          <SectionCard>
            <div className="divide-y divide-[#F0F5F3]">
              {tags.map((tag) => (
                <div key={tag.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <DotsSixVertical size={16} className="shrink-0 text-[#C0C9C7]" />
                  <span
                    className="h-9 w-9 shrink-0 rounded-[12px]"
                    style={{ backgroundColor: tag.color }}
                  />

                  <div className="min-w-0 flex-1">
                    <p className={`text-[15px] font-medium ${tag.enabled ? "text-[#1F2A2A]" : "text-[#A8B8B0]"}`}>
                      {tag.name}
                    </p>
                    <p className="mt-0.5 text-[12px] text-[#8EA09B]">
                      排序 {tag.sortOrder} · {tag.category ?? "未分类"}
                    </p>
                  </div>

                  <ToggleSwitch
                    checked={tag.enabled}
                    ariaLabel={`${tag.enabled ? "停用" : "启用"}${tag.name}`}
                    onCheckedChange={() => void handleToggle(tag)}
                  />

                  <Link
                    href={`/tags/${tag.id}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[#8EA09B] active:bg-[#F3F7F6]"
                  >
                    <PencilSimple size={16} />
                  </Link>
                </div>
              ))}
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}
