import { describe, expect, it } from "vitest";
import { ovodanPose, sectionProgress } from "@/lib/studio-motion";

describe("手机章节滚动与欧福实体路径", () => {
  it("短屏、长屏与高度变化后首尾仍对应当前章节边界", () => {
    for (const frame of [550,595,772,928]) {
      const height=frame*1.85;
      expect(sectionProgress(72,height,frame,72)).toBe(0);
      expect(sectionProgress(72-(height-frame)/2,height,frame,72)).toBeCloseTo(.5);
      expect(sectionProgress(72-(height-frame),height,frame,72)).toBe(1);
      expect(sectionProgress(1000,height,frame,72)).toBe(0);
      expect(sectionProgress(-10000,height,frame,72)).toBe(1);
    }
  });
  it("主副瓶都改变实际位置、纵深、倾角，末段稳定且不连续转圈", () => {
    for (const secondary of [false,true]) {
      const a=ovodanPose(0,secondary),b=ovodanPose(1,secondary);
      expect(a.x).not.toBe(b.x);expect(a.z).not.toBe(b.z);expect(a.tilt).not.toBe(b.tilt);
      expect(Math.abs(a.yaw-b.yaw)).toBeLessThan(Math.PI/2);
      expect(ovodanPose(.8,secondary)).toEqual(b);
      for(let p=0;p<=1;p+=.01) for(const n of Object.values(ovodanPose(p,secondary))) expect(Number.isFinite(n)).toBe(true);
    }
  });
});
