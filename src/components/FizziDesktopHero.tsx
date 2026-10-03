"use client";

/* Hero layout/DOM timing adapted from Prismic course-fizzi-next (Apache-2.0).
 * Modified 2026-10-02: SPNC copy, verified packaging, existing navigation,
 * static fallback, motion preference, manual packaging inspection and OVO.
 * See licenses/fizzi-NOTICE.txt.
 */
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { Component, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TaobaoButton } from "./TaobaoButton";
import { onChocolateLabel } from "@/data/on-chocolate-label";
import { ovodanFlavors } from "@/data/motion-products";
import { OvodanLabelFlavor, strawberryLabelViews } from "@/data/ovodan-labels";
import { HeroBottleCommand } from "@/lib/hero-bottle-motion";
import { draggedBottleYaw } from "@/lib/bottle-rotation";
import { isHorizontalDrag } from "@/lib/product-gallery";
import styles from "./FizziDesktopHero.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);
const FizziViews = dynamic(() => import("./motion/FizziViews"), { ssr: false });

class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export function FizziDesktopHero({ interactive }: { interactive: boolean }) {
  const root = useRef<HTMLDivElement>(null), primary = useRef<HTMLElement>(null);
  const primaryView = useRef<HTMLDivElement>(null), ovoView = useRef<HTMLDivElement>(null);
  const sky = useRef<HTMLElement>(null), skyView = useRef<HTMLDivElement>(null);
  const [ovoVisible, setOvoVisible] = useState(false);
  const [allowed, setAllowed] = useState(false), [ready, setReady] = useState(false), [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(false), [visible, setVisible] = useState(true), [foreground, setForeground] = useState(true);
  const [flavor, setFlavor] = useState<OvodanLabelFlavor>("passionfruit");
  const [command, setCommand] = useState<HeroBottleCommand>({ yaw: 0, revision: 0 });
  const angle = useRef(0), drag = useRef<{ id: number; x: number; y: number; yaw: number; active: boolean } | null>(null);
  const introTimeline = useRef<gsap.core.Timeline | null>(null);
  const active = interactive && allowed && !failed;
  const running = active && ready && !paused && visible && foreground;
  const onReady = useCallback(() => setReady(true), []), onFailure = useCallback(() => setFailed(true), []);
  const onAngle = useCallback((yaw: number) => { angle.current = yaw; }, []);
  const selectView = (yaw: number) => { setPaused(true); angle.current = yaw; setCommand((current) => ({ yaw, revision: current.revision + 1 })); };

  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setAllowed(!query.matches && !(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
    const visibility = () => setForeground(!document.hidden);
    update(); visibility(); query.addEventListener("change", update); document.addEventListener("visibilitychange", visibility);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (root.current) observer.observe(root.current);
    const ovoObserver = new IntersectionObserver(([entry]) => setOvoVisible(entry.isIntersecting), { rootMargin: "300px" });
    if (ovoView.current) ovoObserver.observe(ovoView.current);
    return () => { observer.disconnect(); ovoObserver.disconnect(); query.removeEventListener("change", update); document.removeEventListener("visibilitychange", visibility); };
  }, []);

  useGSAP(() => {
    if (!active || !ready || !primary.current) return;
    const node = primary.current;
    const intro = gsap.timeline({ onUpdate: () => { node.dataset.introProgress = intro.progress().toFixed(4); } });
    introTimeline.current = intro;
    intro
      .from("[data-fizzi-word]", { scale: 3, opacity: 0, ease: "power4.in", delay: .3, stagger: 1 })
      .from("[data-fizzi-button]", { opacity: 0, y: 10, duration: .6 }, 3.3);
    // 原站两屏自然滚动，非 pin。唯一起点偏移用于避开已有 76px 导航。
    // 原英文标题20个字符、0.1s stagger：中文仍保留相同1.9s展开跨度。
    const letters = node.querySelectorAll("[data-fizzi-char]");
    const scroll = gsap.timeline({ scrollTrigger: { trigger: node, start: "top top+=76", end: "bottom bottom", scrub: 1.5 } });
    scroll.fromTo(node, { backgroundColor: "#ffffff" }, { backgroundColor: "#edf6ff", overwrite: "auto" }, 1)
      .from(letters, { scale: 1.3, y: 40, rotate: -25, opacity: 0, stagger: 1.9 / Math.max(1, letters.length - 1), ease: "back.out(3)", duration: .5 })
      .from("[data-fizzi-side-body]", { y: 20, opacity: 0 });
    return () => { introTimeline.current = null; };
  }, { scope: primary, dependencies: [active, ready], revertOnUpdate: true });

  useEffect(() => { if (running) introTimeline.current?.resume(); else introTimeline.current?.pause(); }, [running]);

  return <div ref={root} className={styles.story} data-product-motion-hero="" data-fizzi-desktop=""
    data-loading={failed ? "failed" : active ? ready ? "ready" : "loading" : "static"} data-loaded={ready}
    data-enhanced={active && ready} data-primary-brand="on" data-paused={paused} data-ovodan-flavor={flavor}>
    {active && <div className={styles.canvas} aria-hidden="true"><SceneBoundary onFailure={onFailure}>
      <FizziViews primary={primary} primaryView={primaryView} sky={sky} skyView={skyView} ovoView={ovoView} ovoVisible={ovoVisible} running={running}
        onReady={onReady} onFailure={onFailure} flavor={flavor} command={command} onAngle={onAngle} />
    </SceneBoundary></div>}
    <section ref={primary} className={styles.primary} data-fizzi-primary="" aria-label="ON 金标乳清">
      <div ref={primaryView} className={styles.primaryView}>
        {active && ready && <div className={styles.controls}>
          <button type="button" onClick={() => setPaused(!paused)} aria-label={paused ? "继续商品悬浮" : "暂停商品悬浮"}>{paused ? "继续动效" : "暂停动效"}</button>
          <Link href="/preview/on-3d?v=19&from=home">360° 查看真实包装 ↗</Link>
        </div>}
        <div className={styles.fallback} aria-hidden="true">
          <Image src={onChocolateLabel.poster.src} alt="" width={829} height={720} sizes="40vw" priority />
          <Image src={onChocolateLabel.poster.src} alt="" width={829} height={720} sizes="40vw" priority />
        </div>
      </div>
      <div className={styles.panels}>
        <div className={styles.intro}>
          <div className={styles.centerCopy}>
            <h1 aria-label="为你的下一次突破做好准备"><small>为你的</small><span data-fizzi-word="">下一次突破</span><span data-fizzi-word="">做好准备</span></h1>
            <div data-fizzi-button="" className={styles.actions}><Link href="/on" className="btn">探索全系列</Link><TaobaoButton label="前往淘宝店" secondary /></div>
          </div>
        </div>
        <div id="on-showcase" className={styles.second}>
          <div className={styles.sideCopy}>
            <h2 aria-label="你的训练，你的选择。">{["你的训练，", "你的选择。"].map((line) => <span className={styles.line} key={line}>{Array.from(line).map((letter, i) => <span data-fizzi-char="" key={i}>{letter}</span>)}</span>)}</h2>
            <div data-fizzi-side-body="">
              <div className={styles.actions}><Link href="/on" className="btn">浏览商品</Link></div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section id="on-skydive" ref={sky} className={styles.sky} data-on-skydive="" aria-label="金标乳清穿云展示">
      <h2 className={styles.srOnly}>突破</h2>
      <div ref={skyView} className={styles.skyView} aria-hidden="true" />
      {!active && <div className={styles.skyStatic}><strong>突破</strong><Image src={onChocolateLabel.poster.src} alt="金标乳清完整包装" width={829} height={720} sizes="50vw" /></div>}
      {active && ready && <button className={styles.skyPause} type="button" onClick={() => setPaused(!paused)} aria-label={paused ? "继续穿云动效" : "暂停穿云动效"}>{paused ? "继续动效" : "暂停动效"}</button>}
    </section>
    <section id="ovodan-showcase" className={styles.ovodan} aria-label="欧福蛋清蛋白饮">
      <div className={styles.ovoCopy}>
        <p className={styles.eyebrow}>欧福</p>
        <h2>蛋清蛋白饮，<br />随时随行。</h2>
        <p className={styles.description}>225mL 瓶装</p>
        <div className={styles.flavors}>{ovodanFlavors.map((item) => <button type="button" key={item.id} aria-pressed={flavor === item.id} onClick={() => { setFlavor(item.id); setCommand((value) => ({ yaw: 0, revision: value.revision + 1 })); }}><i style={{ background: item.color }} />{item.name}</button>)}</div>
        <div className={styles.actions}><TaobaoButton label="前往淘宝店选口味" /></div>
        <div className={styles.faces}>{strawberryLabelViews.map((item) => <button type="button" key={item.id} disabled={!active || !ready} onClick={() => selectView(item.viewDegrees * Math.PI / 180)}>{item.name}</button>)}<Link href={`/preview/ovodan-3d?flavor=${flavor}`}>放大查看 ↗</Link></div>
        {active && ready && <button className={styles.pauseOvo} type="button" onClick={() => setPaused(!paused)}>{paused ? "继续动效" : "暂停动效"}</button>}
      </div>
      <div ref={ovoView} className={styles.ovoView}>
        <div className={styles.ovoFallback}><Image src={ovodanFlavors.find((item) => item.id === flavor)!.image} alt={`${flavor === "strawberry" ? "草莓" : "百香果"}味欧福蛋清蛋白饮`} width={1500} height={2126} sizes="40vw" /></div>
        {active && ready && <div className={styles.drag} role="group" tabIndex={0} aria-label="旋转欧福包装，左右方向键转动"
          onKeyDown={(event) => { if (["ArrowLeft", "ArrowRight"].includes(event.key)) { event.preventDefault(); selectView(angle.current + (event.key === "ArrowRight" ? 1 : -1) * Math.PI / 12); } }}
          onPointerDown={(event) => { if (event.pointerType !== "mouse" || event.button === 0) drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, yaw: angle.current, active: false }; }}
          onPointerMove={(event) => { const point = drag.current; if (!point || point.id !== event.pointerId) return; const dx = event.clientX - point.x, dy = event.clientY - point.y; if (!point.active) { if (Math.abs(dy) > 8 && Math.abs(dy) >= Math.abs(dx)) { drag.current = null; return; } if (!isHorizontalDrag(dx, dy)) return; point.active = true; event.currentTarget.setPointerCapture(event.pointerId); } selectView(draggedBottleYaw(point.yaw, dx, event.currentTarget.clientWidth)); }}
          onPointerUp={(event) => { drag.current = null; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
          onPointerCancel={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }}><span>横向拖动旋转</span></div>}
      </div>
    </section>
  </div>;
}
