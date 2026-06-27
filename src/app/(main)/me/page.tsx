"use client";

/**
 * @page MePage
 * @description 我的页 - 用户资料、标签入口与同步说明
 * @author gouxinjie
 * @created 2026-06-22
 * @updated 2026-06-22
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowsClockwise, Info, TagSimple, User } from "@phosphor-icons/react";

import { EmptyState } from "@/components/commons/empty-state";
import { StateBanner } from "@/components/commons/state-banner";
import { SectionCard } from "@/components/business/shared/mobile-shell";
import { requestApi, clearSessionToken } from "@/services/api-client";
import type { UserProfile } from "@/types/models";

export default function MePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      setPageError("");

      try {
        const nextProfile = await requestApi<UserProfile>("/api/account");
        if (!active) {
          return;
        }

        setProfile(nextProfile);
      } catch (requestError) {
        if (!active) {
          return;
        }

        setPageError(requestError instanceof Error ? requestError.message : "读取账号信息失败");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await requestApi<null>("/api/auth/logout", {
        method: "POST",
        body: JSON.stringify({}),
      });
      // 清除客户端兜底 cookie
      document.cookie = "flow_calendar_session=; path=/; max-age=0; SameSite=Lax";
      // 清除 localStorage 中的 session token
      clearSessionToken();
      window.location.href = "/login";
    } catch (requestError) {
      setFeedback(requestError instanceof Error ? requestError.message : "退出失败");
    }
  };

  return (
    <div className="flex h-full flex-col">
      <header className="px-4 pb-2 pt-4">
        <h1 className="text-[24px] font-semibold tracking-[-0.03em] text-[#1F2A2A]">我的</h1>
        <p className="mt-1 text-[13px] text-[#8C9A97]">账号、标签和同步状态都放在这里</p>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {feedback ? <StateBanner tone="error" message={feedback} className="mb-4" /> : null}
        {pageError ? <StateBanner tone="error" message={pageError} className="mb-4" /> : null}

        {loading ? (
          <SectionCard className="mb-4 h-[110px] animate-pulse bg-white/70" />
        ) : profile ? (
          <SectionCard className="mb-4 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#DDF7F1] text-[22px] font-semibold text-[#16967F]">
              {profile.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-[18px] font-semibold text-[#1F2A2A]">{profile.name}</h2>
              <p className="mt-0.5 text-[13px] text-[#7C8A87]">{profile.email}</p>
            </div>
          </SectionCard>
        ) : (
          <EmptyState
            title="暂时读取不到账号信息"
            description="请刷新页面重试。"
          />
        )}

        <SectionCard className="mb-4">
          <div className="divide-y divide-[#F0F5F3]">
            <Link
              href="/tags"
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 active:opacity-70"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#F2F8F6]">
                <TagSimple size={20} className="text-[#22C3A6]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-medium text-[#1F2A2A]">标签管理</p>
                <p className="text-[12px] text-[#8EA09B]">整理颜色、顺序与启用状态</p>
              </div>
            </Link>

            <Link
              href="/account"
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 active:opacity-70"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#F2F8F6]">
                <User size={20} className="text-[#22C3A6]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-medium text-[#1F2A2A]">账号与安全</p>
                <p className="text-[12px] text-[#8EA09B]">查看用户名、邮箱和基础资料</p>
              </div>
            </Link>
          </div>
        </SectionCard>

        <SectionCard className="mb-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#F2F8F6]">
              <ArrowsClockwise size={20} className="text-[#22C3A6]" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-[15px] font-medium text-[#1F2A2A]">同步状态</h3>
              <p className="mt-1 text-[13px] leading-6 text-[#6B7A7A]">
                当前版本以服务端数据为主，登录后新增、编辑和删除都会直接写入数据库。
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#F2F8F6]">
              <Info size={20} className="text-[#22C3A6]" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-[15px] font-medium text-[#1F2A2A]">关于 Flow Calendar</h3>
              <p className="mt-1 text-[13px] leading-6 text-[#6B7A7A]">
                这是一个以月历为核心的轻量记录工具，重点不是规划未来，而是回看已经发生过的生活。
              </p>
            </div>
          </div>
        </SectionCard>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 w-full rounded-[8px] border border-[#E7D3D3] bg-white py-3 text-[14px] font-medium text-[#D85A5A] active:bg-[#FFF5F5]"
        >
          退出登录
        </button>
      </div>
    </div>
  );
}
