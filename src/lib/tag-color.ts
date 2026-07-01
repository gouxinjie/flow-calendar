/**
 * @description 标签颜色工具 — 渐变生成、亮度计算
 * @author gouxinjie
 * @created 2026-06-30
 */

/** RGB 颜色通道 */
interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** 将 hex 颜色转为 RGB 对象 */
function hexToRgb(hex: string): Rgb {
  return {
    r: Number.parseInt(hex.slice(1, 3), 16),
    g: Number.parseInt(hex.slice(3, 5), 16),
    b: Number.parseInt(hex.slice(5, 7), 16),
  };
}

/** 将 RGB 对象转为 hex 颜色 */
function rgbToHex(rgb: Rgb): string {
  const toHex = (c: number) => Math.round(Math.max(0, Math.min(255, c))).toString(16).padStart(2, "0");
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/** 混合两个颜色，ratio 为 target 的占比 (0-1) */
function mixColor(from: Rgb, to: Rgb, ratio: number): Rgb {
  return {
    r: Math.round(from.r * (1 - ratio) + to.r * ratio),
    g: Math.round(from.g * (1 - ratio) + to.g * ratio),
    b: Math.round(from.b * (1 - ratio) + to.b * ratio),
  };
}

/**
 * @description 根据标签颜色生成渐变 CSS 属性
 * 选中态：从亮色到基色的渐变 + 白字
 * 未选中态：浅透明渐变 + 基色字
 */
export function getTagButtonStyle(
  color: string,
  selected: boolean,
): { background: string; color: string } {
  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
    // 兜底：无效颜色使用中性灰
    return selected
      ? { background: "linear-gradient(135deg, #9CA0A8, #6B7A7A)", color: "#FFFFFF" }
      : { background: "linear-gradient(135deg, rgba(107,122,122,0.08), rgba(107,122,122,0.15))", color: "#6B7A7A" };
  }

  const base = hexToRgb(color);

  if (selected) {
    // 选中态：亮色→基色 135° 渐变
    const light = mixColor(base, { r: 255, g: 255, b: 255 }, 0.35);
    return {
      background: `linear-gradient(135deg, ${rgbToHex(light)}, ${color})`,
      color: "#FFFFFF",
    };
  }

  // 未选中态：浅透明渐变
  return {
    background: `linear-gradient(135deg, rgba(${base.r},${base.g},${base.b},0.08), rgba(${base.r},${base.g},${base.b},0.16))`,
    color,
  };
}

/**
 * @description 无标签/全部 中性按钮渐变样式
 */
export function getNeutralButtonStyle(selected: boolean): { background: string; color: string } {
  return selected
    ? { background: "linear-gradient(135deg, #9CA0A8, #6B7A7A)", color: "#FFFFFF" }
    : { background: "linear-gradient(135deg, rgba(107,122,122,0.06), rgba(107,122,122,0.12))", color: "#6B7A7A" };
}

/**
 * @description 日历单元格标签渐变样式（左右渐变，始终为实色+白字）
 * 有标签：亮色→基色 90° 渐变
 * 无标签：中性灰渐变
 */
export function getCalendarTagStyle(tagColor?: string): { background: string; color: string } {
  if (!tagColor || !/^#[0-9A-Fa-f]{6}$/.test(tagColor)) {
    return {
      background: "linear-gradient(90deg, #C8C5C5, #A8A8A8)",
      color: "#FFFFFF",
    };
  }

  const base = hexToRgb(tagColor);
  const light = mixColor(base, { r: 255, g: 255, b: 255 }, 0.3);

  return {
    background: `linear-gradient(90deg, ${rgbToHex(light)}, ${tagColor})`,
    color: "#FFFFFF",
  };
}
