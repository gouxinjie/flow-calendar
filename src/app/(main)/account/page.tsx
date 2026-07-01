"use client";

/**
 * @page AccountPage
 * @description 账号与安全页
 * @author gouxinjie
 * @created 2026-06-22
 * @updated 2026-06-22
 */
import { useEffect, useState } from "react";
import { Envelope, Phone } from "@phosphor-icons/react";

import { ScreenHeader, SectionCard } from "@/components/business/shared/mobile-shell";
import { StateBanner } from "@/components/commons/state-banner";
import { requestApi } from "@/services/api-client";
import type { UserProfile } from "@/types/models";

export default function AccountPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);

      try {
        const nextProfile = await requestApi<UserProfile>("/api/account");
        if (!active) {
          return;
        }

        setProfile(nextProfile);
        setName(nextProfile.name);
        setPhone(nextProfile.phone ?? "");
      } catch (requestError) {
        if (!active) {
          return;
        }

        setNotice({
          tone: "error",
          message: requestError instanceof Error ? requestError.message : "读取账号信息失败",
        });
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

  const handleSave = async () => {
    setSaving(true);
    setNotice(null);

    try {
      const nextProfile = await requestApi<UserProfile>("/api/account", {
        method: "PUT",
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
        }),
      });

      setProfile(nextProfile);
      setName(nextProfile.name);
      setPhone(nextProfile.phone ?? "");
      setNotice({ tone: "success", message: "资料已更新" });
    } catch (requestError) {
      setNotice({
        tone: "error",
        message: requestError instanceof Error ? requestError.message : "保存失败",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="账号与安全" backHref="/me" />

      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-2">
        {notice ? <StateBanner tone={notice.tone} message={notice.message} className="mb-4" /> : null}

        <SectionCard className="mb-4">
          <h3 className="mb-4 text-[13px] font-semibold text-[#9BAE97]">基本资料</h3>

          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#E3F5DA] text-[20px] font-semibold text-[#5EBF3F] shadow-[0_2px_8px_rgba(94,191,63,0.15)]">
              {profile?.name?.charAt(0) ?? "F"}
            </div>
            <div>
              <p className="text-[15px] text-[#1F2A2A]">
                {loading ? "读取中…" : profile?.name ?? "未命名用户"}
              </p>
              <p className="mt-0.5 text-[12px] text-[#9BAE97]">暂不支持自定义头像</p>
            </div>
          </div>

          <label className="mb-2 block text-[13px] text-[#6B7A7A]">用户名</label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="请输入用户名"
            className="mb-4 w-full rounded-[16px] border border-[#DCEAD2] bg-white px-4 py-3 text-[14px] text-[#1F2A2A] outline-none transition-colors placeholder:text-[#BFC7C3] focus:border-[#5EBF3F] focus:ring-1 focus:ring-[#5EBF3F]/20"
          />

          <label className="mb-2 block text-[13px] text-[#6B7A7A]">手机号</label>
          <input
            type="tel"
            value={phone}
            readOnly
            placeholder="暂不可修改"
            className="w-full rounded-[16px] border border-[#DCEAD2] bg-[#F3FAF7] px-4 py-3 text-[14px] text-[#7C8A87] outline-none"
          />
        </SectionCard>

        <SectionCard className="mb-4">
          <h3 className="mb-3 text-[13px] font-semibold text-[#9BAE97]">联系信息</h3>

          <div className="flex items-center gap-3 rounded-[16px] bg-[#F3FAF7] px-4 py-3">
            <Phone size={16} className="text-[#9BAE97] shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[12px] text-[#8EA094]">手机号</p>
              <p className="text-[14px] text-[#1F2A2A]">{profile?.phone ?? "—"}</p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3 rounded-[16px] bg-[#F3FAF7] px-4 py-3">
            <Envelope size={16} className="text-[#9BAE97] shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[12px] text-[#8EA094]">邮箱</p>
              <p className="text-[14px] text-[#7C8A87]">{profile?.email ?? "未填写"}</p>
            </div>
          </div>
        </SectionCard>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading}
          className="w-full rounded-[16px] bg-[#5EBF3F] py-3.5 text-[14px] font-semibold text-white transition-colors active:bg-[#4DAB30] disabled:opacity-50"
        >
          {saving ? "保存中…" : "保存修改"}
        </button>
      </div>
    </div>
  );
}
