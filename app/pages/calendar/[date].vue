<script setup lang="ts">
/**
 * @page DateDetailPage
 * @description 日期详情页
 * @author gouxinjie
 * @created 2026-08-10
 */

import dayjs from "dayjs";
import { useCalendarStore } from "@/composables/useCalendarStore";
import { getDateBadgeInfo } from "@/utils/calendar";
import { sortRecordsByTimeline } from "@/utils/record";
import { requestApi } from "@/services/api-client";
import type { ActivityLog, ActivityTag, RecordFormData } from "@/types/models";

definePageMeta({
  layout: "main",
});

const route = useRoute();
const router = useRouter();
const { triggerRefresh } = useCalendarStore();

const date = computed(() => (route.params.date as string) ?? dayjs().format("YYYY-MM-DD"));

const records = ref<ActivityLog[]>([]);
const tags = ref<ActivityTag[]>([]);
const loading = ref(true);
const saving = ref(false);
const deleting = ref(false);
const notice = ref<{ tone: "success" | "error"; message: string } | null>(null);
const showEditor = ref(false);
const showDeleteConfirm = ref(false);
const editingRecord = ref<ActivityLog | null>(null);
const draftRecord = ref<RecordFormData | undefined>(undefined);
const editorMode = ref<"create" | "edit" | "copy">("create");
const menuRecordId = ref<string | null>(null);
const menuRef = ref<HTMLDivElement | null>(null);

/** 每天最多记录条数 */
const MAX_RECORDS_PER_DAY = 3;

/** 加载日期详情 */
async function loadDateDetail() {
  loading.value = true;
  notice.value = null;

  try {
    const [nextRecords, nextTags] = await Promise.all([
      requestApi<ActivityLog[]>(`/api/records?date=${date.value}&sort=asc`),
      requestApi<ActivityTag[]>("/api/tags"),
    ]);

    records.value = nextRecords;
    tags.value = nextTags;
  } catch (requestError) {
    notice.value = {
      tone: "error",
      message: requestError instanceof Error ? requestError.message : "读取当天记录失败",
    };
  } finally {
    loading.value = false;
  }
}

watch(date, () => {
  void loadDateDetail();
}, { immediate: true });

/** 点击外部关闭更多菜单 */
function handleOutsideClick(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    menuRecordId.value = null;
  }
}
watch(menuRecordId, (val) => {
  if (!val) return;
  document.addEventListener("mousedown", handleOutsideClick);
});
onBeforeUnmount(() => {
  document.removeEventListener("mousedown", handleOutsideClick);
});

const displayDate = computed(() => dayjs(date.value).format("M月D日"));
const displayWeekday = computed(() => dayjs(date.value).format("dddd"));
const dateBadge = computed(() => getDateBadgeInfo(date.value));
const sortedRecords = computed(() => sortRecordsByTimeline(records.value));
const isFull = computed(() => sortedRecords.value.length >= MAX_RECORDS_PER_DAY);

/** 新建 */
function handleCreate() {
  editingRecord.value = null;
  draftRecord.value = undefined;
  editorMode.value = "create";
  showEditor.value = true;
}

/** 编辑 */
function handleEdit(record: ActivityLog) {
  editingRecord.value = record;
  draftRecord.value = {
    title: record.title,
    tagId: record.tagId ?? undefined,
    date: record.date,
    startTime: record.startTime ?? undefined,
    note: record.note ?? undefined,
  };
  editorMode.value = "edit";
  showEditor.value = true;
}

/** 复制 */
function handleCopy(record: ActivityLog) {
  editingRecord.value = null;
  draftRecord.value = {
    title: record.title,
    tagId: record.tagId ?? undefined,
    date: record.date,
    startTime: record.startTime ?? undefined,
    note: record.note ?? undefined,
  };
  editorMode.value = "copy";
  showEditor.value = true;
}

/** 更多菜单触发删除 */
function handleMenuDelete(record: ActivityLog) {
  editingRecord.value = record;
  menuRecordId.value = null;
  showDeleteConfirm.value = true;
}

/** 保存 */
async function handleSave(data: RecordFormData) {
  saving.value = true;
  notice.value = null;
  const isEditing = Boolean(editingRecord.value);

  try {
    if (editingRecord.value) {
      await requestApi<ActivityLog>(`/api/records/${editingRecord.value.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    } else {
      await requestApi<ActivityLog>("/api/records", {
        method: "POST",
        body: JSON.stringify(data),
      });
    }

    const nextRecords = await requestApi<ActivityLog[]>(`/api/records?date=${date.value}&sort=asc`);
    records.value = sortRecordsByTimeline(nextRecords);
    showEditor.value = false;
    editingRecord.value = null;
    draftRecord.value = undefined;
    notice.value = { tone: "success", message: isEditing ? "记录已更新" : "记录已新增" };
    triggerRefresh();
    // 新增记录成功后跳转回日历页面
    if (!isEditing) {
      router.push("/calendar");
    }
  } catch (requestError) {
    notice.value = {
      tone: "error",
      message: requestError instanceof Error ? requestError.message : "保存记录失败",
    };
  } finally {
    saving.value = false;
  }
}

/** 删除 */
async function handleDelete() {
  if (!editingRecord.value) return;

  deleting.value = true;
  notice.value = null;

  try {
    await requestApi<null>(`/api/records/${editingRecord.value.id}`, {
      method: "DELETE",
    });

    const nextRecords = await requestApi<ActivityLog[]>(`/api/records?date=${date.value}&sort=asc`);
    records.value = sortRecordsByTimeline(nextRecords);
    showDeleteConfirm.value = false;
    showEditor.value = false;
    editingRecord.value = null;
    draftRecord.value = undefined;
    notice.value = { tone: "success", message: "记录已删除" };

    triggerRefresh();
    router.push("/calendar");
  } catch (requestError) {
    notice.value = {
      tone: "error",
      message: requestError instanceof Error ? requestError.message : "删除记录失败",
    };
    showDeleteConfirm.value = false;
  } finally {
    deleting.value = false;
  }
}
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- 顶部：返回按钮 + 日期 + 节日 + 干支日 + 装饰植物 -->
    <div class="relative shrink-0 px-4 pb-2 pt-3">
      <div class="flex items-center justify-between gap-3">
        <div class="flex min-w-0 items-center gap-2">
          <button
            type="button"
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#5C6B66] active:bg-[#EEF2EC] transition-colors"
            aria-label="返回日历"
            @click="router.push('/calendar')"
          >
            <BaseIcon name="caret-left" :size="20" />
          </button>
          <div class="min-w-0">
            <div class="flex items-baseline gap-1.5">
              <h1 class="text-[24px] font-semibold tracking-[-0.03em] text-[#1F2A2A]">
                {{ displayDate }}
              </h1>
              <span v-if="dateBadge.festivalName" class="shrink-0 text-[13px] font-semibold text-[#55B936]">
                {{ dateBadge.festivalName }}
              </span>
              <span v-else-if="dateBadge.jieQi" class="shrink-0 text-[13px] font-semibold text-[#55B936]">
                {{ dateBadge.jieQi }}
              </span>
            </div>
            <p class="mt-1 truncate text-[12px] text-[#82918B]">
              {{ dateBadge.lunarText }} · {{ displayWeekday }}
            </p>
          </div>
        </div>
        <!-- 右上角植物装饰：更轻、更透 -->
        <div class="pointer-events-none relative -mr-1 -mt-1 h-14 w-16 shrink-0">
          <svg viewBox="0 0 100 80" class="h-full w-full" aria-hidden="true">
            <defs>
              <radialGradient id="leafA" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#CBE8CE" stop-opacity="0.6" />
                <stop offset="100%" stop-color="#9CD3AE" stop-opacity="0.45" />
              </radialGradient>
              <radialGradient id="leafB" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#D8EED9" stop-opacity="0.55" />
                <stop offset="100%" stop-color="#A9DDBB" stop-opacity="0.4" />
              </radialGradient>
            </defs>
            <path
              d="M48 80 Q 52 50 58 20"
              stroke="#9CD3AE"
              stroke-width="1.2"
              fill="none"
              stroke-linecap="round"
              opacity="0.5"
            />
            <ellipse cx="42" cy="58" rx="10" ry="5" fill="url(#leafA)" transform="rotate(-30 42 58)" />
            <ellipse cx="62" cy="40" rx="11" ry="5.5" fill="url(#leafB)" transform="rotate(25 62 40)" />
            <ellipse cx="56" cy="22" rx="9" ry="4.5" fill="url(#leafA)" transform="rotate(15 56 22)" />
            <ellipse cx="74" cy="14" rx="6" ry="3.5" fill="url(#leafB)" transform="rotate(40 74 14)" />
            <ellipse cx="38" cy="36" rx="7" ry="3.5" fill="url(#leafB)" transform="rotate(-40 38 36)" />
          </svg>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto px-5 pb-5 pt-3">
      <div class="mb-3 flex items-center gap-2">
        <h2 class="text-[16px] font-semibold tracking-[-0.02em] text-[#1F2A2A]">当天记录</h2>
        <span class="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#EEF2EC] px-1.5 font-numeric text-[11px] font-semibold text-[#5C6B66]">
          {{ sortedRecords.length }}
        </span>
      </div>

      <StateBanner v-if="notice" :tone="notice.tone" :message="notice.message" class="mb-3" />

      <SectionCard v-if="loading" class="h-[220px] animate-pulse bg-white/70" />
      <EmptyState
        v-else-if="sortedRecords.length === 0"
        title="这天还没有记录"
        description="点底部按钮，补上一条已经发生的小事。"
      >
        <template #action>
          <button
            type="button"
            class="rounded-full bg-[#55B936] px-4 py-2 text-[13px] font-semibold text-white"
            @click="handleCreate"
          >
            新增记录
          </button>
        </template>
      </EmptyState>
      <div v-else class="flex flex-col gap-3">
        <SectionCard v-for="record in sortedRecords" :key="record.id" class="!rounded-[16px] !p-0">
          <div class="px-4 py-4">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <span
                    class="inline-block h-2 w-2 shrink-0 rounded-full"
                    :style="{ backgroundColor: record.tag?.color ?? '#AAB5B0' }"
                    aria-hidden="true"
                  />
                  <span v-if="record.startTime" class="shrink-0 font-numeric text-[15px] font-semibold tracking-[-0.02em] text-[#1F2A2A]">
                    {{ record.startTime }}
                  </span>
                  <h3 class="truncate text-[15px] font-semibold tracking-[-0.01em] text-[#1F2A2A]">
                    {{ record.title }}
                  </h3>
                </div>
                <div v-if="record.tag" class="mt-2">
                  <TagBadge :label="record.tag.name" :color="record.tag.color" compact />
                </div>
                <p v-if="record.note" class="mt-2 text-[13px] leading-6 text-[#5C6B66]">
                  {{ record.note }}
                </p>
              </div>
              <!-- 右侧操作按钮 -->
              <div class="flex shrink-0 items-center">
                <button
                  type="button"
                  class="flex h-8 w-8 items-center justify-center rounded-full text-[#82918B] active:bg-[#EEF2EC] transition-colors"
                  aria-label="编辑记录"
                  @click="handleEdit(record)"
                >
                  <BaseIcon name="pencil-simple" :size="16" />
                </button>
                <button
                  type="button"
                  class="flex h-8 w-8 items-center justify-center rounded-full text-[#82918B] active:bg-[#EEF2EC] transition-colors"
                  aria-label="复制记录"
                  @click="handleCopy(record)"
                >
                  <BaseIcon name="copy" :size="16" />
                </button>
                <div ref="menuRecordId === record.id ? menuRef : undefined" class="relative">
                  <button
                    type="button"
                    class="flex h-8 w-8 items-center justify-center rounded-full text-[#82918B] active:bg-[#EEF2EC] transition-colors"
                    aria-label="更多操作"
                    @click="menuRecordId = menuRecordId === record.id ? null : record.id"
                  >
                    <BaseIcon name="dots-three" :size="18" />
                  </button>
                  <div
                    v-if="menuRecordId === record.id"
                    class="absolute right-0 top-full z-30 mt-1 w-36 rounded-[12px] border border-[#E5F0DB] bg-white py-1 shadow-[0_8px_24px_rgba(47,94,34,0.12)]"
                  >
                    <button
                      type="button"
                      class="flex w-full items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-[#D85A5A] active:bg-[#FFF5F5]"
                      @click="handleMenuDelete(record)"
                    >
                      <BaseIcon name="trash" :size="15" />
                      删除记录
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>

    <div class="safe-pb shrink-0 px-5 pb-4">
      <button
        type="button"
        :disabled="isFull"
        :class="[
          'flex h-[50px] w-full items-center justify-center rounded-full text-[14px] font-semibold text-white shadow-[0_12px_24px_rgba(63,150,40,0.22)] transition-all',
          isFull ? 'cursor-not-allowed bg-[#C3CEC8] shadow-none' : 'bg-[#55B936] active:scale-[0.98]',
        ]"
        @click="handleCreate"
      >
        {{ isFull ? "当日记录已满（3条）" : "+  新增记录" }}
      </button>
    </div>

    <RecordEditor
      :key="`date-record-${showEditor ? `${editingRecord?.id ?? 'new'}-${draftRecord?.date ?? date}` : 'closed'}`"
      :open="showEditor"
      :initial-data="draftRecord"
      :tags="tags"
      :default-date="date"
      :saving="saving"
      :error-message="notice?.tone === 'error' ? notice.message : undefined"
      :mode="editorMode"
      @close="
        showEditor = false;
        editingRecord = null;
        draftRecord = undefined;
      "
      @save="handleSave"
      @delete="showDeleteConfirm = true"
    />

    <ConfirmSheet
      :open="showDeleteConfirm"
      title="删除这条记录？"
      description="删除后不会自动恢复，请确认这条记录已经不需要保留。"
      :loading="deleting"
      @confirm="void handleDelete()"
      @close="showDeleteConfirm = false"
    />
  </div>
</template>
