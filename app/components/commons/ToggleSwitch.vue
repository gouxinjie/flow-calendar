<script setup lang="ts">
/**
 * @component ToggleSwitch
 * @description 移动端开关组件（替代 Radix Switch）
 * @author gouxinjie
 * @created 2026-08-10
 */

const props = withDefaults(
  defineProps<{
    checked: boolean;
    disabled?: boolean;
    ariaLabel: string;
  }>(),
  {
    disabled: false,
  },
);

const emit = defineEmits<{
  (e: "update:checked" | "change", value: boolean): void;
}>();

/** 切换开关 */
function handleChange() {
  const next = !props.checked;
  emit("update:checked", next);
  emit("change", next);
}
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="props.checked"
    :aria-label="props.ariaLabel"
    :disabled="props.disabled"
    :class="[
      'relative h-7 w-12 shrink-0 rounded-full border transition-colors duration-200 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[#CBE9C0] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60',
      props.checked
        ? 'border-[#2F8E2E] bg-[#55B936]'
        : 'border-[#D8DADF] bg-[#D8DADF]',
    ]"
    @click="handleChange"
  >
    <span
      :class="[
        'block h-6 w-6 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.22)] transition-transform duration-200 ease-out will-change-transform',
        props.checked ? 'translate-x-[22px]' : 'translate-x-[2px]',
      ]"
    />
  </button>
</template>
