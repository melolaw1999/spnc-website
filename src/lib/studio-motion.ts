// 以章节自身的可滚动距离归一化；动态地址栏不参与画框高度。
export const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
export const smooth = (n: number) => { const t = clamp01(n); return t * t * (3 - 2 * t); };
export function sectionProgress(top: number, height: number, frame: number, header: number) {
  return clamp01((header - top) / Math.max(1, height - frame));
}
export function ovodanPose(progress: number, secondary = false) {
  const enter = smooth(progress / .65);
  return secondary
    ? { x: .72 - .12 * enter, y: .10 - .38 * enter, z: -.8 + .25 * enter, tilt: .15 - .12 * enter, yaw: -.30 + .22 * enter, scale: .87 }
    : { x: -.65 + .24 * enter, y: .24 * (1 - enter), z: .15 + .30 * enter, tilt: -.16 + .14 * enter, yaw: .40 * (1 - enter), scale: 1 };
}
