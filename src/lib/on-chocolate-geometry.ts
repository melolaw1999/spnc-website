import { CylinderGeometry } from "three";
import { onChocolateLabel } from "@/data/on-chocolate-label";
import { onTub } from "./on-label-projection";

export const chocolateLabelHeight = onTub.labelTop - onTub.labelBottom;
export const chocolateLabelRadius = onTub.radius + .002;
// 按原稿宽高比铺设，不把展开稿拉满/压缩到人为指定的环长。
export const chocolateLabelArc = chocolateLabelHeight * onChocolateLabel.pageWidthPoints / onChocolateLabel.pageHeightPoints / chocolateLabelRadius;
export const chocolateLabelStart = -chocolateLabelArc * onChocolateLabel.frontU;

export function createChocolateLabelGeometry() {
  const geometry = new CylinderGeometry(chocolateLabelRadius, chocolateLabelRadius, chocolateLabelHeight, 160, 1, true, chocolateLabelStart, chocolateLabelArc);
  geometry.translate(0, (onTub.labelTop + onTub.labelBottom) / 2, 0);
  return geometry;
}
