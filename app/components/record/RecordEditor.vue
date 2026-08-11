<script setup lang="ts">
/**
 * @component RecordEditor
 * @description 新增/编辑/复制记录弹层
 * @author gouxinjie
 * @created 2026-08-10
 */

import type { ActivityTag, RecordFormData } from "@/types/models";
import { getTagButtonStyle } from "@/utils/tag-color";

const props = withDefaults(
  defineProps<{
    open: boolean;
    initialData?: RecordFormData;
    tags: ActivityTag[];
    defaultDate: string;
    saving?: boolean;
    errorMessage?: string;
    /** 编辑器模式 */
    mode?: "create" | "edit" | "copy";
  }>(),
  {
    initialData: undefined,
    saving: false,
    errorMessage: "",
    mode: "create",
  },
);

const emit = defineEmits<{
  (e: "close" | "delete"): void;
  (e: "save", data: RecordFormData): void;
}>();

const title = ref(props.initialData?.title ?? "");
const tagId = ref<string | undefined>(props.initialData?.tagId || undefined);
const startTime = ref(props.initialData?.startTime ?? "");
const note = ref(props.initialData?.note ?? "");
const localError = ref("");

const isEdit = computed(() => props.mode === "edit");
const isCopy = computed(() => props.mode === "copy");
const editorTitle = computed(() => (isEdit.value ? "编辑记录" : isCopy.value ? "复制记录" : "新增记录"));

/** 保存 */
function handleSave() {
  localError.value = "";
  if (!title.value.trim()) return;
  if (props.saving) return;

  emit("save", {
    title: title.value.trim(),
    tagId: tagId.value,
    startTime: startTime.value || undefined,
    date: props.defaultDate,
    note: note.value.trim() || undefined,
  });
}
</script>

<template>
  <BottomSheet :open="open" :title="editorTitle" @close="emit('close')">
    <div class="flex flex-col gap-4">
      <div
        v-if="errorMessage || localError"
        class="rounded-[14px] border border-[#F2C0C0] bg-[#FFF5F5] px-4 py-3 text-[13px] text-[#D85A5A]"
      >
        {{ localError || errorMessage }}
      </div>

      <div>
        <label class="mb-1.5 block text-[13px] font-medium text-[#6B7A7A]">记录标题 *</label>
        <input
          v-model="title"
          type="text"
          placeholder="做了什么？"
          maxlength="50"
          class="w-full rounded-[14px] border border-[#DCEAD2] px-4 py-3 text-[14px] text-[#1F2A2A] placeholder-[#9BAE97] outline-none focus:border-[#5EBF3F]"
        />
      </div>

      <div>
        <label class="mb-1.5 block text-[13px] font-medium text-[#6B7A7A]">开始时间（可选）</label>
        <TimePicker v-model:value="startTime" />
      </div>

      <div>
        <label class="mb-1.5 block text-[13px] font-medium text-[#6B7A7A]">标签</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="tag in tags.filter((t) => t.enabled)"
            :key="tag.id"
            type="button"
            class="rounded-[6px] px-4 py-1.5 text-[13px] font-medium transition-opacity active:opacity-80"
            :style="getTagButtonStyle(tag.color, tagId === tag.id)"
            @click="tagId = tag.id"
          >
            {{ tag.name }}
          </button>
        </div>
      </div>

      <div>
        <label class="mb-1.5 block text-[13px] font-medium text-[#6B7A7A]">备注（可选）</label>
        <textarea
          v-model="note"
          placeholder="补充一些细节…"
          maxlength="200"
          rows="3"
          class="w-full resize-none rounded-[14px] border border-[#DCEAD2] px-4 py-3 text-[14px] text-[#1F2A2A] placeholder-[#9BAE97] outline-none focus:border-[#5EBF3F]"
        />
      </div>
    </div>
    <template #footer>
      <div class="flex gap-3">
        <button
          v-if="isEdit"
          type="button"
          class="flex h-[48px] shrink-0 items-center justify-center gap-1.5 rounded-[16px] border border-[#E06060] px-5 text-[14px] font-medium text-[#E06060] transition-colors duration-200 active:border-[#D85A5A] active:bg-[#FFF5F5] active:text-[#D85A5A]"
          @click="emit('delete')"
        >
          <BaseIcon name="trash" :size="18" />
          删除
        </button>
        <button
          type="button"
          :disabled="!title.trim() || saving"
          :class="[
            'flex h-[48px] flex-1 items-center justify-center rounded-[14px] text-[14px] font-semibold text-white transition-opacity',
            title.trim() && !saving ? 'bg-[#5EBF3F] active:opacity-80' : 'cursor-not-allowed bg-[#9BAE97]',
          ]"
          @click="handleSave"
        >
          {{ saving ? "保存中…" : "保存" }}
        </button>
      </div>
    </template>
  </BottomSheet>
</template>
