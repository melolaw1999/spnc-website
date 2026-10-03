"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { Component, ReactNode, PointerEvent, useCallback, useEffect, useReducer, useRef, useState } from "react";
import { TaobaoButton } from "@/components/TaobaoButton";
import { homeSlogan } from "@/data/hero-products";
import { motionChapterLabels, motionOnProducts, ovodanFlavors } from "@/data/motion-products";
import { initialMotionLoadState, motionLoadReducer, motionChapters, mobileMotionTarget, motionScrollTarget, watchMotionLoading } from "@/lib/product-motion";
import { MotionFailure, MotionInitPhase, motionFailure, motionPhaseOrder } from "@/lib/motion-diagnostics";
import { OvodanLabelFlavor, strawberryLabelViews } from "@/data/ovodan-labels";
import { HeroBottleCommand, HeroLabelStatus } from "@/lib/hero-bottle-motion";
import { draggedBottleYaw, rotationDegrees } from "@/lib/bottle-rotation";
import { onChocolateLabel } from "@/data/on-chocolate-label";
import { isHorizontalDrag } from "@/lib/product-gallery";
import styles from "./ProductMotionHero.module.css";

const MotionCanvas = dynamic(() => import("./motion/MotionCanvas"), { ssr: false });
const MobileSkyCanvas = dynamic(() => import("./motion/MobileSkyCanvas"), { ssr: false });
type Connection = { saveData?: boolean };

class MotionModuleBoundary extends Component<{ children: ReactNode; onFailure: (failure: MotionFailure) => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error) { this.props.onFailure(motionFailure("module", error)); }
  render() { return this.state.failed ? null : this.props.children; }
}

export function ProductMotionHero() {
  const section = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const sky = useRef<HTMLElement>(null);
  const [skyRequested, setSkyRequested] = useState(false), [skyReady, setSkyReady] = useState(false), [skyFailed, setSkyFailed] = useState(false);
  const [skyProgress, setSkyProgress] = useState(0);
  const [allowed, setAllowed] = useState(false), [mobile, setMobile] = useState(false);
  const [visible, setVisible] = useState(false), [foreground, setForeground] = useState(true);
  const [paused, setPaused] = useState(false), [chapter, setChapter] = useState(0);
  const [{ loaded, failed, delayed }, dispatchLoad] = useReducer(motionLoadReducer, initialMotionLoadState);
  const [phase, setPhase] = useState<MotionInitPhase>("pending");
  const [failure, setFailure] = useState<MotionFailure | null>(null);
  const [selectedFlavor, setSelectedFlavor] = useState<OvodanLabelFlavor>("passionfruit");
  const [bottleCommand, setBottleCommand] = useState<HeroBottleCommand>({ yaw: 0, revision: 0 });
  const [labelStatus, setLabelStatus] = useState<HeroLabelStatus>({ passionfruit: "idle", strawberry: "idle" });
  const [goldReady, setGoldReady] = useState(false), [goldHovered, setGoldHovered] = useState(false), [goldFocused, setGoldFocused] = useState(false);
  const [goldCommand, setGoldCommand] = useState<HeroBottleCommand>({ yaw: 0, revision: 0 });
  const [goldDegrees, setGoldDegrees] = useState(0);
  const goldAngle = useRef(0);
  const goldDrag = useRef<{ id: number; x: number; y: number; yaw: number; active: boolean } | null>(null);
  const bottleAngle = useRef(0), deepLinkHandled = useRef(false);
  const drag = useRef<{ id: number; x: number; y: number; yaw: number; active: boolean } | null>(null);
  const enhanced = allowed && !failed;
  const active = enhanced && loaded;
  const running = enhanced && loaded && visible && foreground && !paused;
  const goldChapter = chapter === motionChapters.intro || chapter === motionChapters.on;
  const skyActive = mobile && chapter === motionChapters.sky;
  const goldInspecting = goldChapter && (goldHovered || goldFocused);
  const goldRunning = running && goldReady && !goldInspecting && goldChapter;
  const handleSkyReady = useCallback(() => setSkyReady(true), []);
  const handleSkyFailure = useCallback(() => setSkyFailed(true), []);
  const handleSkyProgress = useCallback((value: number) => setSkyProgress(Math.round(value*1000)/1000), []);
  useEffect(() => { if (mobile && enhanced && chapter !== motionChapters.intro) setSkyRequested(true); }, [mobile, enhanced, chapter]);
  const handleProgress = useCallback((next: MotionInitPhase) => setPhase((current) => motionPhaseOrder[next] > motionPhaseOrder[current] ? next : current), []);
  const handleReady = useCallback(() => { setPhase("ready"); dispatchLoad("ready"); }, []);
  const handleFailure = useCallback((error: MotionFailure) => { setFailure(error); dispatchLoad("failed"); }, []);
  const handleSlow = useCallback(() => dispatchLoad("slow"), []);
  const handleChapter = useCallback((value: number) => setChapter(value), []);
  const handleBottleAngle = useCallback((yaw: number) => { bottleAngle.current = yaw; }, []);
  const handleGoldAngle = useCallback((yaw: number) => { goldAngle.current = yaw; }, []);
  const handleGoldReady = useCallback(() => setGoldReady(true), []);
  const handleLabelReady = useCallback((flavor: OvodanLabelFlavor) => setLabelStatus((current) => current[flavor] === "ready" ? current : { ...current, [flavor]: "ready" }), []);
  const handleLabelFailed = useCallback((flavor: OvodanLabelFlavor) => setLabelStatus((current) => ({ ...current, [flavor]: "failed" })), []);
  const labelsReady = mobile ? labelStatus[selectedFlavor] === "ready" : Object.values(labelStatus).every((status) => status === "ready");
  useEffect(() => { setGoldHovered(false); setGoldFocused(false); }, [chapter]);
  useEffect(() => {
    setGoldDegrees(rotationDegrees(goldAngle.current));
    if (!goldRunning) return;
    const timer = window.setInterval(() => setGoldDegrees(rotationDegrees(goldAngle.current)), 150);
    return () => clearInterval(timer);
  }, [goldRunning]);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const screen = window.matchMedia("(max-width: 760px)");
    const update = () => {
      const saveData = Boolean((navigator as Navigator & { connection?: Connection }).connection?.saveData);
      setAllowed(!motion.matches && !saveData); setMobile(screen.matches);
    };
    const visibility = () => setForeground(!document.hidden);
    update(); visibility();
    motion.addEventListener("change", update); screen.addEventListener("change", update);
    document.addEventListener("visibilitychange", visibility);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .01 });
    if (section.current) observer.observe(section.current);
    return () => { observer.disconnect(); motion.removeEventListener("change", update); screen.removeEventListener("change", update); document.removeEventListener("visibilitychange", visibility); };
  }, []);

  // 隐藏时不计等待。慢加载保留静态内容并继续等待；真正的媒体/渲染错误才卸载。
  useEffect(() => {
    if (!enhanced || loaded) return;
    return watchMotionLoading(document, handleSlow);
  }, [enhanced, loaded, handleSlow]);

  const selectChapter = useCallback((index: number, behavior: ScrollBehavior = "smooth") => {
    const node = section.current, viewport = frame.current;
    if (!node || !viewport) return;
    const start = node.getBoundingClientRect().top + window.scrollY;
    const top = mobile ? Math.max(0, start-72+(node.offsetHeight-viewport.offsetHeight)*mobileMotionTarget(index))
      : motionScrollTarget(start, node.offsetHeight, viewport.offsetHeight, 76, index);
    window.scrollTo({ top, behavior });
  }, [mobile]);

  useEffect(() => {
    if (!active || deepLinkHandled.current) return;
    const target = window.location.hash === "#ovodan-showcase" ? motionChapters.ovodan : window.location.hash === "#on-showcase" ? motionChapters.on : window.location.hash === "#on-skydive" ? motionChapters.sky : null;
    if (target !== null) { deepLinkHandled.current = true; selectChapter(target, "instant"); }
  }, [active, selectChapter]);

  const selectBottleView = (yaw: number) => {
    setPaused(true); bottleAngle.current = yaw;
    setBottleCommand((current) => ({ yaw, revision: current.revision + 1 }));
  };
  const selectFlavor = (flavor: OvodanLabelFlavor) => {
    setSelectedFlavor(flavor); bottleAngle.current = 0;
    setBottleCommand((current) => ({ yaw: 0, revision: current.revision + 1 }));
  };
  const beginBottleDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!labelsReady || event.pointerType === "mouse" && event.button !== 0) return;
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, yaw: bottleAngle.current, active: false };
  };
  const moveBottleDrag = (event: PointerEvent<HTMLDivElement>) => {
    const point = drag.current;
    if (!point || point.id !== event.pointerId) return;
    const x = event.clientX - point.x, y = event.clientY - point.y;
    if (!point.active) {
      if (Math.abs(y) > 8 && Math.abs(y) >= Math.abs(x)) { drag.current = null; return; }
      if (!isHorizontalDrag(x, y)) return;
      point.active = true; event.currentTarget.setPointerCapture(event.pointerId);
    }
    selectBottleView(draggedBottleYaw(point.yaw, x, event.currentTarget.clientWidth));
  };
  const endBottleDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (drag.current?.id !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    drag.current = null;
  };

  const selectGoldView = (yaw: number) => {
    setPaused(true); goldAngle.current = yaw; setGoldDegrees(rotationDegrees(yaw));
    setGoldCommand((current) => ({ yaw, revision: current.revision + 1 }));
  };
  const beginGoldDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!goldReady || event.pointerType === "mouse" && event.button !== 0) return;
    goldDrag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, yaw: goldAngle.current, active: false };
  };
  const moveGoldDrag = (event: PointerEvent<HTMLDivElement>) => {
    const point = goldDrag.current; if (!point || point.id !== event.pointerId) return;
    const dx = event.clientX - point.x, dy = event.clientY - point.y;
    if (!point.active) {
      if (Math.abs(dy) > 8 && Math.abs(dy) >= Math.abs(dx)) { goldDrag.current = null; return; }
      if (!isHorizontalDrag(dx,dy)) return;
      point.active = true; event.currentTarget.setPointerCapture(event.pointerId);
    }
    selectGoldView(draggedBottleYaw(point.yaw,dx,event.currentTarget.clientWidth));
  };
  const endGoldDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (goldDrag.current?.id !== event.pointerId) return;
    goldDrag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const goldControls = active && <div className={styles.goldControls} aria-label="金标乳清包装角度">
    <button type="button" disabled={!goldReady} onClick={() => selectGoldView(0)}>正面</button>
    <button type="button" disabled={!goldReady} onClick={() => selectGoldView(210*Math.PI/180)}>背标</button>
    <Link href="/preview/on-3d?from=home&v=17">放大细看 ↗</Link>
  </div>;

  return <section ref={section} className={styles.story} data-product-motion-hero="" data-enhanced={active} data-loaded={loaded}
    data-loading={failed ? "failed" : loaded ? "ready" : delayed ? "slow" : enhanced ? "loading" : "static"}
    data-motion-phase={phase} data-motion-error-stage={failure?.stage}
    data-motion-error-code={failure?.code} data-motion-error={failure?.message}
    data-chapter={chapter} data-primary-brand="on" data-on-rotation="gold-standard-complete-3d" data-on-supporting="verified-front-images"
    data-on-gold-status={failed ? "failed" : !enhanced ? "static" : goldReady ? "ready" : "loading"} data-on-gold-angle={Math.round(goldDegrees)} data-on-gold-running={goldRunning} data-on-inspecting={goldInspecting}
    data-paused={paused} data-ovodan-labels={labelsReady ? "ready" : Object.values(labelStatus).includes("failed") ? "failed" : "loading"}
    data-ovodan-flavor={selectedFlavor} data-ovodan-view={Math.round(bottleCommand.yaw * 180 / Math.PI)} aria-label="理想营养品牌与商品">
    <div ref={frame} className={styles.frame}>
      {enhanced && <div className={styles.canvas} data-suspended={skyActive} aria-hidden="true">
        <MotionModuleBoundary onFailure={handleFailure}>
          <MotionCanvas section={section} mobile={mobile} running={running && !skyActive} skyActive={skyActive} onSkyProgress={handleSkyProgress} onReady={handleReady} onFailure={handleFailure} onProgress={handleProgress} onChapter={handleChapter}
            chapter={chapter} selectedFlavor={selectedFlavor} bottleCommand={bottleCommand} labelStatus={labelStatus} onBottleAngle={handleBottleAngle} onLabelReady={handleLabelReady} onLabelFailed={handleLabelFailed}
            goldCommand={goldCommand} goldReady={goldReady} goldInspecting={goldInspecting} onGoldAngle={handleGoldAngle} onGoldReady={handleGoldReady} />
        </MotionModuleBoundary>
      </div>}
      <div className={styles.halo} aria-hidden="true" />
      <article className={`${styles.panel} ${styles.intro}`} data-active={chapter === motionChapters.intro}
        aria-hidden={active && chapter !== motionChapters.intro} inert={active && chapter !== motionChapters.intro}>
        <div className={styles.copy}>
          <h1 aria-label={homeSlogan}><span>为你的</span><span>下一次突破</span><span>做好准备</span></h1>
          <div className={styles.actions}><Link href="/on" className="btn">探索全系列</Link><TaobaoButton label="前往淘宝店" secondary /></div>
          {goldControls}
        </div>
        <div className={`${styles.staticProducts} ${styles.staticOnHero}`} aria-label="ON金标乳清为主角，分离乳清、水解乳清与肌酸辅助展示">
          {motionOnProducts.map((product, index) => <Image key={product.id} src={index === 0 ? onChocolateLabel.poster.src : product.image.asset.projectPath} alt={index === 0 ? onChocolateLabel.poster.alt : product.image.altText}
            width={index === 0 ? onChocolateLabel.poster.width : product.image.asset.width} height={index === 0 ? onChocolateLabel.poster.height : product.image.asset.height} priority={index === 0} sizes={index === 0 ? "(max-width: 760px) 65vw, 38vw" : "(max-width: 760px) 28vw, 20vw"} />)}
        </div>
      </article>

      <article id="on-showcase" className={`${styles.panel} ${styles.on}`} data-active={chapter === motionChapters.on}
        aria-hidden={active && chapter !== motionChapters.on} inert={active && chapter !== motionChapters.on}>
        <div className={styles.copy}>
          <h2>你的训练，<br />你的选择。</h2>
          <div className={styles.actions}><Link href="/on" className="btn">浏览商品</Link></div>
          {goldControls}
        </div>
        <div className={`${styles.staticProducts} ${styles.staticOn}`} aria-hidden="true"><Image src={onChocolateLabel.poster.src} alt="" width={onChocolateLabel.poster.width} height={onChocolateLabel.poster.height} sizes="(max-width: 760px) 70vw, 35vw" /></div>
      </article>

      {mobile && <article id="on-skydive" ref={sky} className={`${styles.panel} ${styles.mobileSky}`} data-on-skydive="" data-mobile-sky=""
        data-active={skyActive} data-ready={enhanced && skyReady && !skyFailed} aria-hidden={active && !skyActive} inert={active && !skyActive}>
        <h2 className={styles.srStatus}>突破</h2>
        <div className={styles.skyFallback}><strong>突破</strong><Image src={onChocolateLabel.poster.src} alt="金标乳清完整包装" width={onChocolateLabel.poster.width} height={onChocolateLabel.poster.height} sizes="85vw" /></div>
        {enhanced && skyRequested && !skyFailed && <div className={styles.skyCanvas} aria-hidden="true"><MotionModuleBoundary onFailure={handleSkyFailure}>
          <MobileSkyCanvas section={sky} progress={skyProgress} visible={skyActive} running={running} onReady={handleSkyReady} onFailure={handleSkyFailure} />
        </MotionModuleBoundary></div>}
      </article>}

      <article id="ovodan-showcase" className={`${styles.panel} ${styles.flavors}`} data-active={chapter === motionChapters.ovodan}
        aria-hidden={active && chapter !== motionChapters.ovodan} inert={active && chapter !== motionChapters.ovodan}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>欧福</p>
          <h2>蛋清蛋白饮，<br />随时随行。</h2>
          <p className={styles.description}>225mL 瓶装</p>
          <div className={styles.flavorNames} aria-label="欧福口味">{ovodanFlavors.map((flavor) => active && mobile ?
            <button type="button" key={flavor.id} onClick={() => selectFlavor(flavor.id)} aria-pressed={selectedFlavor === flavor.id}><i style={{ background: flavor.color }} />{flavor.name}</button> :
            <Link key={flavor.id} href={`/preview/ovodan-3d?flavor=${flavor.id}`}><i style={{ background: flavor.color }} />{flavor.name}<span aria-hidden="true">↗</span></Link>)}</div>
          <div className={styles.actions}><TaobaoButton label="前往淘宝店选口味" /></div>
          {active && <div className={styles.faceControls} aria-label="查看真实包装三面">
            {strawberryLabelViews.map((view) => <button key={view.id} type="button" disabled={!labelsReady} onClick={() => selectBottleView(view.viewDegrees * Math.PI / 180)}
              aria-pressed={paused && Math.abs(bottleCommand.yaw * 180 / Math.PI - view.viewDegrees) < 1}>{view.name}</button>)}
            <Link href={`/preview/ovodan-3d?flavor=${selectedFlavor}`}>放大查看 ↗</Link>
          </div>}
          <p className={styles.srStatus} aria-live="polite">{labelsReady ? "包装三面已加载，可以横向拖动旋转。" : Object.values(labelStatus).includes("failed") ? "包装细节暂未加载，仍可继续浏览商品。" : "正在加载包装细节。"}</p>
        </div>
        {active && <div className={styles.bottleDragArea} aria-hidden="true" onPointerDown={beginBottleDrag} onPointerMove={moveBottleDrag}
          onPointerUp={endBottleDrag} onPointerCancel={endBottleDrag} onLostPointerCapture={endBottleDrag}><span>横向拖动旋转</span></div>}
        <div className={styles.staticProducts} aria-hidden="true">{ovodanFlavors.map((flavor) => <Image key={flavor.id} src={flavor.image} alt="" width={1500} height={2126} sizes="(max-width: 760px) 45vw, 25vw" />)}</div>
      </article>


      {active && goldChapter && <div className={styles.goldDragArea} tabIndex={goldReady ? 0 : -1} role="group" aria-label="旋转金标乳清，左右方向键转动"
        onPointerDown={beginGoldDrag} onPointerMove={moveGoldDrag} onPointerUp={endGoldDrag} onPointerCancel={endGoldDrag} onLostPointerCapture={endGoldDrag}
        onPointerEnter={(event) => { if (event.pointerType === "mouse" && !mobile) setGoldHovered(true); }} onPointerLeave={() => setGoldHovered(false)}
        onFocus={(event) => setGoldFocused(event.currentTarget.matches(":focus-visible"))} onBlur={() => setGoldFocused(false)}
        onKeyDown={(event) => { if (goldReady && ["ArrowLeft","ArrowRight"].includes(event.key)) { event.preventDefault(); selectGoldView(goldAngle.current + (event.key === "ArrowRight" ? 1 : -1)*Math.PI/12); } }}>
        <span>{mobile ? "横向拖动旋转" : "悬停细看 · 横向拖动旋转"}</span>
      </div>}
      {active && <div className={styles.controls}>
        <nav aria-label="品牌展示章节" className={styles.chapterNav}>{(mobile ? [0,1,3,2] : [0,1,2]).map((index, order) => <button type="button" key={index} onClick={() => selectChapter(index)} aria-current={chapter === index ? "step" : undefined} aria-label={index === motionChapters.sky ? "金标乳清穿云" : motionChapterLabels[index]}><span>{String(order+1).padStart(2,"0")}</span></button>)}</nav>
        <a href="#brand-statement-title" className={styles.next}>继续浏览 <span aria-hidden="true">↓</span></a>
        <button type="button" className={styles.pause} onClick={() => setPaused((value) => !value)} aria-pressed={paused} aria-label={skyActive ? paused ? "继续穿云动效" : "暂停穿云动效" : paused ? "继续商品悬浮" : "暂停商品悬浮"}>{paused ? "继续动效" : "暂停动效"}</button>
      </div>}
    </div>
  </section>;
}
