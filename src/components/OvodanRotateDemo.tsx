"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Component, ReactNode, PointerEvent, useCallback, useEffect, useRef, useState } from "react";
import { ovodanFlavors } from "@/data/motion-products";
import { OvodanLabelFlavor, ovodanLabelViews } from "@/data/ovodan-labels";
import { BottlePose, draggedBottleYaw, rotationDegrees } from "@/lib/bottle-rotation";
import { isHorizontalDrag } from "@/lib/product-gallery";
import styles from "./OvodanRotateDemo.module.css";

const RotateCanvas = dynamic(() => import("./motion/OvodanRotateCanvas"), { ssr: false });
class ModelBoundary extends Component<{ children: ReactNode; onFailure: (message: string) => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure("三维样品加载失败，请查看原始正面图。"); }
  render() { return this.state.failed ? null : this.props.children; }
}

export function OvodanRotateDemo() {
  const [flavorId, setFlavorId] = useState<OvodanLabelFlavor>("strawberry");
  const flavor = ovodanFlavors.find((item) => item.id === flavorId)!;
  const labelViews = ovodanLabelViews[flavorId];
  const stage = useRef<HTMLDivElement>(null);
  const rotation = useRef<BottlePose>({ yaw: 0, tilt: 0 });
  const drag = useRef<{ id: number; x: number; y: number; yaw: number; active: boolean } | null>(null);
  const [pose, setPose] = useState<BottlePose>({ yaw: 0, tilt: 0 });
  const [degrees, setDegrees] = useState(0), [playing, setPlaying] = useState(false);
  const [requested, setRequested] = useState(false), [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false), [foreground, setForeground] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false), [error, setError] = useState<string | null>(null);
  const enhanced = requested && !error;
  const running = enhanced && ready && playing && !reducedMotion && visible && foreground;
  const onReady = useCallback(() => setReady(true), []);
  const onFailure = useCallback((message: string) => { setError(message); setReady(false); setPlaying(false); }, []);
  const onAngle = useCallback((value: BottlePose) => { rotation.current = value; }, []);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("flavor") === "passionfruit") setFlavorId("passionfruit");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => { setReducedMotion(motion.matches); if (motion.matches) setPlaying(false); };
    const saveData = Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
    setRequested(!saveData); setPlaying(!motion.matches && !saveData); updateMotion();
    const visibility = () => setForeground(!document.hidden);
    visibility(); document.addEventListener("visibilitychange", visibility); motion.addEventListener("change", updateMotion);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .05 });
    if (stage.current) observer.observe(stage.current);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", visibility); motion.removeEventListener("change", updateMotion); };
  }, []);

  useEffect(() => {
    const snapshot = () => setDegrees(rotationDegrees(rotation.current.yaw));
    snapshot();
    if (!running) return;
    const timer = window.setInterval(snapshot, 150);
    return () => window.clearInterval(timer);
  }, [running]);

  const selectPose = (yaw: number, tilt = rotation.current.tilt) => {
    setPlaying(false);
    const value = { yaw, tilt }; rotation.current = value; setPose(value); setDegrees(rotationDegrees(yaw));
  };
  const selectFlavor = (value: OvodanLabelFlavor) => {
    if (value === flavorId) return;
    setFlavorId(value); setReady(false); setError(null); selectPose(0, 0);
  };
  const beginDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!ready || (event.pointerType === "mouse" && event.button !== 0)) return;
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, yaw: rotation.current.yaw, active: false };
  };
  const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
    const point = drag.current;
    if (!point || point.id !== event.pointerId) return;
    const x = event.clientX - point.x, y = event.clientY - point.y;
    if (!point.active) {
      // 纵向触摸由浏览器继续滚动，只有明确的横拖才捕获指针。
      if (Math.abs(y) > 8 && Math.abs(y) >= Math.abs(x)) { drag.current = null; return; }
      if (!isHorizontalDrag(x, y)) return;
      point.active = true; event.currentTarget.setPointerCapture(event.pointerId);
    }
    selectPose(draggedBottleYaw(point.yaw, x, event.currentTarget.clientWidth));
  };
  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (drag.current?.id !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    drag.current = null;
  };

  const flavorButtons = <div className={styles.flavorSwitch} aria-label="选择欧福口味">{ovodanFlavors.map((item) => <button type="button" key={item.id} aria-pressed={flavorId === item.id} onClick={() => selectFlavor(item.id)}><i style={{ background: item.color }} />{item.name}</button>)}</div>;
  const faceButtons = <div className={styles.views} aria-label="选择瓶身角度">
    {[...labelViews.map((view) => ({ name: view.name, angle: view.viewDegrees })), { name: "背侧", angle: 180 }].map((view) => <button key={view.angle} type="button" disabled={!ready}
      onClick={() => selectPose(view.angle * Math.PI / 180, 0)} aria-pressed={!playing && Math.abs(degrees - view.angle) < 1 && pose.tilt === 0}>{view.name}</button>)}
  </div>;

  return <section className={styles.demo} aria-label={`欧福${flavor.name}三维体积样品`}
    data-rotation-demo="" data-model-status={error ? "failed" : ready ? "ready" : requested ? "loading" : "static"}
    data-model-angle={Math.round(degrees)} data-model-tilt={pose.tilt.toFixed(2)} data-model-running={running}
    data-model-rear="real-ingredients-and-nutrition" data-model-labels="three-verified-source-views" data-model-flavor={flavorId}>
    <div ref={stage} className={styles.stage} onPointerDown={beginDrag} onPointerMove={moveDrag}
      onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag}>
      <div className={styles.stageCaption}><span>OVODAN · {flavor.name}</span><span>225mL 瓶装</span></div>
      <div className={styles.original} hidden={ready}>
        <Image src={flavor.image} alt={`欧福蛋清蛋白饮${flavor.name}225mL原始正面包装图`} width={1500} height={2126} priority sizes="(max-width: 760px) 80vw, 400px" />
      </div>
      {enhanced && <div className={styles.canvas} aria-hidden="true" style={{ visibility: ready ? "visible" : "hidden" }}>
        <ModelBoundary key={flavorId} onFailure={onFailure}><RotateCanvas flavor={flavorId} pose={pose} running={running} onAngle={onAngle} onReady={onReady} onFailure={onFailure} /></ModelBoundary>
      </div>}
      <p className={styles.hint}>{ready ? "横向拖动，绕瓶身旋转" : error || (requested ? "正在加载三维样品…" : "原始正面图")}</p>
    </div>
    <div className={styles.quickControls} aria-label="手机快速查看包装">{flavorButtons}{faceButtons}</div>

    <div className={styles.controls}>
      <div className={styles.desktopFlavor}>{flavorButtons}</div>
      <p className={styles.eyebrow}>单品体积验证</p>
      <h2>转过来，<br />看见立体。</h2>
      <p className={styles.description}>绕瓶身完整旋转一周，查看真实正面、配料和营养标签。</p>
      <div className={styles.rotationHead}><label htmlFor="bottle-yaw">旋转角度</label><output htmlFor="bottle-yaw">{Math.round(degrees) % 360}°</output></div>
      <input id="bottle-yaw" className={styles.slider} type="range" min="0" max="360" step="1" value={Math.round(degrees)} disabled={!ready}
        onChange={(event) => selectPose(Number(event.target.value) * Math.PI / 180)} aria-valuetext={`${Math.round(degrees) % 360}度`} />
      <div className={styles.desktopFaces}>{faceButtons}</div>
      <div className={styles.details} aria-label="查看瓶盖与底部">
        <button type="button" disabled={!ready} onClick={() => selectPose(rotation.current.yaw, .55)} aria-pressed={pose.tilt === .55}>看瓶盖 ↗</button>
        <button type="button" disabled={!ready} onClick={() => selectPose(rotation.current.yaw, -.55)} aria-pressed={pose.tilt === -.55}>看瓶底 ↘</button>
        <button type="button" disabled={!ready} onClick={() => selectPose(rotation.current.yaw, 0)} aria-pressed={pose.tilt === 0}>平视</button>
      </div>
      {requested ? <button type="button" className={styles.play} disabled={!ready || reducedMotion} aria-pressed={playing} onClick={() => setPlaying((value) => !value)}>{playing ? "暂停旋转" : "自动旋转"}</button>
        : <button type="button" className={styles.play} onClick={() => setRequested(true)}>加载可旋转样品</button>}
      {reducedMotion && <p className={styles.preference}>已按减少动效偏好关闭自动旋转，可用拖动和角度按钮查看。</p>}
      <p className={styles.scope}><strong>真实三面包装原图</strong><br />正面、配料面与营养面已贴合。瓶形和标签接缝按照片比例制作，用于官网效果预览。</p>
    </div>
  </section>;
}
