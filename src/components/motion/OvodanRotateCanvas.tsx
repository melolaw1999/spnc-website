"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Group, SRGBColorSpace } from "three";
import { OvodanLabelFlavor } from "@/data/ovodan-labels";
import { advanceBottleYaw, applyBottlePose, BottlePose } from "@/lib/bottle-rotation";
import { OvodanThreeFaceBottle } from "./OvodanThreeFaceBottle";

export type RotateCanvasProps = {
  pose: BottlePose;
  running: boolean;
  onAngle: (pose: BottlePose) => void;
  onReady: () => void;
  onFailure: (message: string) => void;
  flavor: OvodanLabelFlavor;
};

function BottleScene({ pose, running, onAngle, onFailure, onReady, flavor }: RotateCanvasProps) {
  const model = useRef<Group>(null);
  const { camera, gl, invalidate } = useThree();

  useEffect(() => {
    camera.lookAt(0, 0, 0); camera.updateProjectionMatrix(); invalidate();
    const lost = (event: Event) => { event.preventDefault(); onFailure("WebGL上下文已中断"); };
    gl.domElement.addEventListener("webglcontextlost", lost);
    const frame = requestAnimationFrame(() => { invalidate(); onReady(); });
    return () => { cancelAnimationFrame(frame); gl.domElement.removeEventListener("webglcontextlost", lost); };
  }, [camera, gl, invalidate, onReady, onFailure]);

  useEffect(() => {
    if (!model.current) return;
    applyBottlePose(model.current.rotation, pose);
    onAngle(pose); invalidate();
  }, [pose, invalidate, onAngle]);

  useFrame((_, delta) => {
    if (!model.current || !running) return;
    model.current.rotation.y = advanceBottleYaw(model.current.rotation.y, delta, true);
    onAngle({ yaw: model.current.rotation.y, tilt: model.current.rotation.x });
  });

  return <>
    <ambientLight intensity={1.45} />
    <directionalLight position={[-3.5, 4.5, 5]} intensity={2.1} castShadow
      shadow-mapSize={[1024, 1024]} shadow-camera-left={-3} shadow-camera-right={3}
      shadow-camera-top={4} shadow-camera-bottom={-3} shadow-camera-near={.5} shadow-camera-far={18}
      shadow-bias={-.0003} shadow-normalBias={.025} />
    <directionalLight position={[3, 2, -4]} intensity={1.5} />
    <directionalLight position={[2, .5, 4]} intensity={.25} />
    <group ref={model}><OvodanThreeFaceBottle flavor={flavor} /></group>
    <mesh position-y={-1.605} rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[12, 12]} /><shadowMaterial transparent opacity={.17} />
    </mesh>
  </>;
}

export default function OvodanRotateCanvas(props: RotateCanvasProps) {
  return <Canvas camera={{ position: [0, .4, 7.4], fov: 32, near: .1, far: 30 }} shadows
    dpr={[1, 1.4]} frameloop={props.running ? "always" : "demand"}
    gl={{ antialias: true, alpha: true, powerPreference: "low-power", outputColorSpace: SRGBColorSpace }}
    // R3F始终渲染fallback为canvas子节点；此处禁止调用失败回调。
    fallback="当前浏览器无法显示三维样品，请查看原始正面图。">
    <Suspense fallback={null}><BottleScene key={props.flavor} {...props} /></Suspense>
  </Canvas>;
}
