"use client";

/**
 * @page DateDetailPage
 * @description 日期详情页
 * @author gouxinjie
 * @created 2026-06-22
 * @updated 2026-07-01
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CaretLeftIcon, CopyIcon, DotsThreeIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import dayjs from "dayjs";

import { ConfirmSheet } from "@/components/commons/confirm-sheet";
import { EmptyState } from "@/components/commons/empty-state";
import { StateBanner } from "@/components/commons/state-banner";
import { cn } from "@/lib/cn";
import { RecordEditor } from "@/components/business/record/record-editor";
import { SectionCard, TagBadge } from "@/components/business/shared/mobile-shell";
import { getDateBadgeInfo } from "@/lib/calendar";
import { sortRecordsByTimeline } from "@/lib/record";
import { requestApi } from "@/services/api-client";
import { useCalendarStore } from "@/stores/calendar-store";
import type { ActivityLog, ActivityTag, RecordFormData } from "@/types/models";

/** 每天最多记录条数 */
const MAX_RECORDS_PER_DAY = 3;

export default function DateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const triggerRefresh = useCalendarStore((s) => s.triggerRefresh);
  const date = (params.date as string) ?? dayjs().format("YYYY-MM-DD");

  const [records, setRecords] = useState<ActivityLog[]>([]);
  const [tags, setTags] = useState<ActivityTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ActivityLog | null>(null);
  const [draftRecord, setDraftRecord] = useState<RecordFormData | undefined>(undefined);
  /** 编辑器模式 */
  const [editorMode, setEditorMode] = useState<"create" | "edit" | "copy">("create");
  /** 当前打开更多菜单的记录 ID */
  const [menuRecordId, setMenuRecordId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    async function loadDateDetail() {
      setLoading(true);
      setNotice(null);

      try {
        const [nextRecords, nextTags] = await Promise.all([
          requestApi<ActivityLog[]>(`/api/records?date=${date}&sort=asc`),
          requestApi<ActivityTag[]>("/api/tags"),
        ]);

        if (!active) {
          return;
        }

        setRecords(nextRecords);
        setTags(nextTags);
      } catch (requestError) {
        if (!active) {
          return;
        }

        setNotice({
          tone: "error",
          message: requestError instanceof Error ? requestError.message : "读取当天记录失败",
        });
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadDateDetail();

    return () => {
      active = false;
    };
  }, [date]);

  // 点击外部关闭更多菜单
  useEffect(() => {
    if (!menuRecordId) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuRecordId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRecordId]);

  const displayDate = dayjs(date).format("M月D日");
  const displayWeekday = dayjs(date).format("dddd");
  const dateBadge = useMemo(() => getDateBadgeInfo(date), [date]);
  const sortedRecords = useMemo(() => sortRecordsByTimeline(records), [records]);
  const isFull = sortedRecords.length >= MAX_RECORDS_PER_DAY;

  const handleCreate = () => {
    setEditingRecord(null);
    setDraftRecord(undefined);
    setEditorMode("create");
    setShowEditor(true);
  };

  const handleEdit = (record: ActivityLog) => {
    setEditingRecord(record);
    setDraftRecord({
      title: record.title,
      tagId: record.tagId ?? undefined,
      date: record.date,
      startTime: record.startTime ?? undefined,
      note: record.note ?? undefined,
    });
    setEditorMode("edit");
    setShowEditor(true);
  };

  const handleCopy = (record: ActivityLog) => {
    setEditingRecord(null);
    setDraftRecord({
      title: record.title,
      tagId: record.tagId ?? undefined,
      date: record.date,
      startTime: record.startTime ?? undefined,
      note: record.note ?? undefined,
    });
    setEditorMode("copy");
    setShowEditor(true);
  };

  /** 从更多菜单触发删除：直接弹确认窗 */
  const handleMenuDelete = (record: ActivityLog) => {
    setEditingRecord(record);
    setMenuRecordId(null);
    setShowDeleteConfirm(true);
  };

  const handleSave = async (data: RecordFormData) => {
    setSaving(true);
    setNotice(null);

    try {
      if (editingRecord) {
        await requestApi<ActivityLog>(`/api/records/${editingRecord.id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      } else {
        await requestApi<ActivityLog>("/api/records", {
          method: "POST",
          body: JSON.stringify(data),
        });
      }

      const nextRecords = await requestApi<ActivityLog[]>(`/api/records?date=${date}&sort=asc`);
      setRecords(sortRecordsByTimeline(nextRecords));
      setShowEditor(false);
      setEditingRecord(null);
      setDraftRecord(undefined);
      setNotice({ tone: "success", message: editingRecord ? "记录已更新" : "记录已新增" });
      // 通知日历首页刷新数据
      triggerRefresh();
      // 新增记录成功后跳转回日历页面
      if (!editingRecord) {
        router.push("/calendar");
      }
    } catch (requestError) {
      setNotice({
        tone: "error",
        message: requestError instanceof Error ? requestError.message : "保存记录失败",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingRecord) {
      return;
    }

    setDeleting(true);
    setNotice(null);

    try {
      await requestApi<null>(`/api/records/${editingRecord.id}`, {
        method: "DELETE",
        body: JSON.stringify({}),
      });

      const nextRecords = await requestApi<ActivityLog[]>(`/api/records?date=${date}&sort=asc`);
      setRecords(sortRecordsByTimeline(nextRecords));
      setShowDeleteConfirm(false);
      setShowEditor(false);
      setEditingRecord(null);
      setDraftRecord(undefined);
      setNotice({ tone: "success", message: "记录已删除" });
      // 通知日历首页刷新数据，确保返回后不再显示已删除的记录
      triggerRefresh();
    } catch (requestError) {
      setNotice({
        tone: "error",
        message: requestError instanceof Error ? requestError.message : "删除记录失败",
      });
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* 顶部：返回按钮 + 日期 + 节日 + 干支日 + 装饰植物 */}
      <div className="relative shrink-0 px-4 pb-2 pt-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => router.push("/calendar")}
                className="-ml-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#6B7A7A] active:bg-[#F4F9F1]"
                aria-label="返回日历"
              >
                <CaretLeftIcon size={20} weight="bold" />
              </button>
              <h1 className="text-[26px] font-semibold tracking-[-0.03em] text-[#1F2A2A]">
                {displayDate}
              </h1>
              {dateBadge.festivalName ? (
                <span className="text-[14px] font-semibold text-[#5EBF3F]">
                  {dateBadge.festivalName}
                </span>
              ) : dateBadge.jieQi ? (
                <span className="text-[14px] font-semibold text-[#5EBF3F]">
                  {dateBadge.jieQi}
                </span>
              ) : null}
            </div>
            <p className="mt-1.5 text-[12px] text-[#7A8A88]">
              {dateBadge.lunarText} · {displayWeekday}
            </p>
          </div>
          {/* 右上角植物装饰 */}
          <div className="pointer-events-none relative -mr-2 -mt-1 h-16 w-20 shrink-0">
            <svg
              viewBox="0 0 100 80"
              className="h-full w-full"
              aria-hidden="true"
            >
              <defs>
                <radialGradient id="leafA" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#B5E8C8" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#7CC9A0" stopOpacity="0.7" />
                </radialGradient>
                <radialGradient id="leafB" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#C8EBD0" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#8FD3AC" stopOpacity="0.6" />
                </radialGradient>
              </defs>
              {/* 茎 */}
              <path
                d="M48 80 Q 52 50 58 20"
                stroke="#7CC9A0"
                strokeWidth="1.4"
                fill="none"
                strokeLinecap="round"
                opacity="0.7"
              />
              {/* 叶子 */}
              <ellipse cx="42" cy="58" rx="10" ry="5" fill="url(#leafA)" transform="rotate(-30 42 58)" />
              <ellipse cx="62" cy="40" rx="11" ry="5.5" fill="url(#leafB)" transform="rotate(25 62 40)" />
              <ellipse cx="56" cy="22" rx="9" ry="4.5" fill="url(#leafA)" transform="rotate(15 56 22)" />
              <ellipse cx="74" cy="14" rx="6" ry="3.5" fill="url(#leafB)" transform="rotate(40 74 14)" />
              <ellipse cx="38" cy="36" rx="7" ry="3.5" fill="url(#leafB)" transform="rotate(-40 38 36)" />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-2">
        {/* 标题：当天记录 N */}
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-[16px] font-semibold tracking-[-0.02em] text-[#1F2A2A]">
            当天记录
          </h2>
          <span className="text-[14px] font-medium text-[#8EA094]">
            {sortedRecords.length}
          </span>
        </div>

        {notice ? <StateBanner tone={notice.tone} message={notice.message} className="mb-3" /> : null}

        {loading ? (
          <SectionCard className="h-[220px] animate-pulse bg-white/70" />
        ) : sortedRecords.length === 0 ? (
          <EmptyState
            title="这天还没有记录"
            description="点底部按钮，补上一条已经发生的小事。"
            action={
              <button
                type="button"
                onClick={handleCreate}
                className="rounded-full bg-[#5EBF3F] px-4 py-2 text-[13px] font-semibold text-white"
              >
                新增记录
              </button>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {sortedRecords.map((record) => (
              <SectionCard key={record.id} className="!p-0">
                  {/* 内容列 */}
                  <div className="px-3 pb-4 pt-4">
                    <div className="relative">
                      {/* 标题行：色点 + 时间 + 标题 + 操作按钮 */}
                      <div className="flex items-start justify-between gap-2 pr-[104px]">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-block h-2 w-2 shrink-0 rounded-full"
                              style={{ backgroundColor: record.tag?.color ?? "#9BAE97" }}
                              aria-hidden="true"
                            />
                            {record.startTime ? (
                              <span className="shrink-0 font-numeric text-[16px] font-semibold tracking-[-0.02em] text-[#1F2A2A]">
                                {record.startTime}
                              </span>
                            ) : null}
                            <h3 className="truncate text-[16px] font-semibold tracking-[-0.01em] text-[#1F2A2A]">
                              {record.title}
                            </h3>
                          </div>
                          {/* 标签徽章 */}
                          {record.tag ? (
                            <div className="mt-1.5">
                              <TagBadge label={record.tag.name} color={record.tag.color} compact />
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {/* 备注 — 占满整行宽度 */}
                      {record.note ? (
                        <p className="mt-1.5 text-[13px] leading-6 text-[#5C6E6B]">
                          {record.note}
                        </p>
                      ) : null}

                      {/* 右侧操作按钮（编辑 + 复制 + 更多） */}
                      <div className="absolute right-0 top-0 flex items-center">
                        <button
                          type="button"
                          onClick={() => handleEdit(record)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-[#8EA094] active:bg-[#F4F9F1]"
                          aria-label="编辑记录"
                        >
                          <PencilSimpleIcon size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopy(record)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-[#8EA094] active:bg-[#F4F9F1]"
                          aria-label="复制记录"
                        >
                          <CopyIcon size={16} />
                        </button>
                        <div className="relative" ref={menuRecordId === record.id ? menuRef : undefined}>
                          <button
                            type="button"
                            onClick={() => setMenuRecordId(menuRecordId === record.id ? null : record.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-[#8EA094] active:bg-[#F4F9F1]"
                            aria-label="更多操作"
                          >
                            <DotsThreeIcon size={18} weight="bold" />
                          </button>
                          {menuRecordId === record.id ? (
                            <div className="absolute right-0 top-full z-30 mt-1 w-36 rounded-[14px] border border-[#DCEAD2] bg-white py-1 shadow-[0_8px_24px_rgba(18,46,40,0.12)]">
                              <button
                                type="button"
                                onClick={() => handleMenuDelete(record)}
                                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-[#E06060] active:bg-[#FFF5F5]"
                              >
                                <TrashIcon size={15} />
                                删除记录
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
              </SectionCard>
            ))}
          </div>
        )}
      </div>

      <div className="safe-pb shrink-0 px-4 pb-4">
        <button
          type="button"
          onClick={handleCreate}
          disabled={isFull}
          className={cn(
            "flex h-[48px] w-full items-center justify-center rounded-[14px] text-[14px] font-semibold text-white shadow-[0_18px_30px_rgba(34,195,166,0.24)] transition-colors",
            isFull
              ? "cursor-not-allowed bg-[#B5C9C4] shadow-none"
              : "bg-[#5EBF3F]",
          )}
        >
          {isFull ? "当日记录已满（3条）" : "+  新增记录"}
        </button>
      </div>

      <RecordEditor
        key={`date-record-${showEditor ? `${editingRecord?.id ?? "new"}-${draftRecord?.date ?? date}` : "closed"}`}
        open={showEditor}
        onClose={() => {
          setShowEditor(false);
          setEditingRecord(null);
          setDraftRecord(undefined);
        }}
        onSave={handleSave}
        onDelete={editingRecord ? () => setShowDeleteConfirm(true) : undefined}
        initialData={draftRecord}
        tags={tags}
        defaultDate={date}
        saving={saving}
        errorMessage={notice?.tone === "error" ? notice.message : undefined}
        mode={editorMode}
      />

      <ConfirmSheet
        open={showDeleteConfirm}
        title="删除这条记录？"
        description="删除后不会自动恢复，请确认这条记录已经不需要保留。"
        loading={deleting}
        onConfirm={() => void handleDelete()}
        onClose={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
