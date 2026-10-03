"use client";

/* SkyDive transform/timeline adapted from Prismic course-fizzi-next,
 * Apache-2.0, commit 84b5775. Modified 2026-10-02: ON complete real artwork,
 * Chinese text, local procedural cloud texture and existing 76px header.
 * The cloud sprites occupy actual XYZ positions and are depth sorted by
 * Drei Clouds. No Fizzi brand image, font, HDR or cloud image is copied.
 */
import { RefObject, useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Cloud, Clouds, useTexture } from "@react-three/drei";
import type { CloudProps } from "@react-three/drei";
import { CanvasTexture, Group, MeshBasicMaterial, SRGBColorSpace, Vector3 } from "three";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { OnChocolateTub } from "./OnChocolateTub";
import { OnStudioLighting } from "./OnStudioLighting";
import { createCloudDensityTexture } from "@/lib/cloud-density";

gsap.registerPlugin(useGSAP, ScrollTrigger);
const angle = 75 * Math.PI / 180;
const xy = (distance: number) => ({ x: distance * Math.cos(angle), y: -distance * Math.sin(angle) });

// 自制软云密度图，仅用于云体粒子。原品牌标签图片不做任何改动。
const cloudDistribution: NonNullable<CloudProps["distribute"]> = (_, index) => {
  if (index === 18) return { point: new Vector3(.22, 0, .15), volume: .42 };
  const row = Math.floor(index / 2), side = index % 2 ? 1 : -1;
  return { point: new Vector3(side * (.22 + .025 * (row % 3)), (-10 + row * 2.5) / 10, -1.1 + .18 * (row % 3)), volume: .65 };
};
const mobileCloudDistribution: NonNullable<CloudProps["distribute"]> = (_, index) => {
  if (index === 8) return { point: new Vector3(.14,0,.15), volume: .42 };
  const row = Math.floor(index/2), side = index%2 ? 1 : -1;
  return { point: new Vector3(side*.14,(-9+row*6)/10,-1.1+.18*(row%3)), volume:.65 };
};

function ChineseWord() {
  const material = useMemo(() => {
    const canvas = document.createElement("canvas"); canvas.width = 1152; canvas.height = 512;
    const ctx = canvas.getContext("2d")!; ctx.font = '900 420px "PingFang SC", "Microsoft YaHei", sans-serif'; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillStyle = "#f97315"; ctx.fillText("突破", 576, 270);
    const texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace;
    return new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false });
  }, []);
  useEffect(() => () => { material.map?.dispose(); material.dispose(); }, [material]);
  return <mesh material={material}><planeGeometry args={[3.6, 1.6]} /></mesh>;
}

export function OnSkyDive({ section, running, mobile = false, progress, onReady }: {
  section: RefObject<HTMLElement | null>; running: boolean; mobile?: boolean; progress?: number; onReady?: () => void;
}) {
  const can = useRef<Group>(null), float = useRef<Group>(null), clouds = useRef<Group>(null);
  const cloud1 = useRef<Group>(null), cloud2 = useRef<Group>(null), word = useRef<Group>(null);
  const clock = useRef(0), previous = useRef(0), scroll = useRef<gsap.core.Timeline | null>(null);
  const texture = useMemo(() => createCloudDensityTexture(mobile ? 256 : 512), [mobile]);
  const cloudMap = useTexture(texture);
  cloudMap.colorSpace = SRGBColorSpace;
  const { invalidate, camera } = useThree();
  const lightStudy = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("lightingStudy");
  useEffect(() => { previous.current = performance.now(); }, [running]);
  useGSAP(() => {
    if (!section.current || !can.current || !clouds.current || !word.current) return;
    gsap.set(clouds.current.position, { z: 10 });
    gsap.set(can.current.position, xy(-4));
    gsap.set(word.current.position, { ...xy(7), z: 2 });
    const node = section.current;
    const tl = gsap.timeline({ paused: mobile, onUpdate: () => { node.dataset.skyProgress = tl.progress().toFixed(4); invalidate(); },
      scrollTrigger: mobile ? undefined : { trigger: node, pin: true, start: "top top+=76", end: "+=2000", scrub: 1.5, onUpdate: () => invalidate() } });
    scroll.current = tl;
    tl.to(node, { backgroundColor: "#C0F0F5", duration: .1, overwrite: "auto" })
      .to(clouds.current.position, { z: 0, duration: .3 }, 0)
      .to(can.current.position, { x: 0, y: 0, duration: .3, ease: "back.out(1.7)" })
      .to(word.current.position, { keyframes: [{ x: 0, y: 0, z: -1 }, { ...xy(-7), z: -7 }] }, 0)
      .to(can.current.position, { ...xy(4), duration: .5, ease: "back.in(1.7)" })
      .to(clouds.current.position, { z: 7, duration: .5 });
    node.dataset.skyReady = "true";
    onReady?.();
    return () => { scroll.current = null; };
  }, { dependencies: [section, invalidate, mobile, onReady], revertOnUpdate: true });
  useEffect(() => { if (mobile && progress !== undefined) { scroll.current?.progress(progress); invalidate(); } }, [mobile, progress, invalidate]);

  useFrame(() => {
    const now = performance.now(), delta = (now - previous.current) / 1000; previous.current = now;
    if (running) clock.current += delta;
    const t = clock.current;
    if (can.current) can.current.rotation.y = t / 1.7 * Math.PI * 2;
    if (float.current) {
      float.current.position.y = Math.sin(t / 4 * 3) * .3;
      // 圆桶纯绕轴旋转的外轮廓法线不变。加入轻微真实倾转，让固定灯箱
      // 在肩、盖和涂层上连续展开/收窄；75°路线、Y转速和滚动节拍不变。
      const sway = t / 3.4 * Math.PI * 2;
      float.current.rotation.set(.18 * Math.sin(sway), 0, .075 * Math.sin(sway));
    }
    [cloud1.current, cloud2.current].forEach((group, i) => {
      if (!group) return;
      const phase = Math.max(0, t - i * 3) % 6 / 6;
      const position = xy(15 - phase * 30); group.position.set(position.x, position.y, 0);
    });
    if (section.current && new URLSearchParams(window.location.search).has("motionQA")) {
      const value = { progress: scroll.current?.progress(), duration: scroll.current?.duration(), can: can.current?.position.toArray(), yaw: can.current?.rotation.y, motionSeconds: t, tilt: float.current?.rotation.toArray().slice(0, 3), lights: "fixed-world-softboxes", cloudsZ: clouds.current?.position.z, cloudGroups: [cloud1.current?.position.toArray(), cloud2.current?.position.toArray()], camera: camera.position.toArray(), mobile, cloudCount: mobile ? 20 : 40, modelScale: mobile ? .38 : .5 };
      (window as Window & { __ON_SKY_QA__?: typeof value }).__ON_SKY_QA__ = value;
    }
  });
  return <>
    <group rotation-z={.5}><group ref={can}><group ref={float}><group scale={mobile ? .38 : .5} position-y={.0655 * (mobile ? .38 : .5)}><OnChocolateTub motionSurface /></group></group></group></group>
    <Clouds ref={clouds} texture={texture} material={MeshBasicMaterial} limit={mobile ? 20 : 40} visible={!lightStudy} frustumCulled={false}>
      {[cloud1, cloud2].map((ref, i) => <group ref={ref} key={i}>
        <Cloud seed={12 + i * 18} bounds={[10, 10, 2]} segments={mobile ? 9 : 19} distribute={mobile ? mobileCloudDistribution : cloudDistribution} growth={0} opacity={.78} fade={2} />
        {/* 每组只有一团前景云：穿过后留出清晰展示窗口，不给整桶常驻蒙雾。 */}
        <Cloud seed={52+i} segments={1} position={[0,0,1.4]} volume={4.7} growth={0} opacity={.56} fade={2} />
      </group>)}
    </Clouds>
    <group ref={word} visible={!lightStudy}><group scale={mobile ? .43 : 1}><ChineseWord /></group></group>
    <OnStudioLighting motion resolution={mobile ? 128 : 256} />
  </>;
}
