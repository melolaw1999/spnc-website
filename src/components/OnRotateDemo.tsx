"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Component, ReactNode, PointerEvent, useCallback, useEffect, useReducer, useRef, useState } from "react";
import { onLabelSource, onLabelViews } from "@/data/on-labels";
import { onChocolateLabel, onChocolateViews, OnSampleVariant } from "@/data/on-chocolate-label";
import { BottlePose, draggedBottleYaw, rotationDegrees } from "@/lib/bottle-rotation";
import { isHorizontalDrag } from "@/lib/product-gallery";
import { initialOnInspection, isOnInspecting, onInspectionReducer, shouldRotateOnInspection } from "@/lib/on-inspection";
import styles from "./OnRotateDemo.module.css";

const RotateCanvas = dynamic(() => import("./motion/OnRotateCanvas"), { ssr: false });
class ModelBoundary extends Component<{ children: ReactNode; onFailure: (message: string) => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure("三维样品暂时不可用，可继续查看完整真实包装原图。"); }
  render() { return this.state.failed ? null : this.props.children; }
}

export function OnRotateDemo() {
  const [variant, setVariant] = useState<OnSampleVariant>("chocolate");
  const chocolate = variant === "chocolate";
  const packagingViews = chocolate ? onChocolateViews : onLabelViews.filter((view) => [0,90,225,270].includes(view.yaw));
  const stage = useRef<HTMLDivElement>(null);
  const viewer = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const modalActive = useRef(false);
  const rotation = useRef<BottlePose>({ yaw: 0, tilt: 0 });
  const drag = useRef<{ id: number; x: number; y: number; yaw: number; active: boolean } | null>(null);
  const [pose, setPose] = useState<BottlePose>({ yaw: 0, tilt: 0 });
  const [degrees, setDegrees] = useState(0);
  const [inspection, dispatchInspection] = useReducer(onInspectionReducer, initialOnInspection);
  const { playing, expanded } = inspection;
  const inspecting = isOnInspecting(inspection);
  const [requested, setRequested] = useState(false), [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false), [foreground, setForeground] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false), [error, setError] = useState<string | null>(null);
  const [showSources, setShowSources] = useState(false);
  const [mobile, setMobile] = useState(false);
  const vanillaSource = onLabelViews.reduce((nearest, view) => {
    const distance = (yaw: number) => Math.min(Math.abs(degrees-yaw), 360-Math.abs(degrees-yaw));
    return distance(view.yaw) < distance(nearest.yaw) ? view : nearest;
  });
  const running = requested && ready && shouldRotateOnInspection(inspection) && !reducedMotion && (visible || expanded) && foreground && !error;
  const onReady = useCallback(() => setReady(true), []);
  const onFailure = useCallback((message: string) => { setError(message); setReady(false); dispatchInspection({ type: "manual" }); }, []);
  const onAngle = useCallback((value: BottlePose) => { rotation.current = value; }, []);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("variant") === "vanilla") setVariant("vanilla");
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => { setReducedMotion(media.matches); if (media.matches) dispatchInspection({ type: "manual" }); };
    const mobileMedia = window.matchMedia("(max-width: 760px)");
    const updateMobile = () => { setMobile(mobileMedia.matches); if (mobileMedia.matches) dispatchInspection({ type: "hover", value: false }); };
    updateMobile(); mobileMedia.addEventListener("change", updateMobile);
    const saveData = Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
    setRequested(!saveData); dispatchInspection({ type: "play", value: !media.matches && !saveData }); updateMotion();
    const visibility = () => setForeground(!document.hidden);
    visibility(); document.addEventListener("visibilitychange", visibility); media.addEventListener("change", updateMotion);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .1 });
    if (stage.current) observer.observe(stage.current);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", visibility); media.removeEventListener("change", updateMotion); mobileMedia.removeEventListener("change", updateMobile); };
  }, []);
  useEffect(() => {
    if (!expanded) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus({ preventScroll: true });
    return () => { document.body.style.overflow = previousOverflow; };
  }, [expanded]);
  useEffect(() => {
    setDegrees(rotationDegrees(rotation.current.yaw));
    if (!running) return;
    const timer = window.setInterval(() => setDegrees(rotationDegrees(rotation.current.yaw)), 150);
    return () => window.clearInterval(timer);
  }, [running]);

  const selectAngle = (value: number) => {
    dispatchInspection({ type: "manual" }); const next = { yaw: value, tilt: 0 }; rotation.current = next;
    setPose(next); setDegrees(rotationDegrees(value));
  };
  const openInspection = (trigger: HTMLElement) => {
    const dialog = viewer.current;
    if (!ready || !dialog || modalActive.current) return;
    returnFocus.current = trigger;
    modalActive.current = true;
    // 同一节点从内联非模态切换为原生模态，保留单个Canvas及当前角度。
    dialog.close(); dialog.showModal();
    dispatchInspection({ type: "open" });
  };
  const closeInspection = () => {
    const dialog = viewer.current;
    if (!dialog || !modalActive.current) return;
    modalActive.current = false;
    dialog.close(); dialog.show();
    dispatchInspection({ type: "close" });
    returnFocus.current?.focus({ preventScroll: true });
  };
  const beginDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!ready || (event.pointerType === "mouse" && event.button !== 0)) return;
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, yaw: rotation.current.yaw, active: false };
  };
  const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
    const point = drag.current; if (!point || point.id !== event.pointerId) return;
    const dx = event.clientX - point.x, dy = event.clientY - point.y;
    if (!point.active) {
      if (Math.abs(dy) > 8 && Math.abs(dy) >= Math.abs(dx)) { drag.current = null; return; }
      if (!isHorizontalDrag(dx, dy)) return;
      point.active = true; event.currentTarget.setPointerCapture(event.pointerId);
    }
    selectAngle(draggedBottleYaw(point.yaw, dx, event.currentTarget.clientWidth));
  };
  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    const point = drag.current;
    if (point?.id !== event.pointerId) return;
    const tapped = event.type === "pointerup" && !point.active && Math.abs(event.clientX-point.x) <= 8 && Math.abs(event.clientY-point.y) <= 8;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (tapped && !expanded && (mobile || event.pointerType === "touch")) openInspection(event.currentTarget);
  };
  const faceButtons = <div className={styles.views} aria-label="查看包装重点角度">{packagingViews.map((view) => {
    return <button type="button" key={view.yaw} disabled={!ready} onClick={() => selectAngle(view.yaw * Math.PI / 180)} aria-pressed={!playing && Math.abs(degrees-view.yaw)<1}>{view.name}</button>;
  })}</div>;

  return <section className={styles.demo} aria-label="ON金标乳清真实包装旋转样品"
    data-on-rotation-demo="" data-model-status={error ? "failed" : ready ? "ready" : requested ? "loading" : "static"}
    data-model-angle={Math.round(degrees)} data-model-running={running} data-model-inspecting={inspecting} data-inspection-open={expanded} data-model-variant={variant} data-model-labels={chocolate ? "baozun-complete-vector-artwork" : "eight-verified-iherb-views"}>
    <div className={styles.viewerSlot}>
    <dialog ref={viewer} open className={styles.viewer} data-modal={expanded} role={expanded ? "dialog" : "group"}
      aria-modal={expanded || undefined} aria-label={expanded ? "金标乳清包装细看" : "金标乳清可旋转样品"}
      onCancel={(event) => { event.preventDefault(); closeInspection(); }}
      onClose={() => { if (modalActive.current && !viewer.current?.open) closeInspection(); }}>
      <div className={styles.dialogHead} hidden={!expanded}><div><strong>包装细看</strong><span>{chocolate ? "双重巧克力味 · 74份" : "香草冰淇淋味 · 73份"}</span></div>
        <button ref={closeButton} type="button" className={styles.close} onClick={closeInspection} aria-label="关闭包装细看">关闭 <span aria-hidden="true">×</span></button>
      </div>
    <div ref={stage} className={styles.stage} onPointerDown={beginDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag}
      onPointerEnter={(event) => { if (event.pointerType === "mouse" && !mobile && !expanded) dispatchInspection({ type: "hover", value: true }); }}
      onPointerLeave={() => dispatchInspection({ type: "hover", value: false })}
      onFocus={(event) => dispatchInspection({ type: "focus", value: event.currentTarget.matches(":focus-visible") })}
      onBlur={() => dispatchInspection({ type: "focus", value: false })}
      tabIndex={ready ? 0 : -1} role="group" aria-label="可旋转罐身，左右方向键每次旋转15度，按回车放大查看"
      onKeyDown={(event) => {
        if (!ready) return;
        if (["ArrowLeft", "ArrowRight"].includes(event.key)) { event.preventDefault(); selectAngle(rotation.current.yaw + (event.key === "ArrowRight" ? 1 : -1) * Math.PI / 12); }
        if (!expanded && ["Enter", " "].includes(event.key)) { event.preventDefault(); openInspection(event.currentTarget); }
      }}>
      <div className={styles.stageCaption}><span>OPTIMUM NUTRITION</span><span>360°</span></div>
      <div className={styles.original} hidden={ready}><Image src={chocolate ? onChocolateLabel.texture : onLabelViews[0].image}
        alt={chocolate ? "ON金标乳清双重巧克力味5.05磅74份完整真实展开标签" : "ON金标乳清香草冰淇淋味5磅73份真实正面包装"}
        width={chocolate ? 4096 : 1600} height={chocolate ? 1009 : 1600} priority unoptimized /></div>
      {requested && !error && <div className={styles.canvas} aria-hidden="true" style={{ visibility: ready ? "visible" : "hidden" }}>
        <ModelBoundary key={variant} onFailure={onFailure}><RotateCanvas variant={variant} pose={pose} running={running} inspecting={inspecting} reducedMotion={reducedMotion} onAngle={onAngle} onReady={onReady} onFailure={onFailure} /></ModelBoundary>
      </div>}
      <p className={styles.hint}>{ready ? expanded ? "横向拖动或选择角度，查看完整包装" : mobile ? "轻点放大细看 · 横向拖动旋转" : "悬停细看 · 横向拖动旋转" : error || (requested ? "正在准备旋转样品…" : "真实包装原图")}</p>
    </div>
    <div className={styles.dialogViews} hidden={!expanded}>{faceButtons}
      <a className={styles.highResolution} href={chocolate ? onChocolateLabel.texture : vanillaSource.image} target="_blank" rel="noreferrer">查看高清标签 <span aria-hidden="true">↗</span><span className={styles.screenReader}>（新标签页）</span></a>
    </div>
    </dialog>
    </div>
    <div className={styles.mobileViews}>{faceButtons}</div>
    <div className={styles.controls}>
      <p className={styles.eyebrow}>GOLD STANDARD</p>
      <h2>金标乳清<span>每一面，都真实。</span></h2>
      <p className={styles.description}>{chocolate ? "双重巧克力味" : "香草冰淇淋味"}<span>{chocolate ? "5.05 磅 · 2.29 千克 · 74 份" : "5 磅 · 2.26 千克 · 73 份"}</span></p>
      <div className={styles.rotationHead}><label htmlFor="on-yaw">旋转角度</label><output htmlFor="on-yaw">{Math.round(degrees) % 360}°</output></div>
      <input id="on-yaw" className={styles.slider} type="range" min="0" max="360" step="1" value={Math.round(degrees)} disabled={!ready}
        onChange={(event) => selectAngle(Number(event.target.value) * Math.PI / 180)} aria-valuetext={`${Math.round(degrees) % 360}度`} />
      <div className={styles.desktopViews}>{faceButtons}</div>
      <div className={styles.controlActions}>
      {requested ? <button className={styles.play} type="button" disabled={!ready || reducedMotion} aria-pressed={playing} onClick={() => dispatchInspection({ type: "play", value: !playing })}>{playing ? "暂停旋转" : "自动旋转"}</button>
        : <button className={styles.play} type="button" onClick={() => setRequested(true)}>加载可旋转样品</button>}
      <button className={styles.inspectButton} type="button" disabled={!ready} aria-haspopup="dialog" aria-expanded={expanded} onClick={(event) => openInspection(event.currentTarget)}>放大细看</button>
      </div>
      {reducedMotion && <p className={styles.preference}>已关闭自动动效，可拖动或用角度按钮查看。</p>}
      <p className={styles.scope}>真实包装，完整侧背。<br />独立效果预览，尚未替换官网首屏。</p>
    </div>
    <details className={styles.sources} onToggle={(event) => setShowSources(event.currentTarget.open)}>
      <summary>{chocolate ? "核对完整包装原稿" : "核对八张真实包装原图"}</summary>
      {chocolate ? <>
        <p>来自你提供的宝尊完整包装稿。正面、配料营养、原有二维码与条码均保留；罐形和灯光为展示模型，屏幕颜色不作为印刷色样。</p>
        <p><a href={onChocolateLabel.texture} target="_blank" rel="noreferrer">打开高清展开标签 ↗</a> · <a href="?variant=vanilla">查看已保留的香草样品</a></p>
        {showSources && <a className={styles.flatSource} href={onChocolateLabel.texture} target="_blank" rel="noreferrer"><Image src={onChocolateLabel.texture} alt="宝尊提供的完整巧克力74份包装原稿" width={4096} height={1009} unoptimized /></a>}
      </> : <>
        <p>同一香草73份包装，来源 <a href={onLabelSource.productUrl} target="_blank" rel="noreferrer">iHerb 360°</a>。三维罐形为照片参考模型，标签保留原有拍摄光影；盖底没有新增文字或认证贴。</p>
        <p><a href="?variant=chocolate">返回巧克力完整标签样品</a></p>
        {showSources && <div>{onLabelViews.map((view) => <a href={view.image} key={view.file} target="_blank" rel="noreferrer"><Image src={view.image} alt={`真实原图：${view.name}`} width={1600} height={1600} unoptimized loading="lazy" /><span>{view.name}</span></a>)}</div>}
      </>}
    </details>
  </section>;
}
