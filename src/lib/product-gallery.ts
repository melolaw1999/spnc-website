/** 环形位置与手势判定共用规则，不包含商品或交易逻辑。 */
export const normalizeDegrees = (angle: number) => ((angle + 180) % 360 + 360) % 360 - 180;

export function galleryPosition(angle: number, width: number) {
  const degrees = normalizeDegrees(angle);
  const radians = degrees * Math.PI / 180;
  const radius = Math.max(240, Math.min(width * 0.55, 760));
  const depth = Math.min(width * 0.62, 740);
  return {
    x: Math.sin(radians) * radius,
    z: -Math.cos(radians) * depth,
    rotate: -degrees * 0.5,
    opacity: Math.max(0, Math.min(1, (112 - Math.abs(degrees)) / 16)),
    order: Math.round((1 - Math.cos(radians)) * 100),
  };
}

export function isHorizontalDrag(x: number, y: number) {
  return Math.abs(x) > 8 && Math.abs(x) > Math.abs(y) * 1.2;
}
