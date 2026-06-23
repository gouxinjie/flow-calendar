/**
 * @page LoginPage
 * @description 登录页服务端入口，负责渲染登录表单
 * @author gouxinjie
 * @created 2026-06-22
 * @updated 2026-06-23
 */
import { LoginPageClient } from "./login-page-client";

export default async function LoginPage() {
  return <LoginPageClient />;
}
