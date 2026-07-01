/**
 * @page LoginPage
 * @description 登录页服务端入口，纯渲染登录表单
 * 不做服务端鉴权和自动跳转，所有逻辑由 LoginPageClient 客户端处理。
 * @author gouxinjie
 * @created 2026-06-22
 * @updated 2026-07-01
 */
import { LoginPageClient } from "./login-page-client";

export default function LoginPage() {
  return <LoginPageClient />;
}
