import { describe, expect, it } from "vitest";
import { galleryPosition, isHorizontalDrag, normalizeDegrees } from "@/lib/product-gallery";

describe("产品画廊", () => {
  it("多圈旋转仍保持同一位置，跨越一圈不跳变", () => {
    expect(galleryPosition(36, 1200)).toEqual(galleryPosition(756, 1200));
    expect(normalizeDegrees(-721)).toBe(-1);
    expect(Math.abs(galleryPosition(359.9, 1200).x - galleryPosition(0.1, 1200).x)).toBeLessThan(3);
  });

  it("保留两侧近、中央远的空间弧线，并隐藏前半环避免挡住标题和说明", () => {
    const center = galleryPosition(0, 1200);
    const side = galleryPosition(80, 1200);
    expect(center.x).toBe(0);
    expect(center.z).toBeLessThan(side.z);
    expect(center.opacity).toBe(1);
    expect(galleryPosition(180, 1200).opacity).toBe(0);
    expect(galleryPosition(105, 1200).opacity).toBeGreaterThan(0);
    expect(galleryPosition(105, 1200).opacity).toBeLessThan(1);
  });

  it("窄屏减小纵深，左右位置保持对称", () => {
    expect(Math.abs(galleryPosition(0, 320).z)).toBeLessThan(Math.abs(galleryPosition(0, 1440).z));
    expect(galleryPosition(-60, 390).x).toBeCloseTo(-galleryPosition(60, 390).x);
  });

  it("只认明确的横向拖动，轻触、竖向滚动和斜向滚动不启动画廊", () => {
    expect(isHorizontalDrag(4, 0)).toBe(false);
    expect(isHorizontalDrag(20, 40)).toBe(false);
    expect(isHorizontalDrag(20, 19)).toBe(false);
    expect(isHorizontalDrag(50, 10)).toBe(true);
    expect(isHorizontalDrag(-50, 10)).toBe(true);
  });
});
