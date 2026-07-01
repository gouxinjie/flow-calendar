/**
 * @page HomePage
 * @description 根路由入口，纯服务端重定向到月历页
 * 不在 / 路由执行任何客户端 JS，避免夸克浏览器并行加载时产生竞态重定向。
 * 鉴权由 AuthGuard 在 /calendar 路由上完成。
 * @author gouxinjie
 * @created 2026-06-22
 * @updated 2026-07-01
 */
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/calendar");
}
