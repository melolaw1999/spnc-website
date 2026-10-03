import { describe, expect, it } from "vitest";
import { initialOnInspection, isOnInspecting, onInspectionReducer, shouldRotateOnInspection } from "../../src/lib/on-inspection";

const playing = { ...initialOnInspection, playing: true };

describe("ON包装细看与播放意图", () => {
  it("悬停和键盘聚焦均暂时暂停，全部离开后才恢复", () => {
    let state = onInspectionReducer(playing, { type: "hover", value: true });
    state = onInspectionReducer(state, { type: "focus", value: true });
    expect(isOnInspecting(state)).toBe(true);
    expect(shouldRotateOnInspection(state)).toBe(false);
    state = onInspectionReducer(state, { type: "hover", value: false });
    expect(shouldRotateOnInspection(state)).toBe(false);
    state = onInspectionReducer(state, { type: "focus", value: false });
    expect(shouldRotateOnInspection(state)).toBe(true);
  });

  it("拖动后即使离开悬停或关闭细看，也不会恢复自动旋转", () => {
    for (const expanded of [false, true]) {
      let state = onInspectionReducer(playing, expanded ? { type: "open" } : { type: "hover", value: true });
      state = onInspectionReducer(state, { type: "manual" });
      state = onInspectionReducer(state, { type: "hover", value: false });
      state = onInspectionReducer(state, { type: "close" });
      expect(state.playing).toBe(false);
      expect(shouldRotateOnInspection(state)).toBe(false);
    }
  });

  it("打开与关闭模态保留原播放意图，不自动启动原本暂停的样品", () => {
    for (const wasPlaying of [false, true]) {
      let state = onInspectionReducer({ ...initialOnInspection, playing: wasPlaying }, { type: "open" });
      expect(state.expanded).toBe(true);
      expect(shouldRotateOnInspection(state)).toBe(false);
      state = onInspectionReducer(state, { type: "close" });
      expect(state.expanded).toBe(false);
      expect(shouldRotateOnInspection(state)).toBe(wasPlaying);
    }
  });

  it("减少动效或失去三维画面主动停止后，关闭细看不会重启", () => {
    let state = onInspectionReducer(playing, { type: "open" });
    state = onInspectionReducer(state, { type: "manual" });
    state = onInspectionReducer(state, { type: "close" });
    expect(shouldRotateOnInspection(state)).toBe(false);
    state = onInspectionReducer(state, { type: "play", value: true });
    expect(shouldRotateOnInspection(state)).toBe(true);
  });
});
