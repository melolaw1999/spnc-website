import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initialMotionLoadState, motionLoadReducer, watchMotionLoading } from "@/lib/product-motion";

class Visibility extends EventTarget {
  hidden = false;
  change(hidden: boolean) { this.hidden = hidden; this.dispatchEvent(new Event("visibilitychange")); }
}

describe("隐藏页面与慢加载恢复", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("可见时加载5秒再隐藏一分钟，返回后仍有完整等待时间并可就绪", () => {
    const visibility = new Visibility();
    let state = initialMotionLoadState;
    const onSlow = vi.fn(() => { state = motionLoadReducer(state, "slow"); });
    const stop = watchMotionLoading(visibility, onSlow);
    vi.advanceTimersByTime(5000);
    visibility.change(true);
    vi.advanceTimersByTime(60000);
    expect(onSlow).not.toHaveBeenCalled();
    expect(state.failed).toBe(false);
    visibility.change(false);
    vi.advanceTimersByTime(11000);
    expect(onSlow).not.toHaveBeenCalled();
    state = motionLoadReducer(state, "ready");
    stop();
    vi.advanceTimersByTime(60000);
    expect(state).toEqual({ loaded: true, failed: false, delayed: false });
    expect(onSlow).not.toHaveBeenCalled();
  });

  it("页面最初就在后台时不超时，返回后才开始等待", () => {
    const visibility = new Visibility(); visibility.hidden = true;
    const onSlow = vi.fn();
    const stop = watchMotionLoading(visibility, onSlow);
    vi.advanceTimersByTime(120000);
    expect(onSlow).not.toHaveBeenCalled();
    visibility.change(false);
    vi.advanceTimersByTime(11999);
    expect(onSlow).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onSlow).toHaveBeenCalledOnce();
    stop();
  });

  it("超过可见等待时间仍保留加载，较晚就绪能够恢复增强展示", () => {
    const visibility = new Visibility();
    let state = initialMotionLoadState;
    const stop = watchMotionLoading(visibility, () => { state = motionLoadReducer(state, "slow"); });
    vi.advanceTimersByTime(30000);
    expect(state).toEqual({ loaded: false, failed: false, delayed: true });
    // failed=false使实际组件保留Canvas；loaded=false保留静态图与入口。
    state = motionLoadReducer(state, "ready");
    expect(state).toEqual({ loaded: true, failed: false, delayed: false });
    stop();
  });

  it("真正的媒体/渲染失败仍降级，不会被迟到的就绪回调覆盖", () => {
    const failure = motionLoadReducer(initialMotionLoadState, "failed");
    expect(motionLoadReducer(failure, "ready")).toEqual({ loaded: false, failed: true, delayed: false });
    expect(motionLoadReducer(failure, "slow")).toEqual(failure);
  });

  it("组件卸载后不保留计时器或可见性监听", () => {
    const visibility = new Visibility();
    const onSlow = vi.fn();
    const stop = watchMotionLoading(visibility, onSlow);
    stop(); visibility.change(true); visibility.change(false);
    vi.advanceTimersByTime(30000);
    expect(onSlow).not.toHaveBeenCalled();
  });
});
