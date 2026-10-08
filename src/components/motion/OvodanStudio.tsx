"use client";
import { StudioContextGuard } from "./StudioContextGuard";
import { MutableRefObject, Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Group, MathUtils, NoToneMapping } from "three";
import { OvodanLabelFlavor } from "@/data/ovodan-labels";
import { ovodanPose } from "@/lib/studio-motion";
import { OvodanThreeFaceBottle } from "./OvodanThreeFaceBottle";

type Props = { progress: MutableRefObject<number>; running: boolean; flavor: OvodanLabelFlavor; onReady: () => void; onFailure: () => void };
function Scene({ progress, running, flavor, onReady }: Props) {
  const bottles = useRef<Group[]>([]), current = useRef(0), selection = useRef(0), started = useRef(false);
  const { camera, viewport, invalidate } = useThree();
  useEffect(() => { camera.position.set(0,1,8.8); camera.lookAt(0,-.12,0); camera.updateProjectionMatrix(); invalidate(); }, [camera, invalidate]);
  useEffect(() => { invalidate(); }, [flavor, invalidate]);
  useFrame((_, delta) => {
    if (running || !started.current) current.current = MathUtils.damp(current.current, progress.current, 7, Math.min(delta,.05));
    selection.current = MathUtils.damp(selection.current, flavor === "strawberry" ? 1 : 0, 6, Math.min(delta,.05));
    const fit = Math.min(1, viewport.width / 3.6);
    bottles.current.forEach((bottle,i) => {
      const main = ovodanPose(current.current), back = ovodanPose(current.current,true);
      const blend = i === 0 ? selection.current : 1-selection.current;
      const mix = (key: keyof typeof main) => MathUtils.lerp(main[key], back[key], blend);
      // 换位绕开彼此：中途沿前后弧线通过，避免两个实体穿插。
      const arc = Math.sin(selection.current * Math.PI) * (i === 0 ? .75 : -.75);
      bottle.position.set(mix("x")*fit, mix("y")-.05, mix("z") + arc);
      bottle.rotation.set(.035, mix("yaw"), mix("tilt")); bottle.scale.setScalar(mix("scale")*fit);
    });
    if (!started.current) { started.current=true; onReady(); }
    if (Math.abs(selection.current-(flavor === "strawberry"?1:0))>.001) invalidate();
  });
  return <>
    <ambientLight intensity={1.35} />
    <directionalLight position={[-3,6,4]} intensity={2.1} castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-5} shadow-camera-right={5} shadow-camera-top={6} shadow-camera-bottom={-5} shadow-normalBias={.025} shadow-bias={-.00015} shadow-radius={4} />
    <directionalLight position={[4,2,-3]} intensity={.8} />
    {(["passionfruit","strawberry"] as const).map((item,i)=><group key={item} ref={node=>{if(node)bottles.current[i]=node;}}><OvodanThreeFaceBottle flavor={item}/></group>)}
    <mesh rotation-x={-Math.PI/2} position-y={-1.68} receiveShadow><planeGeometry args={[200,200]}/><shadowMaterial transparent opacity={.09}/></mesh>
  </>;
}
export default function OvodanStudio(props: Props) {
  return <Canvas shadows dpr={[1,1.35]} camera={{position:[0,1,8.8],fov:32,near:.1,far:40}} frameloop={props.running?"always":"demand"} gl={{antialias:true,alpha:true,powerPreference:"low-power",toneMapping:NoToneMapping}}
    >
    <StudioContextGuard onFailure={props.onFailure}/><Suspense fallback={null}><Scene {...props}/></Suspense>
  </Canvas>;
}
