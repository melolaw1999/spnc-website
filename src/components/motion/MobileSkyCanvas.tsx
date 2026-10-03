"use client";

import { RefObject, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { NoToneMapping } from "three";
import { OnSkyDive } from "./OnSkyDive";

export default function MobileSkyCanvas({ section, progress, visible, running, onReady, onFailure }: {
  section: RefObject<HTMLElement | null>; progress: number; visible: boolean; running: boolean;
  onReady: () => void; onFailure: () => void;
}) {
  return <Canvas camera={{ position: [0,0,5], fov: 34, near: .1, far: 40 }} dpr={[1,1.25]}
    frameloop={!visible ? "never" : running ? "always" : "demand"}
    gl={{ antialias: true, alpha: true, powerPreference: "low-power", toneMapping: NoToneMapping }}
    onCreated={({ gl }) => gl.domElement.addEventListener("webglcontextlost", onFailure, { once: true })}>
    <Suspense fallback={null}><OnSkyDive section={section} mobile progress={progress} running={running && visible} onReady={onReady} /></Suspense>
  </Canvas>;
}
