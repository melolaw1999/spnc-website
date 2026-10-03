import { describe, expect, it, vi } from "vitest";
import { jumpToPageTop, watchBackToTopVisibility } from "@/lib/back-to-top";

class Media extends EventTarget {
  matches = true;
  change(matches: boolean) { this.matches = matches; this.dispatchEvent(new Event("change")); }
}
class Observer {
  static current: Observer | undefined;
  active = false;
  constructor(private callback: () => void) { Observer.current = this; }
  observe() { this.active = true; }
  disconnect() { this.active = false; }
  notify() { if (this.active) this.callback(); }
}
class View extends EventTarget {
  scrollY = 900;
  innerHeight = 844;
  media = new Media();
  MutationObserver = Observer;
  matchMedia() { return this.media; }
}
function setup(withHero = true) {
  const view = new View();
  const hero = { dataset: { enhanced: "true", loaded: "true" }, rect: { top: -900, bottom: 1500 }, getBoundingClientRect() { return this.rect; } };
  const doc = { querySelector: () => withHero ? hero : null };
  const onVisible = vi.fn();
  const stop = watchBackToTopVisibility(view as unknown as Window & typeof globalThis, doc as unknown as Document, onVisible);
  return { view, doc, hero, onVisible, stop, observer: Observer.current };
}

describe("桌面与手机悬浮控制和返回顶部避让", () => {
  it("水合切换为手机展示后读取当前节点，继续避让底部控件", () => {
    const { view, doc, hero, onVisible, stop, observer } = setup();
    hero.dataset.enhanced = "false";
    observer?.notify();
    expect(onVisible).toHaveBeenLastCalledWith(true);
    const replacement = { ...hero, dataset: { enhanced: "true", loaded: "true" } };
    doc.querySelector = () => replacement;
    observer?.notify();
    expect(onVisible).toHaveBeenLastCalledWith(false);
    view.dispatchEvent(new Event("scroll"));
    expect(onVisible).toHaveBeenLastCalledWith(false);
    stop();
  });
  it("立即到达顶部，不等待smooth滚动，并由原监听收起浮钮", () => {
    const { view, onVisible, stop } = setup(false);
    const scrollTo = vi.fn((options: ScrollToOptions) => {
      if (options.behavior !== "instant") return;
      view.scrollY = options.top!;
      view.dispatchEvent(new Event("scroll"));
    });
    jumpToPageTop({ scrollTo } as unknown as Pick<Window, "scrollTo">);
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "instant" });
    expect(view.scrollY).toBe(0);
    expect(onVisible).toHaveBeenLastCalledWith(false);
    stop();
  });
  it.each([true, false])("手机在Hero内避让，桌面始终按滚动阈值显示；离开/重新进入行为稳定，mobile=%s", (mobile) => {
    const { view, hero, onVisible, stop } = setup();
    view.media.change(mobile);
    expect(onVisible).toHaveBeenLastCalledWith(!mobile);
    hero.rect.bottom = 60; view.dispatchEvent(new Event("scroll"));
    expect(onVisible).toHaveBeenLastCalledWith(true);
    hero.rect = { top: 500, bottom: 2900 }; view.dispatchEvent(new Event("scroll"));
    expect(onVisible).toHaveBeenLastCalledWith(!mobile);
    hero.rect = { top: 860, bottom: 3200 }; view.dispatchEvent(new Event("resize"));
    expect(onVisible).toHaveBeenLastCalledWith(true);
    view.scrollY = 0; view.dispatchEvent(new Event("scroll"));
    expect(onVisible).toHaveBeenLastCalledWith(false);
    stop();
  });

  it("桌面不靠隐藏避让，手机静态/加载降级无暂停控件时保留返回顶部", () => {
    const { view, hero, onVisible, stop, observer } = setup();
    view.media.change(false);
    expect(onVisible).toHaveBeenLastCalledWith(true);
    view.media.change(true);
    expect(onVisible).toHaveBeenLastCalledWith(false);
    hero.dataset.enhanced = "false"; observer?.notify();
    expect(onVisible).toHaveBeenLastCalledWith(true);
    hero.dataset.enhanced = "true"; hero.dataset.loaded = "false"; observer?.notify();
    expect(onVisible).toHaveBeenLastCalledWith(true);
    hero.dataset.loaded = "true"; observer?.notify();
    expect(onVisible).toHaveBeenLastCalledWith(false);
    stop();
  });

  it("路由离开/卸载会清理监听，其他页面继续按520px阈值显示", () => {
    const { view, onVisible, stop, observer } = setup();
    onVisible.mockClear(); stop();
    view.dispatchEvent(new Event("scroll")); view.dispatchEvent(new Event("resize")); view.media.change(false); observer?.notify();
    expect(onVisible).not.toHaveBeenCalled();
    const other = setup(false);
    expect(other.onVisible).toHaveBeenLastCalledWith(true);
    other.view.scrollY = 520; other.view.dispatchEvent(new Event("scroll"));
    expect(other.onVisible).toHaveBeenLastCalledWith(false);
    other.view.scrollY = 521; other.view.dispatchEvent(new Event("scroll"));
    expect(other.onVisible).toHaveBeenLastCalledWith(true);
    other.stop();
  });
});
