import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { onLabelViews } from "@/data/on-labels";
import { onLabelPhotoUv, onLabelViewAt, onTub } from "@/lib/on-label-projection";

describe("ON真实包装来源与曲面映射", () => {
  it("八个角度的源文件字节与核验包一致，不混用旧版或不同口味", () => {
    expect(onLabelViews).toHaveLength(8);
    for (const view of onLabelViews) expect(createHash("sha256").update(readFileSync(`public${view.image}`)).digest("hex")).toBe(view.sha256);
  });
  it("转到来源角度时，取该视角最清晰的中心列和真实标签上下缘", () => {
    for (let i=0;i<8;i++) {
      const a=-i*Math.PI/4, x=onTub.radius*Math.sin(a), z=onTub.radius*Math.cos(a);
      expect(onLabelPhotoUv(x,onTub.labelTop,z,i).u).toBeCloseTo(.5);
      expect(onLabelPhotoUv(x,onTub.labelTop,z,i).v).toBeCloseTo(1-600/1600);
      expect(onLabelPhotoUv(x,onTub.labelBottom,z,i).v).toBeCloseTo(1-1360/1600);
    }
  });
  it("任意周向及标签高度都落在真实图片内部，避开白底", () => {
    for(let degree=-360;degree<=720;degree++) for(const y of [onTub.labelBottom,0,onTub.labelTop]) {
      const a=degree*Math.PI/180;
      const uv=onLabelPhotoUv(onTub.radius*Math.sin(a),y,onTub.radius*Math.cos(a),onLabelViewAt(degree));
      expect(uv.u).toBeGreaterThan(.21);expect(uv.u).toBeLessThan(.79);
      expect(uv.v).toBeGreaterThan(.14);expect(uv.v).toBeLessThan(.65);
    }
  });
  it("正面文字、营养表与条码各自保持连续照片，接缝不横穿正面标识", () => {
    for (let angle=-59;angle<60;angle++) expect(onLabelViewAt(angle)).toBe(0);
    expect(onLabelViewAt(90)).toBe(6);
    expect(onLabelViewAt(135)).toBe(5);
    expect(onLabelViewAt(180)).toBe(4);
  });
});
