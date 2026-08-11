<script setup lang="ts">
/**
 * @component TimePicker
 * @description 滚轮式时间选择器，移动端 H5 优化，支持 24 小时制、5 分钟步长
 * @author gouxinjie
 * @created 2026-08-10
 */

/** 生成小时列表 00-23 */
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
/** 生成分钟列表 00-55，步长 5 */
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

const props = withDefaults(
  defineProps<{
    value: string;
    clearable?: boolean;
  }>(),
  {
    clearable: true,
  },
);

const emit = defineEmits<{
  (e: "update:value" | "change", value: string): void;
}>();

const open = ref(false);
const visible = ref(false);

/** 解析当前值 */
const currentHour = computed(() => (props.value ? props.value.split(":")[0] : ""));
const currentMinute = computed(() => (props.value ? props.value.split(":")[1] : ""));

/** 触发更新 */
function emitChange(value: string) {
  emit("update:value", value);
  emit("change", value);
}

/** 打开 */
function handleOpen() {
  open.value = true;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      visible.value = true;
    });
  });
}

/** 关闭（等动画结束移除 DOM） */
function handleClose() {
  visible.value = false;
  setTimeout(() => {
    open.value = false;
  }, 240);
}

/** 小时变更 */
function handleHourChange(hour: string) {
  const min = currentMinute.value || "00";
  emitChange(`${hour}:${min}`);
}

/** 分钟变更 */
function handleMinuteChange(minute: string) {
  const hour = currentHour.value || "00";
  emitChange(`${hour}:${minute}`);
}

/** 清除 */
function handleClear() {
  emitChange("");
  handleClose();
}

/** 确认 */
function handleConfirm() {
  handleClose();
}

const displayText = computed(() => props.value || "选择时间");
</script>

<template>
  <div>
    <!-- 触发器：点击展开 -->
    <button
      type="button"
      class="flex w-full items-center gap-2.5 rounded-[14px] border border-[#DCEAD2] px-4 py-3 text-left transition-colors duration-200"
      @click="handleOpen"
    >
      <BaseIcon name="clock" :size="18" :weight="props.value ? 'fill' : 'regular'" :class="props.value ? 'text-[#5EBF3F]' : 'text-[#9BAE97]'" />
      <span :class="['flex-1 text-[14px]', props.value ? 'text-[#1F2A2A]' : 'text-[#9BAE97]']">
        {{ displayText }}
      </span>
      <span
        v-if="props.value && props.clearable"
        class="flex h-6 w-6 items-center justify-center rounded-full text-[#9BAE97] hover:text-[#6B7A7A] active:bg-[#F4F9F1]"
        @click.stop="handleClear"
      >
        <BaseIcon name="x" :size="14" />
      </span>
    </button>

    <!-- 底部抽屉遮罩 -->
    <Teleport to="body">
      <div v-if="open" class="fixed inset-0 z-50 flex items-end justify-center">
        <div
          :class="[
            'absolute inset-0 bg-black/30 transition-opacity duration-[240ms]',
            visible ? 'opacity-100' : 'opacity-0',
          ]"
          @click="handleClose"
        />
        <div
          :class="[
            'relative w-full max-w-[480px] rounded-t-[20px] bg-white px-4 pb-8 pt-4 transition-transform duration-[240ms] ease-out shadow-[0_-8px_32px_rgba(18,46,40,0.12)]',
            visible ? 'translate-y-0' : 'translate-y-full',
          ]"
          @click.stop
        >
          <div class="mx-auto mb-3 h-1 w-10 rounded-full bg-[#DCEAD2]" />
          <p class="mb-4 text-center text-[15px] font-semibold text-[#1F2A2A]">选择时间</p>
          <div class="relative flex gap-3">
            <PickerColumn :items="HOURS" :selected-value="currentHour" label="时" @select="handleHourChange" />
            <div class="flex items-center pt-5">
              <span class="text-[20px] font-semibold text-[#1F2A2A]">:</span>
            </div>
            <PickerColumn :items="MINUTES" :selected-value="currentMinute" label="分" @select="handleMinuteChange" />
          </div>
          <div class="mt-4 flex gap-3">
            <button
              type="button"
              class="flex-1 rounded-[14px] border border-[#DCEAD2] py-3 text-[14px] font-medium text-[#9BAE97] active:bg-[#F3FAF7]"
              @click="handleClear"
            >
              清除
            </button>
            <button
              type="button"
              class="flex-1 rounded-[14px] bg-[#5EBF3F] py-3 text-[14px] font-semibold text-white active:opacity-80"
              @click="handleConfirm"
            >
              确定
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
