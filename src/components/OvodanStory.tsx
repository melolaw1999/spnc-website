"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { Component, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { ovodanFlavors } from "@/data/motion-products";
import { OvodanLabelFlavor } from "@/data/ovodan-labels";
import { TaobaoButton } from "./TaobaoButton";
import { useStudioScroll } from "./useStudioScroll";
import styles from "./OvodanStory.module.css";

const Studio = dynamic(() => import("./motion/OvodanStudio"), { ssr: false });
export class StudioBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export function OvodanStory() {
  const section = useRef<HTMLElement>(null), frame = useRef<HTMLDivElement>(null);
  const motion = useStudioScroll(section, frame);
  const [flavor, setFlavor] = useState<OvodanLabelFlavor>("passionfruit");
  const [ready, setReady] = useState(false), [failed, setFailed] = useState(false);
  const onReady = useCallback(() => setReady(true), []), onFailure = useCallback(() => setFailed(true), []);
  useEffect(() => { if (!motion.requested) setReady(false); }, [motion.requested]);
  return <section id="ovodan-showcase" ref={section} className={styles.story} data-ovodan-story="" data-motion={motion.allowed && !failed} data-ready={ready && !failed} aria-label="欧福蛋清蛋白饮">
    <div ref={frame} className={styles.frame}>
      <div className={styles.light} aria-hidden="true" />
      <header className={styles.copy}>
        <p className={styles.eyebrow}>OVODAN · 欧福</p>
        <h2>随时，<br />随行。</h2>
        <p className={styles.description}>蛋清蛋白饮 <span>225mL</span></p>
      </header>
      <div className={styles.stage} aria-hidden="true">
        <div className={styles.poster} data-hidden={ready && !failed && motion.requested}>{ovodanFlavors.map(item => <Image key={item.id} src={item.image} alt="" width={1500} height={2126} sizes="(max-width:760px) 40vw, 22vw" />)}</div>
        {motion.requested && !failed && <StudioBoundary onFailure={onFailure}><Studio progress={motion.progress} running={motion.running} flavor={flavor} onReady={onReady} onFailure={onFailure} /></StudioBoundary>}
      </div>
      <div className={styles.choice}>
        <div className={styles.flavors} aria-label="选择欧福口味">{ovodanFlavors.map(item => <button key={item.id} type="button" aria-pressed={flavor === item.id} onClick={() => setFlavor(item.id)}><i style={{ background: item.color }} />{item.name}</button>)}</div>
        <div className={styles.links}><TaobaoButton label="选购欧福" /><Link href={`/preview/ovodan-3d?flavor=${flavor}`}>查看真实包装 ↗</Link></div>
      </div>
      <div className={styles.foot}><span>轻装出发。</span><span aria-hidden="true">↓</span></div>
    </div>
  </section>;
}
