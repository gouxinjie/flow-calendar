<script setup lang="ts">
/**
 * @component BottomSheet
 * @description 通用底部抽屉组件，使用 Web Animations API 控制入场/出场动画
 * @author gouxinjie
 * @created 2026-08-10
 */

const props = defineProps<{
  open: boolean;
  title: string;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

/** 动画时长 ms */
const DURATION = 240;

const mounted = ref(false);
const shadeRef = ref<HTMLDivElement | null>(null);
const panelRef = ref<HTMLDivElement | null>(null);

// 控制 body 滚动锁定
watch(
  () => props.open,
  (val) => {
    if (val) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
  },
);

onBeforeUnmount(() => {
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
});

// 打开时挂载 DOM
watch(
  () => props.open,
  (val) => {
    if (val) mounted.value = true;
  },
);

// 动画控制
watch(
  () => [props.open, mounted.value] as const,
  ([open, isMounted]) => {
    if (!isMounted) return;
    const panel = panelRef.value;
    const shade = shadeRef.value;
    if (!panel || !shade) return;

    // 取消所有进行中的动画
    panel.getAnimations().forEach((a) => a.cancel());
    shade.getAnimations().forEach((a) => a.cancel());

    if (open) {
      // 入场：从下方滑入 + 淡入
      panel.animate(
        { transform: ["translateY(100%)", "translateY(0)"] },
        { duration: DURATION, easing: "ease-out", fill: "forwards" },
      );
      shade.animate(
        { opacity: [0, 1] },
        { duration: DURATION, easing: "ease-out", fill: "forwards" },
      );
    } else {
      // 出场：滑出 + 淡出，动画完成后卸载
      const panelAnim = panel.animate(
        { transform: ["translateY(0)", "translateY(100%)"] },
        { duration: DURATION, easing: "ease-in", fill: "forwards" },
      );
      shade.animate(
        { opacity: [1, 0] },
        { duration: DURATION, easing: "ease-in", fill: "forwards" },
      );
      panelAnim.onfinish = () => {
        mounted.value = false;
      };
    }
  },
);
</script>

<template>
  <Teleport to="body">
    <div v-if="mounted" class="fixed inset-0 z-50">
      <div
        ref="shadeRef"
        class="absolute inset-0 bg-black/30 backdrop-blur-sm"
        style="opacity: 0"
        @click="emit('close')"
      />
      <!-- 面板底部预留导航栏高度，避免遮挡底部导航 -->
      <div
        ref="panelRef"
        class="absolute left-0 right-0 z-10 max-h-[85vh] overflow-y-auto rounded-t-[28px] bg-[#FCFEFA]"
        style="
          bottom: calc(72px + env(safe-area-inset-bottom, 0px));
          box-shadow: 0 -18px 40px rgba(45, 76, 70, 0.14);
          transform: translateY(100%);
        "
      >
        <div
          class="sticky top-0 z-10 rounded-t-[28px] border-b border-[#E0ECD7] bg-[#FCFEFA]/96 px-5 py-4 backdrop-blur"
        >
          <div class="mx-auto mb-3 h-1.5 w-12 rounded-full bg-[#D9E8E3]" />
          <div class="flex items-center justify-between">
            <h2 class="text-[18px] font-semibold tracking-[-0.02em] text-[#1F2A2A]">
              {{ title }}
            </h2>
            <button
              class="flex h-8 w-8 items-center justify-center rounded-full text-[#6B7A7A] active:bg-[#F4F9F1]"
              aria-label="关闭"
              @click="emit('close')"
            >
              <BaseIcon name="x" :size="18" />
            </button>
          </div>
        </div>

        <div class="px-5 py-4">
          <slot />
        </div>

        <div
          v-if="$slots.footer"
          class="safe-pb sticky bottom-0 border-t border-[#E0ECD7] bg-[#FCFEFA]/96 px-5 py-4 backdrop-blur"
        >
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
