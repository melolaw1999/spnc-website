import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { onChocolateLabel } from "@/data/on-chocolate-label";
import { chocolateLabelArc, chocolateLabelHeight, chocolateLabelRadius, chocolateLabelStart, createChocolateLabelGeometry } from "@/lib/on-chocolate-geometry";

describe("巧克力74份原始展开稿", () => {
  it("保持审核后的完整栅格化原稿字节，不混入香草标签", () => {
    expect(createHash("sha256").update(readFileSync(`public${onChocolateLabel.texture}`)).digest("hex")).toBe(onChocolateLabel.textureSha256);
    expect(onChocolateLabel.servings).toBe(74);
    expect(onChocolateLabel.barcode).toBe("748927028669");
  });
  it("用原稿长宽比铺设圆柱，标签不重复、镜像或任意拉伸", () => {
    expect(chocolateLabelArc).toBeLessThan(Math.PI*2);
    expect(chocolateLabelArc*chocolateLabelRadius/chocolateLabelHeight).toBeCloseTo(1534.5/378);
    expect(chocolateLabelStart+chocolateLabelArc*onChocolateLabel.frontU).toBeCloseTo(0);
    const geometry=createChocolateLabelGeometry(); const uv=geometry.getAttribute("uv");
    expect(uv.getX(0)).toBe(0);expect(uv.getY(0)).toBe(1);
    expect(uv.getX(160)).toBe(1);expect(uv.getY(uv.count-1)).toBe(0);
    geometry.dispose();
  });
});
