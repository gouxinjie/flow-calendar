/**
 * @description 简易 classnames 工具 - 合并条件类名
 * @author gouxinjie
 * @created 2026-08-10
 */
export function cn(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}
