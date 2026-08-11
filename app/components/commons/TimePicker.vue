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
      class="flex w-full items-center gap-2.5 rounded-[12px] border border-[#E5F0DB] px-4 py-3 text-left transition-colors duration-200"
      @click="handleOpen"
    >
      <BaseIcon name="clock" :size="18" :weight="props.value ? 'fill' : 'regular'" :class="props.value ? 'text-[#55B936]' : 'text-[#AAB5B0]'" />
      <span :class="['flex-1 text-[14px]', props.value ? 'text-[#1F2A2A]' : 'text-[#AAB5B0]']">
        {{ displayText }}
      </span>
      <span
        v-if="props.value && props.clearable"
        class="flex h-6 w-6 items-center justify-center rounded-full text-[#AAB5B0] hover:text-[#5C6B66] active:bg-[#EEF2EC]"
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
            'relative w-full max-w-[480px] rounded-t-[20px] bg-white px-4 pb-8 pt-4 transition-transform duration-[240ms] ease-out shadow-[0_-12px_32px_rgba(47,94,34,0.12)]',
            visible ? 'translate-y-0' : 'translate-y-full',
          ]"
          @click.stop
        >
          <div class="mx-auto mb-3 h-1 w-9 rounded-full bg-[#DDE7D4]" />
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
              class="flex-1 rounded-full border border-[#E5F0DB] py-3 text-[14px] font-medium text-[#AAB5B0] transition-colors active:bg-[#F6FBF3]"
              @click="handleClear"
            >
              清除
            </button>
            <button
              type="button"
              class="flex-1 rounded-full bg-[#55B936] py-3 text-[14px] font-semibold text-white transition-all active:scale-[0.98]"
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
