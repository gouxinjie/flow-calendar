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

/** 播放动画：open 为 true 时入场，否则出场 */
function playAnimation(open: boolean) {
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
}

// 动画控制
// 使用 flush: "post" 让回调在 DOM 更新之后执行，此时 panelRef/shadeRef 已绑定。
// 若用默认 pre，则首次打开时面板刚因 mounted=true 而渲染、ref 尚未就绪，
// 会导致入场动画被跳过，面板停留在 translateY(100%)（屏幕底部），位置异常。
// 同时保留 nextTick 重试兜底，确保 ref 在任何调度顺序下都能就绪。
watch(
  () => [props.open, mounted.value] as const,
  async ([open, isMounted]) => {
    if (!isMounted) return;
    if (!panelRef.value || !shadeRef.value) {
      await nextTick();
      // await 期间 open 可能已被用户快速操作改变，直接返回，
      // 由下一次 watch 触发基于最新状态播放动画，避免过期快照导致动画错位。
      if (open !== props.open) return;
    }
    playAnimation(open);
  },
  { flush: "post" },
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
      <!-- 面板贴底显示，遮罩同时覆盖原底部导航栏区域，避免面板与屏幕底部之间留出大块遮罩空白 -->
      <div
        ref="panelRef"
        class="absolute left-0 right-0 z-10 max-h-[85vh] overflow-y-auto rounded-t-[24px] bg-[#FFFFFF]"
        style="
          bottom: 0;
          padding-bottom: env(safe-area-inset-bottom, 0px);
          box-shadow: 0 -12px 32px rgba(47, 94, 34, 0.12);
          transform: translateY(100%);
        "
      >
        <div
          class="sticky top-0 z-10 rounded-t-[24px] border-b border-[#EEF2EC] bg-[#FFFFFF]/96 px-5 pt-3 pb-4 backdrop-blur"
        >
          <div class="mx-auto mb-3 h-1 w-9 rounded-full bg-[#E2E7E0]" />
          <div class="flex items-center justify-between">
            <h2 class="text-[18px] font-semibold tracking-[-0.02em] text-[#1F2A2A]">
              {{ title }}
            </h2>
            <button
              class="flex h-8 w-8 items-center justify-center rounded-full text-[#82918B] transition-colors active:bg-[#F0F3EE]"
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
          class="safe-pb sticky bottom-0 border-t border-[#EEF2EC] bg-[#FFFFFF]/96 px-5 py-4 backdrop-blur"
        >
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
