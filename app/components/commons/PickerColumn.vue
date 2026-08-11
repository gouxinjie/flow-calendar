<script setup lang="ts">
/**
 * @component PickerColumn
 * @description 滚轮选择列，移动端时间选择器内部使用
 * @author gouxinjie
 * @created 2026-08-10
 */

const props = withDefaults(
  defineProps<{
    items: string[];
    selectedValue: string;
    label?: string;
    itemHeight?: number;
  }>(),
  {
    itemHeight: 40,
    label: "",
  },
);

const emit = defineEmits<{
  (e: "select", value: string): void;
}>();

const containerRef = ref<HTMLDivElement | null>(null);
let isScrolling = false;
let scrollTimer: ReturnType<typeof setTimeout> | null = null;

/** 顶部占位高度 */
const topPadding = props.itemHeight * 2;

/** 初始化滚动到选中项 */
onMounted(() => {
  scrollToSelected("instant");
});

watch(
  () => props.selectedValue,
  () => {
    if (!isScrolling) scrollToSelected("instant");
  },
);

/** 滚动到选中项 */
function scrollToSelected(behavior: ScrollBehavior) {
  const container = containerRef.value;
  if (!container) return;
  const idx = props.items.indexOf(props.selectedValue);
  if (idx === -1) return;
  const targetScroll = topPadding + idx * props.itemHeight - (container.clientHeight - props.itemHeight) / 2;
  container.scrollTo({
    top: Math.max(0, targetScroll),
    behavior: behavior as ScrollBehavior,
  });
}

/** 滚动结束，确定最近的选项并对齐 */
function handleScrollEnd() {
  const container = containerRef.value;
  if (!container) return;
  const centerY = container.scrollTop + container.clientHeight / 2;
  const idx = Math.round((centerY - topPadding) / props.itemHeight - 0.5);
  const clampedIdx = Math.max(0, Math.min(idx, props.items.length - 1));

  if (props.items[clampedIdx] !== props.selectedValue) {
    emit("select", props.items[clampedIdx]);
  }

  const targetScroll = topPadding + clampedIdx * props.itemHeight - (container.clientHeight - props.itemHeight) / 2;
  container.scrollTo({
    top: Math.max(0, targetScroll),
    behavior: "smooth",
  });
}

function handleTouchStart() {
  isScrolling = true;
  if (scrollTimer) clearTimeout(scrollTimer);
}

function handleTouchEnd() {
  scrollTimer = setTimeout(() => {
    isScrolling = false;
    handleScrollEnd();
  }, 150);
}

function handleScroll() {
  if (!isScrolling) {
    isScrolling = true;
    if (scrollTimer) clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      isScrolling = false;
      handleScrollEnd();
    }, 150);
  }
}
</script>

<template>
  <div class="relative flex-1">
    <div v-if="label" class="mb-2 text-center text-[11px] font-medium uppercase tracking-wider text-[#9BAE97]">
      {{ label }}
    </div>
    <div class="relative">
      <!-- 选中行高亮背景 -->
      <div
        class="pointer-events-none absolute left-1 right-1 z-0 rounded-[10px] bg-[#F3FAF7]/60"
        :style="{ top: 'calc(50% - ' + itemHeight / 2 + 'px)', height: itemHeight + 'px' }"
      />
      <div
        ref="containerRef"
        class="flex-1 overflow-y-auto scrollbar-none snap-y snap-mandatory"
        :style="{ height: itemHeight * 5 + 'px', scrollSnapType: 'y mandatory', WebkitOverflowScrolling: 'touch' }"
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd"
        @scroll="handleScroll"
      >
        <div :style="{ height: itemHeight * 2 + 'px' }" />
        <div
          v-for="item in items"
          :key="item"
          class="flex cursor-pointer select-none items-center justify-center snap-center transition-colors duration-150"
          :style="{ height: itemHeight + 'px' }"
          @click="emit('select', item)"
        >
          <span
            :class="[
              'text-[17px] transition-all duration-200',
              item === selectedValue ? 'scale-110 font-semibold text-[#1F2A2A]' : 'font-medium text-[#9BAE97]',
            ]"
          >
            {{ item }}
          </span>
        </div>
        <div :style="{ height: itemHeight * 2 + 'px' }" />
      </div>
    </div>
  </div>
</template>
