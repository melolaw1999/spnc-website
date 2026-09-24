import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { openTaobaoWithFallback, shouldOpenTaobaoApp, taobaoAppUrl, taobaoFallbackDelay } from "@/lib/taobao-navigation";

const shop = "https://spnc.taobao.com";

describe("淘宝网页与 App 导航", () => {
  it("电脑保持网页；手机和触屏 iPad 可尝试 App；微信和淘宝内置浏览器保持网页", () => {
    expect(shouldOpenTaobaoApp("Mozilla/5.0 (Macintosh; Intel Mac OS X)")).toBe(false);
    expect(shouldOpenTaobaoApp("Mozilla/5.0 (Windows NT 10.0)")).toBe(false);
    expect(shouldOpenTaobaoApp("Mozilla/5.0 (iPhone; CPU iPhone OS)")).toBe(true);
    expect(shouldOpenTaobaoApp("Mozilla/5.0 (Linux; Android 15)")).toBe(true);
    expect(shouldOpenTaobaoApp("Mozilla/5.0 (Macintosh)", 5)).toBe(true);
    expect(shouldOpenTaobaoApp("iPhone MicroMessenger/8.0")).toBe(false);
    expect(shouldOpenTaobaoApp("Android AliApp(TB/10.0)")).toBe(false);
  });

  it("App 地址使用同一店铺网址，保留网址参数而不转换为商品 SKU", () => {
    const url = new URL(taobaoAppUrl(`${shop}/?a=1&b=中文`));
    expect(url.protocol).toBe("tbopen:");
    expect(url.searchParams.get("h5Url")).toBe(`${shop}/?a=1&b=中文`);
  });

  let page: EventTarget & { visibilityState: string };
  let browser: EventTarget & { location: { assign: ReturnType<typeof vi.fn> } };
  beforeEach(() => {
    vi.useFakeTimers();
    page = Object.assign(new EventTarget(), { visibilityState: "visible" });
    browser = Object.assign(new EventTarget(), { location: { assign: vi.fn() } });
    vi.stubGlobal("document", page);
    vi.stubGlobal("window", browser);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("唤起失败且仍停留网页时回退到同一淘宝店", () => {
    openTaobaoWithFallback(shop);
    expect(browser.location.assign).toHaveBeenCalledWith(taobaoAppUrl(shop));
    vi.advanceTimersByTime(taobaoFallbackDelay);
    expect(browser.location.assign).toHaveBeenLastCalledWith(shop);
    expect(browser.location.assign).toHaveBeenCalledTimes(2);
  });

  it.each(["visibilitychange", "pagehide"])("%s 后取消回退，从 App 返回也不再跳转", (event) => {
    openTaobaoWithFallback(shop);
    if (event === "visibilitychange") {
      page.visibilityState = "hidden";
      page.dispatchEvent(new Event(event));
      page.visibilityState = "visible";
      page.dispatchEvent(new Event(event));
    } else browser.dispatchEvent(new Event(event));
    vi.advanceTimersByTime(10000);
    expect(browser.location.assign).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("重复点击或组件离开可取消上一轮回退", () => {
    const cancel = openTaobaoWithFallback(shop);
    cancel();
    cancel();
    openTaobaoWithFallback(shop);
    vi.advanceTimersByTime(taobaoFallbackDelay);
    expect(browser.location.assign.mock.calls.map(([url]) => url)).toEqual([taobaoAppUrl(shop), taobaoAppUrl(shop), shop]);
  });

  it("浏览器明确拒绝协议时立即回退", () => {
    browser.location.assign.mockImplementationOnce(() => { throw new Error("Unsupported protocol"); });
    openTaobaoWithFallback(shop);
    expect(browser.location.assign).toHaveBeenLastCalledWith(shop);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("网页被挂起很久后不执行过时回退", () => {
    openTaobaoWithFallback(shop);
    vi.setSystemTime(Date.now() + 60000);
    vi.advanceTimersByTime(taobaoFallbackDelay);
    expect(browser.location.assign).toHaveBeenCalledTimes(1);
  });
});
