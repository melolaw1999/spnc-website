import { describe, expect, it } from "vitest";
import { mobileMotionChapterAt, mobileMotionTarget, mobileSkyRange, motionChapters } from "@/lib/product-motion";

describe("手机新增穿云后保留原商品章节导航", () => {
  it("四个导航目标分别落在对应章节，欧福仍在 ON 穿云之后", () => {
    const chapters = [motionChapters.intro, motionChapters.on, motionChapters.sky, motionChapters.ovodan];
    const targets = chapters.map(mobileMotionTarget);
    expect([...targets].sort((a,b)=>a-b)).toEqual(targets);
    for (const chapter of chapters) expect(mobileMotionChapterAt(mobileMotionTarget(chapter))).toBe(chapter);
  });
  it("穿云区间进入/离开准确，范围外不会把隐藏 ON 拖动层当成穿云控制", () => {
    expect(mobileMotionChapterAt(mobileSkyRange[0]-.001)).toBe(motionChapters.on);
    expect(mobileMotionChapterAt(mobileSkyRange[0])).toBe(motionChapters.sky);
    expect(mobileMotionChapterAt(mobileSkyRange[1]-.001)).toBe(motionChapters.sky);
    expect(mobileMotionChapterAt(mobileSkyRange[1])).toBe(motionChapters.ovodan);
  });
});
