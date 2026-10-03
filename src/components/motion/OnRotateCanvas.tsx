"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { Group, NoToneMapping, Quaternion, SRGBColorSpace, Vector3 } from "three";
import { advanceBottleYaw, applyBottlePose, BottlePose } from "@/lib/bottle-rotation";
import { OnGoldTub } from "./OnGoldTub";
import { OnChocolateTub } from "./OnChocolateTub";
import { OnSampleVariant } from "@/data/on-chocolate-label";
import { OnStudioLighting } from "./OnStudioLighting";
import { goldIdlePose } from "@/lib/on-choreography";

export type OnRotateProps = { variant: OnSampleVariant; pose: BottlePose; running: boolean; inspecting: boolean; reducedMotion: boolean; onAngle: (pose: BottlePose) => void; onReady: () => void; onFailure: (message: string) => void };

function Scene({ variant, pose, running, inspecting, reducedMotion, onAngle, onReady, onFailure }: OnRotateProps) {
  const model = useRef<Group>(null);
  const wholePose = useRef<Group>(null), idleTime = useRef(0);
  const supportRotation = useRef(new Quaternion()), vertical = useRef(new Vector3());
  const { camera, gl, invalidate, size } = useThree();
  // 细看层较窄时按真实画幅重新留边；放大不能切掉罐盖或罐底。
  const fit = Math.min(1, (size.width / Math.max(1, size.height)) * 3.9 / 2.65);
  const targetZoom = fit * (inspecting ? 1.06 : 1);
  useEffect(() => { invalidate(); }, [targetZoom, invalidate]);
  useEffect(() => {
    camera.lookAt(0, -.07, 0); camera.updateProjectionMatrix(); invalidate();
    const lost = (event: Event) => { event.preventDefault(); onFailure("三维画面已中断，可继续查看真实包装原图。"); };
    gl.domElement.addEventListener("webglcontextlost", lost);
    const frame = requestAnimationFrame(() => { invalidate(); onReady(); });
    return () => { cancelAnimationFrame(frame); gl.domElement.removeEventListener("webglcontextlost", lost); };
  }, [camera, gl, invalidate, onReady, onFailure]);
  useEffect(() => { if (model.current) { applyBottlePose(model.current.rotation, pose); onAngle(pose); invalidate(); } }, [pose, invalidate, onAngle]);
  useFrame((_, delta) => {
    if (Math.abs(camera.zoom - targetZoom) > .0001) {
      camera.zoom = reducedMotion ? targetZoom : camera.zoom + (targetZoom - camera.zoom) * (1 - Math.exp(-delta * 6));
      camera.updateProjectionMatrix(); invalidate();
    }
    if (model.current && wholePose.current && running && !inspecting && !reducedMotion) {
      idleTime.current += Math.min(delta, .05);
      const idle = goldIdlePose(idleTime.current);
      wholePose.current.rotation.set(idle.x,0,idle.z);
      model.current.rotation.y = advanceBottleYaw(model.current.rotation.y, delta * .65, true);
      onAngle({ yaw: model.current.rotation.y, tilt: 0 });
    }
    if (model.current && wholePose.current) {
      // 根据实际姿态计算罐底支撑高度，避免俯仰时穿过地面或阴影脱离。
      supportRotation.current.copy(wholePose.current.quaternion).multiply(model.current.quaternion).invert();
      vertical.current.set(0,1,0).applyQuaternion(supportRotation.current);
      const radial = Math.hypot(vertical.current.x,vertical.current.z);
      const lower = Math.min(...[[.85,-1.47],[1.03,-1.29],[1.03,.48],[.85,.925],[.664,1.339]].map(([r,y]) => y*vertical.current.y-r*radial));
      wholePose.current.position.y = -1.47-lower;
    }
  });
  return <>
    <OnStudioLighting />
    <group ref={wholePose}><group ref={model}>{variant === "chocolate" ? <OnChocolateTub /> : <OnGoldTub />}</group></group>
    <ContactShadows position={[0,-1.48,0]} opacity={.25} scale={5} blur={1.8} far={2} resolution={256} frames={Infinity} color="#151515" />
  </>;
}

export default function OnRotateCanvas(props: OnRotateProps) {
  return <Canvas camera={{ position: [0,.58,8.8], fov: 25, near: .1, far: 40 }}
    dpr={[1,1.5]} frameloop={props.running ? "always" : "demand"}
    gl={{ antialias: true, alpha: true, powerPreference: "low-power", outputColorSpace: SRGBColorSpace, toneMapping: NoToneMapping }}
    fallback="当前浏览器无法显示三维样品，可查看完整真实包装原图。">
    <Suspense fallback={null}><Scene key={props.variant} {...props} /></Suspense>
  </Canvas>;
}
