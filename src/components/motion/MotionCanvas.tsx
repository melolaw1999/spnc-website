"use client";

/* Motion choreography adapted from Prismic course-fizzi-next (Apache-2.0).
 * Modified 2026-10-02: source-derived OVODAN geometry, bounded rotation,
 * ON photo group, independent mobile poses, native scroll and pause.
 * See licenses/fizzi-NOTICE.txt and licenses/fizzi-Apache-2.0.txt.
 */
import { Component, ReactNode, RefObject, Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, useTexture } from "@react-three/drei";
import { ACESFilmicToneMapping, AmbientLight, DirectionalLight, Group, MathUtils, Mesh, MeshStandardMaterial, SRGBColorSpace, Vector3 } from "three";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ovodanFlavors, motionOnProducts } from "@/data/motion-products";
import { motionChapterAt, mobileMotionChapterAt, mobileSkyRange, motionChapters, MotionPose } from "@/lib/product-motion";
import { choreographyYawAt, productChoreography } from "@/lib/on-choreography";
import { bottleHeight } from "@/lib/ovodan-geometry";
import { MotionFailure, MotionInitPhase, motionFailure } from "@/lib/motion-diagnostics";
import { OvodanBottle } from "./OvodanBottle";
import { OvodanThreeFaceBottle } from "./OvodanThreeFaceBottle";
import { OvodanLabelFlavor } from "@/data/ovodan-labels";
import { advanceHeroBottleYaw, HeroBottleCommand, HeroLabelStatus } from "@/lib/hero-bottle-motion";
import { onChocolateLabel } from "@/data/on-chocolate-label";
import { OnHeroProduct } from "./OnHeroProduct";
import { OnStudioLighting } from "./OnStudioLighting";

gsap.registerPlugin(useGSAP, ScrollTrigger);
type Props = { section: RefObject<HTMLElement | null>; mobile: boolean; running: boolean; skyActive?: boolean; onSkyProgress?: (progress: number) => void; onReady: () => void; onFailure: (failure: MotionFailure) => void; onProgress: (phase: MotionInitPhase) => void; onChapter: (chapter: number) => void; chapter: number; selectedFlavor: OvodanLabelFlavor; bottleCommand: HeroBottleCommand; labelStatus: HeroLabelStatus; onBottleAngle: (yaw: number) => void; onLabelReady: (flavor: OvodanLabelFlavor) => void; onLabelFailed: (flavor: OvodanLabelFlavor) => void; goldCommand: HeroBottleCommand; goldReady: boolean; goldInspecting: boolean; onGoldAngle: (yaw: number) => void; onGoldReady: () => void };

class LabelBoundary extends Component<{ children: ReactNode; fallback: ReactNode; flavor: OvodanLabelFlavor; onFailure: (flavor: OvodanLabelFlavor) => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(this.props.flavor); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

class CanvasBoundary extends Component<{ children: ReactNode; onFailure: (failure: MotionFailure) => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error) { this.props.onFailure(motionFailure(/Could not load|texture/i.test(error.message) ? "texture" : "canvas", error)); }
  render() { return this.state.failed ? null : this.props.children; }
}

function Scene({ section, mobile, running, onReady, onFailure, onProgress, onChapter, onSkyProgress, chapter, selectedFlavor, bottleCommand, labelStatus, onBottleAngle, onLabelReady, onLabelFailed, goldCommand, goldReady, goldInspecting, onGoldAngle, onGoldReady }: Props) {
  const { viewport, invalidate, gl, camera, scene } = useThree();
  const bottleRefs = useRef<Group[]>([]), photoRefs = useRef<Group[]>([]);
  const rotatingRefs = useRef<Group[]>([]);
  const entranceRef = useRef<Group>(null);
  const introRef = useRef<gsap.core.Timeline | null>(null);
  const ovoKey = useRef<DirectionalLight>(null), ovoRim = useRef<DirectionalLight>(null), ovoFill = useRef<DirectionalLight>(null);
  const scrolling = useRef(false), lastScroll = useRef(-1000), progress = useRef(0), scrollYaw = useRef(0), targetYaw = useRef(0);
  const gray = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("motionGray");
  const qa = gray || typeof window !== "undefined" && new URLSearchParams(window.location.search).has("motionQA");
  const textures = useTexture([...ovodanFlavors.map((flavor) => flavor.image), ...motionOnProducts.map((p, i) => i === 0 ? onChocolateLabel.poster.src : p.image.asset.projectPath), onChocolateLabel.texture]);
  textures.forEach((texture) => { texture.colorSpace = SRGBColorSpace; });

  useEffect(() => {
    onProgress("textures");
    const lost = (event: Event) => { event.preventDefault(); onFailure(motionFailure("webgl", new Error("webglcontextlost"))); };
    gl.domElement.addEventListener("webglcontextlost", lost);
    let refresh = 0;
    const frame = requestAnimationFrame(() => {
      invalidate(); onReady();
      // 就绪后静态面板切换为 sticky 章节，重新读取最终高度，避免导航落点偏移。
      refresh = requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    return () => { cancelAnimationFrame(frame); cancelAnimationFrame(refresh); gl.domElement.removeEventListener("webglcontextlost", lost); };
  }, [gl, invalidate, onReady, onFailure, onProgress]);

  useGSAP(() => {
    const node = section.current;
    if (!node || !entranceRef.current || bottleRefs.current.length !== ovodanFlavors.length || photoRefs.current.length !== motionOnProducts.length) return;
    const base = productChoreography(mobile, viewport.width / viewport.height);
    // 在原 ON → 欧福路径中留出手机穿云区间；原两段实体仍由同一时间线管理。
    const frames = mobile ? { stops: [0, .23/1.5, 1/3, .378, .45, .85, 1],
      actors: [base.actors[0], base.actors[1], base.actors[2], base.actors[3], base.actors[4], base.actors[4], base.actors[5]] } : base;
    const actors = [...bottleRefs.current, ...photoRefs.current];
    const allFrames = frames.actors;
    const apply = (actor: Group, target: MotionPose) => {
      actor.position.set(target.x*viewport.width, target.y*viewport.height, target.z);
      actor.rotation.set(target.rx, target.ry, target.rz);
      actor.scale.setScalar(target.scale*viewport.height/bottleHeight);
    };
    actors.forEach((actor, i) => apply(actor, allFrames[0][i]));

    // ON金标优先入场；欧福全周旋转仍独立作用于内层实体。
    const intro = gsap.timeline({ defaults: { duration: 2.2, ease: "back.out(1.1)" }, onUpdate: invalidate });
    if (window.scrollY < 30) {
      intro.fromTo(entranceRef.current.position, { x: viewport.width*.14, y: -viewport.height*.85, z: -2.8 }, { x: 0, y: 0, z: 0 }, 0)
        .fromTo(entranceRef.current.rotation, { x: .5, z: -.5 }, { x: 0, z: 0 }, 0);
    }
    introRef.current = intro;

    const scroll = gsap.timeline({
      defaults: { duration: 1, ease: "sine.inOut" },
      scrollTrigger: {
        trigger: node, start: `top top+=${mobile ? 72 : 76}`, end: "bottom bottom", scrub: .85,
        invalidateOnRefresh: true,
        onUpdate: (self) => { targetYaw.current = choreographyYawAt(frames,self.progress); onChapter(mobile ? mobileMotionChapterAt(self.progress) : motionChapterAt(self.progress)); invalidate(); },
      },
      onUpdate: () => {
        progress.current = scroll.progress();
        if (mobile) onSkyProgress?.(Math.max(0, Math.min(1, (progress.current-mobileSkyRange[0])/(mobileSkyRange[1]-mobileSkyRange[0]))));
        scrollYaw.current = photoRefs.current[0]?.rotation.y || 0;
        scrolling.current = true; lastScroll.current = performance.now();
        node.dataset.motionProgress = progress.current.toFixed(4);
        invalidate();
      },
    });
    for (let chapter = 1; chapter < frames.stops.length; chapter++) {
      actors.forEach((actor, i) => {
        const target = allFrames[chapter][i];
        const at = frames.stops[chapter-1], duration = frames.stops[chapter]-at;
        scroll.to(actor.position, { x: target.x*viewport.width, y: target.y*viewport.height, z: target.z, duration }, at)
          .to(actor.rotation, { x: target.rx, y: target.ry, z: target.rz, duration }, at)
          .to(actor.scale, { x: target.scale*viewport.height/bottleHeight, y: target.scale*viewport.height/bottleHeight, z: target.scale*viewport.height/bottleHeight, duration }, at);
      });
    }
    return () => { introRef.current = null; };
  }, { dependencies: [mobile, viewport.width, viewport.height], revertOnUpdate: true });

  useEffect(() => {
    if (running) introRef.current?.resume(); else introRef.current?.pause();
  }, [running]);

  useEffect(() => {
    rotatingRefs.current.forEach((model) => { model.rotation.y = chapter === motionChapters.ovodan ? bottleCommand.yaw : 0; });
    invalidate();
  }, [chapter, bottleCommand, invalidate]);

  useFrame((_, delta) => {
    if (performance.now()-lastScroll.current > 150) scrolling.current = false;
    // ON已移出视口后才连续切换至原欧福灯光，完整保留ON已确认的印刷颜色。
    const lightMix = MathUtils.smoothstep(progress.current, .86, 1);
    const ambient = scene.getObjectByName("on-studio-ambient") as AmbientLight | undefined;
    if (ambient) ambient.intensity = MathUtils.lerp(Math.PI,1.45,lightMix);
    if (ovoKey.current) ovoKey.current.intensity = 2.1*lightMix;
    if (ovoRim.current) ovoRim.current.intensity = 1.5*lightMix;
    if (ovoFill.current) ovoFill.current.intensity = .25*lightMix;
    scene.environmentIntensity = 1-lightMix;
    for (const actor of bottleRefs.current) actor.traverse(object => {
      if (!(object instanceof Mesh)) return;
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        if (material instanceof MeshStandardMaterial) material.envMapIntensity = 0;
      }
    });
    if (qa) {
      scene.updateMatrixWorld(true);
      const tub = scene.getObjectByName("on-whole-tub");
      if (tub) {
        const landmarks = { capTop: [0,1.339,0], capRib: [.663,1.22,0], shoulder: [1,.65,0], base: [.85,-1.47,0], label: [0,-.4,1.032] };
        const points = Object.fromEntries(Object.entries(landmarks).map(([name,xyz]) => {
          const world = tub.localToWorld(new Vector3(...xyz)), projected = world.clone().project(camera);
          return [name, { world: world.toArray(), screen: [(.5+projected.x/2)*gl.domElement.clientWidth,(.5-projected.y/2)*gl.domElement.clientHeight] }];
        }));
        (window as Window & { __ON_MOTION_QA__?: unknown }).__ON_MOTION_QA__ = {
          progress: progress.current, scrolling: scrolling.current, gray, points,
          matrix: tub.matrixWorld.toArray(), camera: camera.type,
          actors: photoRefs.current.map(actor => ({ position: actor.position.toArray(), rotation: actor.rotation.toArray().slice(0,3), scale: actor.scale.x })),
          calls: gl.info.render.calls, triangles: gl.info.render.triangles,
        };
      }
    }
    if (chapter !== motionChapters.ovodan) return;
    for (let i = 0; i < 2; i++) {
      const model = rotatingRefs.current[i], flavor = ovodanFlavors[i].id;
      if (!model || (mobile && flavor !== selectedFlavor)) continue;
      model.rotation.y = advanceHeroBottleYaw(model.rotation.y, delta, chapter, running, labelStatus[flavor] === "ready");
      if (!mobile && i === 0 || mobile && flavor === selectedFlavor) onBottleAngle(model.rotation.y);
    }
  });

  return <>
    <OnStudioLighting />
    <directionalLight ref={ovoKey} position={[-3.5, 4.5, 5]} intensity={0} />
    <directionalLight ref={ovoRim} position={[3, 2, -4]} intensity={0} />
    <directionalLight ref={ovoFill} position={[2, .5, 4]} intensity={0} />
    <group ref={entranceRef}>
      {[0, 1].map((flavor, i) => <group key={i} ref={(node) => { if (node) bottleRefs.current[i] = node; }}
        visible={!mobile || ovodanFlavors[flavor].id === selectedFlavor}>
        <Float enabled={running} speed={1.4} rotationIntensity={.2} floatIntensity={.24} floatingRange={[-.1, .1]} autoInvalidate={running}>
          <group ref={(node) => { if (node) rotatingRefs.current[i] = node; }}>
            {i < 2 && (!mobile || ovodanFlavors[flavor].id === selectedFlavor) ?
              <LabelBoundary flavor={ovodanFlavors[flavor].id} onFailure={onLabelFailed} fallback={<OvodanBottle texture={textures[flavor]} color={ovodanFlavors[flavor].color} />}>
                <Suspense fallback={<OvodanBottle texture={textures[flavor]} color={ovodanFlavors[flavor].color} />}>
                  <OvodanThreeFaceBottle flavor={ovodanFlavors[flavor].id} onReady={onLabelReady} />
                </Suspense>
              </LabelBoundary> : <OvodanBottle texture={textures[flavor]} color={ovodanFlavors[flavor].color} />}
          </group>
        </Float>
      </group>)}
      {motionOnProducts.map((product, i) => <group key={product.id} ref={(node) => { if (node) photoRefs.current[i] = node; }}>
        {i === 0 ? <OnHeroProduct mobile={mobile} chapter={chapter} running={running} inspecting={goldInspecting} ready={goldReady} command={goldCommand} onAngle={onGoldAngle} onReady={onGoldReady} scrolling={scrolling} scrollYaw={scrollYaw} targetYaw={targetYaw} gray={gray} /> :
        <Float enabled={running} speed={1.1} rotationIntensity={.25} floatIntensity={.22} floatingRange={[-.08, .08]} autoInvalidate={running}>
          <mesh visible={!mobile || chapter !== 1}>
            <planeGeometry args={[bottleHeight*product.image.asset.width/product.image.asset.height, bottleHeight]} />
            <meshBasicMaterial map={textures[i+2]} transparent alphaTest={.025} toneMapped={false} />
          </mesh>
        </Float>}
      </group>)}
    </group>
  </>;
}

export default function MotionCanvas(props: Props) {
  const { onProgress } = props;
  useEffect(() => onProgress("module"), [onProgress]);
  return <CanvasBoundary onFailure={props.onFailure}>
    <Canvas camera={{ position: [0, 0, 12], fov: 30, near: .1, far: 60 }}
      dpr={[1, props.mobile ? 1.25 : 1.5]} frameloop={props.skyActive ? "never" : props.running ? "always" : "demand"}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power", outputColorSpace: SRGBColorSpace, toneMapping: ACESFilmicToneMapping }}
      onCreated={() => props.onProgress("canvas")}
      // Canvas的fallback始终是canvas的DOM子节点，不能在其中执行失败回调。
      // WebGL初始化失败由CanvasBoundary捕获，保留外层完整静态商品。
      fallback="当前浏览器无法显示商品悬浮画面。">
      <Suspense fallback={null}><Scene {...props} /></Suspense>
    </Canvas>
  </CanvasBoundary>;
}
