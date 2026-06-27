/**
 * @page LoginPage
 * @description 登录页服务端入口，负责渲染登录表单
 * 夸克浏览器在 RSC 请求中可能不携带 Cookie，
 * 因此服务端不再做 getUserId() 鉴权 redirect，
 * 改为纯渲染客户端组件，由客户端读取 Cookie 后自行跳转。
 * @author gouxinjie
 * @created 2026-06-22
 * @updated 2026-06-26
 */
import { LoginPageClient } from "./login-page-client";

export default function LoginPage() {
  return <LoginPageClient />;
}
