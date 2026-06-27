/**
 * @page HomePage
 * @description 根路由入口，根据登录状态重定向到月历页或登录页
 * 使用客户端组件做判断，避免夸克浏览器 RSC 请求中 Cookie 缺失导致误判
 * @author gouxinjie
 * @created 2026-06-22
 * @updated 2026-06-26
 */
import { HomeRedirect } from "./home-redirect";

export default function Home() {
  return <HomeRedirect />;
}
