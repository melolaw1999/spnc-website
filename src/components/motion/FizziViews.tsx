"use client";

/* View, Hero and bubble motion adapted from Prismic course-fizzi-next,
 * Apache-2.0, commit 84b5775. Modified 2026-10-02: real SPNC packaging,
 * existing header offset, motion controls, shared Canvas and diagnostics.
 * Source numeric Hero choreography is in lib/fizzi-hero-timeline.ts.
 * No Fizzi brand images, models, fonts or HDR files are distributed.
 */
import { ReactNode, RefObject, Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { View } from "@react-three/drei";
import { Group, InstancedMesh, MeshPhysicalMaterial, NoToneMapping, Object3D, SphereGeometry, Vector3 } from "three";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { addFizziEntrance, addFizziScrollTracks, resetFizziActors } from "@/lib/fizzi-hero-timeline";
import { OvodanLabelFlavor } from "@/data/ovodan-labels";
import { HeroBottleCommand } from "@/lib/hero-bottle-motion";
import { OnChocolateTub } from "./OnChocolateTub";
import { OnStudioLighting } from "./OnStudioLighting";
import { OvodanThreeFaceBottle } from "./OvodanThreeFaceBottle";
import { OnSkyDive } from "./OnSkyDive";

gsap.registerPlugin(useGSAP, ScrollTrigger);
type Props = {
  primary: RefObject<HTMLElement | null>; primaryView: RefObject<HTMLDivElement | null>; ovoView: RefObject<HTMLDivElement | null>;
  sky: RefObject<HTMLElement | null>; skyView: RefObject<HTMLDivElement | null>; ovoVisible: boolean;
  running: boolean; onReady: () => void; onFailure: () => void;
  flavor: OvodanLabelFlavor; command: HeroBottleCommand; onAngle: (yaw: number) => void;
};

// 与源 Drei Float 完全相同的速度/幅度/方程。独立累加时间只为暂停恢复
// 保持原姿态，避免 Canvas frameloop 切换时 R3F 全局时钟归零造成跳动。
function SourceFloat({ running, children }: { running: boolean; children: ReactNode }) {
  const group = useRef<Group>(null), phase = useRef(Math.random() * 10000), previous = useRef(0);
  useEffect(() => { previous.current = performance.now(); }, [running]);
  useFrame(() => {
    const now = performance.now(), elapsed = (now - previous.current) / 1000; previous.current = now;
    if (!running || !group.current) return;
    phase.current += elapsed;
    const t = phase.current / 4 * 1.5;
    group.current.rotation.set(Math.cos(t) / 8, Math.sin(t) / 8, Math.sin(t) / 20);
    group.current.position.y = Math.sin(t) / 10;
  });
  return <group ref={group}>{children}</group>;
}

function SourceBubbles({ running }: { running: boolean }) {
  const mesh = useRef<InstancedMesh>(null);
  const state = useMemo(() => {
    const material = new MeshPhysicalMaterial({ color: "#89bdd8", roughness: .07, metalness: 0, envMapIntensity: 2,
      ior: 1.35, specularIntensity: 1.4, clearcoat: 1, clearcoatRoughness: .05, opacity: .7, transparent: true, depthWrite: false });
    material.onBeforeCompile = (shader) => {
      // 真实球面法线 + 固定环境反射。中心薄、边缘厚，亮斑保留反射强度；
      // 不使用面向相机的圆片，也不引入逐气泡折射渲染通道。
      shader.fragmentShader = shader.fragmentShader.replace("#include <opaque_fragment>", `
        float bubbleFacing = clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0);
        float bubbleRim = pow(1.0 - bubbleFacing, 2.0);
        vec3 bubbleReflection = totalSpecular + clearcoatSpecularDirect + clearcoatSpecularIndirect;
        float bubbleHighlight = clamp(max(bubbleReflection.r, max(bubbleReflection.g, bubbleReflection.b)) * 1.5, 0.0, 1.0);
        diffuseColor.a *= clamp(0.08 + 0.72 * bubbleRim + 0.60 * bubbleHighlight, 0.0, 1.0);
        #include <opaque_fragment>`);
    };
    material.customProgramCacheKey = () => "spnc-sphere-thin-shell-v20";
    return { geometry: new SphereGeometry(.05, 24, 20), material,
      object: new Object3D(), speeds: Float32Array.from({ length: 300 }, () => gsap.utils.random(.002, .01)) };
  }, []);
  useEffect(() => {
    if (!mesh.current) return;
    for (let i = 0; i < 300; i++) {
      state.object.position.set(gsap.utils.random(-4, 4), gsap.utils.random(-4, 4), gsap.utils.random(-4, 3.5));
      state.object.updateMatrix(); mesh.current.setMatrixAt(i, state.object.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
    return () => { state.geometry.dispose(); state.material.dispose(); };
  }, [state]);
  useFrame((_, delta) => {
    if (!running || !mesh.current) return;
    for (let i = 0; i < 300; i++) {
      mesh.current.getMatrixAt(i, state.object.matrix); state.object.position.setFromMatrixPosition(state.object.matrix);
      state.object.position.y += state.speeds[i] * Math.min(delta, .05) * 60;
      if (state.object.position.y > 4) state.object.position.set(gsap.utils.random(-4, 4), -2, gsap.utils.random(-4, 3.5));
      state.object.updateMatrix(); mesh.current.setMatrixAt(i, state.object.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={mesh} args={[state.geometry, state.material, 300]} />;
}

function HeroScene({ primary, running, onReady }: Pick<Props, "primary" | "running" | "onReady">) {
  const group = useRef<Group>(null), actors = useRef<Group[]>([]), entrances = useRef<Group[]>([]);
  const intro = useRef<gsap.core.Timeline | null>(null), scroll = useRef<gsap.core.Timeline | null>(null);
  const { invalidate, camera, gl } = useThree();
  const qa = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("motionQA");
  const fixedFloat = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("motionMeasure");
  useGSAP(() => {
    if (!primary.current || !group.current || actors.current.length !== 5) return;
    resetFizziActors(group.current, actors.current);
    entrances.current.forEach((item) => { item.position.set(0, 0, 0); item.rotation.set(0, 0, 0); });
    intro.current = gsap.timeline({ defaults: { duration: 3, ease: "back.out(1.4)" }, onUpdate: invalidate });
    if (window.scrollY < 20) addFizziEntrance(intro.current, entrances.current);
    scroll.current = gsap.timeline({ defaults: { duration: 2 }, onUpdate: invalidate,
      scrollTrigger: { trigger: primary.current, start: "top top+=76", end: "bottom bottom", scrub: 1.5, onUpdate: () => invalidate() } });
    addFizziScrollTracks(scroll.current, group.current, actors.current);
    // 用户确认首屏双桶，第二屏只保留一个主角：原始两桶轨迹不变，
    // 在聚拢前退出；不再渲染原五产品阵列中的欧福占位。
    [actors.current[0], actors.current[1]].forEach((actor) => {
      actor.scale.setScalar(1);
      scroll.current!.to(actor.scale, { x: 0, y: 0, z: 0, duration: .45 }, 1.25);
    });
    onReady();
    return () => { intro.current = null; scroll.current = null; };
  }, { dependencies: [primary, invalidate, onReady], revertOnUpdate: true });
  useEffect(() => { if (running) intro.current?.resume(); else intro.current?.pause(); invalidate(); }, [running, invalidate]);
  useFrame(() => {
    if (!qa || !group.current) return;
    const node = primary.current;
    if (node) node.dataset.motionProgress = (scroll.current?.progress() || 0).toFixed(5);
    group.current.updateWorldMatrix(true, true);
    const position = new Vector3();
    const value = {
      progress: scroll.current?.progress(), targetProgress: scroll.current?.scrollTrigger?.progress,
      timelineDuration: scroll.current?.duration(), entrance: intro.current?.progress(),
      group: { position: group.current.position.toArray(), rotation: group.current.rotation.toArray().slice(0, 3) },
      actors: actors.current.map((actor) => ({ position: actor.position.toArray(), rotation: actor.rotation.toArray().slice(0, 3), matrix: actor.matrixWorld.toArray() })),
      entrances: entrances.current.map((actor) => ({ position: actor.position.toArray(), rotation: actor.rotation.toArray().slice(0, 3) })),
      models: actors.current.map((actor) => { const model = actor.getObjectByName("on-whole-tub"); return model ? { matrix: model.matrixWorld.toArray(), worldPosition: model.getWorldPosition(position).toArray() } : null; }),
      camera: { position: camera.position.toArray(), projection: camera.projectionMatrix.toArray() },
      drawCalls: gl.info.render.calls,
    };
    (window as Window & { __FIZZI_QA__?: typeof value }).__FIZZI_QA__ = value;
  });
  const product = (index: number) => <group name={`fizzi-actor-${index + 1}`} ref={(value) => { if (value) actors.current[index] = value; }}>
    <SourceFloat running={running && !fixedFloat}>
      {index !== 2 && index !== 4 && <group scale={.43} position-y={.0655 * .43}><OnChocolateTub /></group>}
    </SourceFloat>
  </group>;
  return <>
    <group ref={group} name="fizzi-source-group">
      {[0, 1].map((index) => <group key={index} ref={(value) => { if (value) entrances.current[index] = value; }}>{product(index)}</group>)}
      {[2, 3, 4].map((index) => <group key={index}>{product(index)}</group>)}
    </group>
    <SourceBubbles running={running} />
    <OnStudioLighting />
  </>;
}

function OvodanScene({ running, flavor, command, onAngle }: Pick<Props, "running" | "flavor" | "command" | "onAngle">) {
  const model = useRef<Group>(null);
  const { invalidate } = useThree();
  useEffect(() => { if (model.current) model.current.rotation.y = command.yaw; invalidate(); }, [command, invalidate]);
  useFrame((_, delta) => { if (model.current) { if (running) model.current.rotation.y += Math.min(delta, .05) * .255; onAngle(model.current.rotation.y); } });
  return <>
    <ambientLight intensity={1.45} /><directionalLight position={[-4, 4, 5]} intensity={2.1} /><directionalLight position={[4, 2, -3]} intensity={1.5} />
    <group scale={.65} rotation-x={.05}><group ref={model}><OvodanThreeFaceBottle flavor={flavor} /></group></group>
  </>;
}

export default function FizziViews(props: Props) {
  return <Canvas camera={{ position: [0, 0, 5], fov: 30 }} dpr={[1, 1.5]} frameloop={props.running ? "always" : "demand"}
    gl={{ antialias: true, alpha: true, toneMapping: NoToneMapping }}
    onCreated={({ gl }) => {
      if (props.primary.current) props.primary.current.dataset.rendererReadyMs = performance.now().toFixed(1);
      gl.domElement.addEventListener("webglcontextlost", props.onFailure, { once: true });
    }}>
    <View track={props.primaryView as RefObject<HTMLDivElement>} index={1}><Suspense fallback={null}><HeroScene {...props} /></Suspense></View>
    <View track={props.skyView as RefObject<HTMLDivElement>} index={2}><Suspense fallback={null}><OnSkyDive section={props.sky} running={props.running} /></Suspense></View>
    <View track={props.ovoView as RefObject<HTMLDivElement>} index={3}><Suspense fallback={null}>{props.ovoVisible && <OvodanScene {...props} />}</Suspense></View>
  </Canvas>;
}
