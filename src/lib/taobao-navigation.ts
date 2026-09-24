export const taobaoFallbackDelay = 1800;

export function shouldOpenTaobaoApp(userAgent: string, maxTouchPoints = 0) {
  const mobile = /Android|iPhone|iPad|iPod/i.test(userAgent)
    || (/Macintosh/i.test(userAgent) && maxTouchPoints > 1);
  // 微信限制外部协议；淘宝内置浏览器直接访问店铺网页。
  return mobile && !/MicroMessenger|AliApp\(TB/i.test(userAgent);
}

export function taobaoAppUrl(webUrl: string) {
  const params = new URLSearchParams({
    action: "ali.open.nav", module: "h5", bootImage: "0", h5Url: webUrl,
  });
  return `tbopen://m.taobao.com/tbopen/index.html?${params}`;
}

// 仅从用户点击调用；离开页面后取消回退，避免从 App 返回时再次跳转。
export function openTaobaoWithFallback(webUrl: string) {
  let stopped = false;
  const startedAt = Date.now();
  const cancel = () => {
    stopped = true;
    clearTimeout(timer);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    window.removeEventListener("pagehide", cancel);
  };
  const onVisibilityChange = () => {
    if (document.visibilityState === "hidden") cancel();
  };
  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("pagehide", cancel);
  const timer = setTimeout(() => {
    const shouldFallback = !stopped && document.visibilityState === "visible"
      && Date.now() - startedAt < 10000;
    cancel();
    if (shouldFallback) window.location.assign(webUrl);
  }, taobaoFallbackDelay);
  try {
    window.location.assign(taobaoAppUrl(webUrl));
  } catch {
    cancel();
    window.location.assign(webUrl);
  }
  return cancel;
}
