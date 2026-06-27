"use client";

/**
 * @page DateDetailPage
 * @description 日期详情页
 * @author gouxinjie
 * @created 2026-06-22
 * @updated 2026-06-22
 */
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Clock, Copy, DotsThree, NotePencil } from "@phosphor-icons/react";
import dayjs from "dayjs";

import { ConfirmSheet } from "@/components/commons/confirm-sheet";
import { EmptyState } from "@/components/commons/empty-state";
import { StateBanner } from "@/components/commons/state-banner";
import { cn } from "@/lib/cn";
import { RecordEditor } from "@/components/business/record/record-editor";
import { ScreenHeader, SectionCard, TagBadge } from "@/components/business/shared/mobile-shell";
import { getLunarLabel } from "@/lib/calendar";
import { sortRecordsByTimeline } from "@/lib/record";
import { requestApi } from "@/services/api-client";
import type { ActivityLog, ActivityTag, RecordFormData } from "@/types/models";

/** 每天最多记录条数 */
const MAX_RECORDS_PER_DAY = 3;

export default function DateDetailPage() {
  const params = useParams();
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

        setRecords(sortRecordsByTimeline(nextRecords));
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

  const displayDate = dayjs(date).format("M月D日 dddd");
  const lunarLabel = getLunarLabel(date);
  const sortedRecords = useMemo(() => sortRecordsByTimeline(records), [records]);
  const isFull = sortedRecords.length >= MAX_RECORDS_PER_DAY;

  const handleCreate = () => {
    setEditingRecord(null);
    setDraftRecord(undefined);
    setShowEditor(true);
  };

  const handleEdit = (record: ActivityLog) => {
    setEditingRecord(record);
    setDraftRecord({
      title: record.title,
      tagId: record.tagId ?? undefined,
      date: record.date,
      timeType: record.timeType,
      startTime: record.startTime ?? undefined,
      note: record.note ?? undefined,
    });
    setShowEditor(true);
  };

  const handleCopy = (record: ActivityLog) => {
    setEditingRecord(null);
    setDraftRecord({
      title: record.title,
      tagId: record.tagId ?? undefined,
      date: record.date,
      timeType: record.timeType,
      startTime: record.startTime ?? undefined,
      note: record.note ?? undefined,
    });
    setShowEditor(true);
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
      <ScreenHeader title={displayDate} subtitle={lunarLabel} backHref="/calendar" />

      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-2">
        {notice ? <StateBanner tone={notice.tone} message={notice.message} className="mb-4" /> : null}

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
                className="rounded-full bg-[#169968] px-4 py-2 text-[13px] font-semibold text-white"
              >
                新增记录
              </button>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {sortedRecords.map((record) => (
              <SectionCard key={record.id} className="gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {record.startTime ? (
                        <span className="font-numeric text-[13px] font-semibold text-[#243332]">
                          {record.startTime}
                        </span>
                      ) : (
                        <span className="rounded-full bg-[#EEF6F4] px-2 py-1 text-[11px] font-medium text-[#6B7A7A]">
                          全天
                        </span>
                      )}
                      {record.tag ? (
                        <TagBadge label={record.tag.name} color={record.tag.color} compact />
                      ) : (
                        <span className="text-[11px] text-[#A8B8B0]">未分类</span>
                      )}
                    </div>
                    <h3 className="mt-3 text-[17px] font-semibold tracking-[-0.02em] text-[#1F2A2A]">
                      {record.title}
                    </h3>
                    {record.note ? (
                      <p className="mt-2 text-[13px] leading-6 text-[#667774]">{record.note}</p>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleCopy(record)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-[#8EA09B] active:bg-[#F3F7F6]"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEdit(record)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-[#8EA09B] active:bg-[#F3F7F6]"
                    >
                      <NotePencil size={16} />
                    </button>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full text-[#D2DAD8]">
                      <DotsThree size={16} weight="bold" />
                    </span>
                  </div>
                </div>

                {record.timeType === "scheduled" && record.startTime ? (
                  <div className="mt-3 flex items-center gap-2 border-t border-[#EEF3F1] pt-3 text-[12px] text-[#8EA09B]">
                    <Clock size={14} />
                    按具体时间记录
                  </div>
                ) : null}
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
            "flex h-[48px] w-full items-center justify-center rounded-[14px] text-[14px] font-semibold text-white shadow-[0_18px_30px_rgba(22,153,104,0.24)] transition-colors",
            isFull
              ? "cursor-not-allowed bg-[#B5C9C4] shadow-none"
              : "bg-[#169968]",
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
