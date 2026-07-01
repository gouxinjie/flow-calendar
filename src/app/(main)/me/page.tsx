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
import { ArrowsClockwise, CaretRight, Info, SignOut, TagSimple, User } from "@phosphor-icons/react";

import { EmptyState } from "@/components/commons/empty-state";
import { StateBanner } from "@/components/commons/state-banner";
import { SectionCard } from "@/components/business/shared/mobile-shell";
import { requestApi, clearSessionToken } from "@/services/api-client";
import type { UserProfile } from "@/types/models";

export default function MePage() {
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
      document.cookie = "lime_calendar_session=; path=/; max-age=0; SameSite=Lax";
      // 清除 localStorage 中的 session token
      clearSessionToken();
      window.location.href = "/login";
    } catch (requestError) {
      setFeedback(requestError instanceof Error ? requestError.message : "退出失败");
    }
  };

  return (
    <div className="flex h-full flex-col">
      <header className="px-4 pb-3 pt-5">
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#1F2A2A]">我的</h1>
        <p className="mt-1.5 text-[13px] text-[#7C8A87]">账号、标签和同步状态</p>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {feedback ? <StateBanner tone="error" message={feedback} className="mb-4" /> : null}
        {pageError ? <StateBanner tone="error" message={pageError} className="mb-4" /> : null}

        {loading ? (
          <SectionCard className="mb-4 h-[110px] animate-pulse bg-white/70" />
        ) : profile ? (
          <SectionCard className="mb-4 flex items-center gap-4">
            <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#E3F5DA] text-[20px] font-semibold text-[#5EBF3F] shadow-[0_2px_8px_rgba(94,191,63,0.15)]">
              {profile.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-[17px] font-semibold text-[#1F2A2A]">{profile.name}</h2>
              <p className="mt-0.5 text-[13px] text-[#7C8A87]">{profile.phone}</p>
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
              className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0 active:opacity-70"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#E3F5DA] text-[#5EBF3F]">
                <TagSimple size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] text-[#1F2A2A]">标签管理</p>
                <p className="text-[12px] text-[#8EA094]">整理颜色、顺序与启用状态</p>
              </div>
              <CaretRight size={16} className="text-[#C5D6CC] shrink-0" />
            </Link>

            <Link
              href="/account"
              className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0 active:opacity-70"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#E3F5DA] text-[#5EBF3F]">
                <User size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] text-[#1F2A2A]">账号与安全</p>
                <p className="text-[12px] text-[#8EA094]">查看用户名、手机号和基础资料</p>
              </div>
              <CaretRight size={16} className="text-[#C5D6CC] shrink-0" />
            </Link>
          </div>
        </SectionCard>

        <SectionCard className="mb-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#FFF4E8] text-[#FF9F43]">
              <ArrowsClockwise size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-[15px] text-[#1F2A2A] mb-0.5">同步状态</h3>
              <p className="text-[13px] leading-6 text-[#6B7A7A]">
                当前版本以服务端数据为主，登录后新增、编辑和删除都会直接写入数据库。
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#F0EEFA] text-[#8B8AEF]">
              <Info size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-[15px] text-[#1F2A2A] mb-0.5">关于 青柠日历</h3>
              <p className="text-[13px] leading-6 text-[#6B7A7A]">
                这是一个以月历为核心的轻量记录工具，重点不是规划未来，而是回看已经发生过的生活。
              </p>
            </div>
          </div>
        </SectionCard>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-[12px] border border-[#F0E4E4] bg-white py-[13px] text-[14px] text-[#D85A5A] active:bg-[#FFF5F5] transition-colors"
        >
          <SignOut size={16} />
          退出登录
        </button>
      </div>
    </div>
  );
}
