"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { onChocolateLabel } from "@/data/on-chocolate-label";
import { TaobaoButton } from "./TaobaoButton";
import { StudioBoundary } from "./OvodanStory";
import { useStudioScroll } from "./useStudioScroll";
import styles from "./MobileHomeStory.module.css";
const Scene = dynamic(() => import("./motion/MobileOnStudio"), { ssr:false });

function MobileOnChapter({ sky = false, interactive = true }: { sky?:boolean; interactive?:boolean }) {
 const section=useRef<HTMLElement>(null),frame=useRef<HTMLDivElement>(null);
 const motion=useStudioScroll(section,frame,"0px");
 const [ready,setReady]=useState(false),[failed,setFailed]=useState(false);
 const onReady=useCallback(()=>setReady(true),[]),onFailure=useCallback(()=>setFailed(true),[]);
  useEffect(() => { if (!motion.requested) setReady(false); }, [motion.requested]);
 return <section ref={section} id={sky?"on-skydive":"on-showcase"} className={`${styles.chapter} ${sky?styles.sky:styles.hero}`} data-mobile-story={sky?"sky":"intro"} data-ready={ready&&!failed} data-motion={motion.allowed&&!failed}>
  <div ref={frame} className={styles.frame}>
   <header className={styles.copy}>{sky?<><p>OPTIMUM NUTRITION</p><h2>你的训练，<br/>你的选择。</h2></>:<><p>为你的</p><h1>下一次突破<br/>做好准备。</h1></>}</header>
   <div className={styles.stage} aria-hidden="true">
    <div className={styles.poster} data-hidden={ready&&!failed&&motion.requested}><Image src={onChocolateLabel.poster.src} alt="" width={829} height={720} sizes="90vw" priority={!sky}/></div>
    {interactive&&motion.requested&&!failed&&<StudioBoundary onFailure={onFailure}><Scene section={section} sky={sky} progress={motion.progress} running={motion.running} onReady={onReady} onFailure={onFailure}/></StudioBoundary>}
   </div>
   <div className={styles.actions}><Link className="btn" href="/on">{sky?"浏览 ON 全系列":"探索全系列"}</Link>{!sky&&<TaobaoButton secondary label="前往淘宝店"/>}</div>
   <div className={styles.foot}><span aria-hidden="true">↓</span></div>
  </div>
 </section>;
}
export function MobileHomeStory({interactive=true}:{interactive?:boolean}){return <div data-mobile-home=""><MobileOnChapter interactive={interactive}/><MobileOnChapter sky interactive={interactive}/></div>;}
