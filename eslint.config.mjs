import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt({
  rules: {
    // Nuxt/Vue 页面文件（index.vue、login.vue 等）允许单字组件名
    "vue/multi-word-component-names": "off",
    // HTML 空元素自闭合告警（Vue 模板约定，关闭噪音）
    "vue/html-self-closing": "off",
  },
});
