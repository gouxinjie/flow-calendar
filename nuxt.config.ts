import { defineNuxtConfig } from "nuxt/config";

/**
 * @description 青柠日历 Nuxt 3 配置
 * @author gouxinjie
 * @created 2026-08-10
 */
export default defineNuxtConfig({
  compatibilityDate: "2025-07-01",

  // 显式指定源码目录为 app/
  // 让 Nuxt 3 识别 app/ 下的 app.vue、pages/、components/、layouts/ 等
  srcDir: "app/",

  // Nitro 服务端目录保持在项目根 server/（不受 srcDir 影响）
  serverDir: "server/",

  // 禁用 app manifest（payload 预加载），避免 srcDir 模式下 #app-manifest 虚拟模块缺失
  appManifest: false,

  devtools: { enabled: true },

  ssr: true,

  // 运行时环境变量（构建时间戳）
  runtimeConfig: {
    public: {
      buildTime: process.env.NUXT_PUBLIC_BUILD_TIME ?? "unknown",
    },
  },

  // CSS 与 Tailwind v4
  css: ["~/assets/css/global.css"],

  postcss: {
    plugins: {
      "@tailwindcss/postcss": {},
    },
  },

  // 模块
  modules: ["@nuxt/eslint"],

  // 组件自动导入：声明子目录组件使用短名（不带目录前缀）
  // 模板中直接用 <AppCanvas>、<AuthGuard>、<StateBanner> 等
  components: [
    {
      path: "~/components",
      pathPrefix: false,
    },
  ],

  // 路径别名 @/ 指向 srcDir（已通过 srcDir 设置），无需重复声明

  // 构建输出为 Node 服务器（PM2 部署）
  nitro: {
    preset: "node-server",
    errorHandler: "server/error.ts",
  },

  // 应用标题
  app: {
    head: {
      title: "Lime Calendar | 青柠日历",
      htmlAttrs: { lang: "zh-CN" },
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      ],
      meta: [
        {
          name: "description",
          content: "面向手机浏览器的月历式生活记录产品，用月历留住已经发生的事。",
        },
        { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" },
      ],
    },
  },

  // TypeScript 严格模式
  typescript: {
    strict: true,
  },
});
