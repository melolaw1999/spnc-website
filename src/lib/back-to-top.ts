// instant绕过全局CSS的smooth；后台浏览器/焦点变化时也立即完成跳转。
export function jumpToPageTop(view: Pick<Window, "scrollTo">) {
  view.scrollTo({ top: 0, behavior: "instant" });
}

// 手机控件区保留空间；桌面通过CSS上移浮钮避让，仍按520px规则显示和可点击。
export function watchBackToTopVisibility(view: Window & typeof globalThis, doc: Document, onVisible: (visible: boolean) => void) {
  const mobile = view.matchMedia("(max-width: 760px)");
  const update = () => {
    // 首页会在水合后按屏宽切换组件，不能一直引用 SSR 的旧展示节点。
    const hero = doc.querySelector<HTMLElement>("[data-product-motion-hero]");
    let controlsVisible = false;
    if (mobile.matches && hero?.dataset.enhanced === "true" && hero.dataset.loaded === "true") {
      const rect = hero.getBoundingClientRect();
      controlsVisible = rect.top < view.innerHeight && rect.bottom > 72;
    }
    onVisible(view.scrollY > 520 && !controlsVisible);
  };
  const observed = doc.body ?? doc.querySelector<HTMLElement>("[data-product-motion-hero]");
  const observer = observed ? new view.MutationObserver(update) : null;
  if (observed) observer?.observe(observed, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-enhanced", "data-loaded"] });
  view.addEventListener("scroll", update, { passive: true });
  view.addEventListener("resize", update, { passive: true });
  mobile.addEventListener("change", update);
  update();
  return () => {
    observer?.disconnect();
    view.removeEventListener("scroll", update);
    view.removeEventListener("resize", update);
    mobile.removeEventListener("change", update);
  };
}
