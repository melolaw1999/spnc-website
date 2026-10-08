"use client";
import { StudioContextGuard } from "./StudioContextGuard";
import { MutableRefObject, RefObject, Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Group, MathUtils, NoToneMapping } from "three";
import { OnChocolateTub } from "./OnChocolateTub";
import { OnStudioLighting } from "./OnStudioLighting";
import { smooth } from "@/lib/studio-motion";
type Props={section:RefObject<HTMLElement|null>;progress:MutableRefObject<number>;sky:boolean;running:boolean;onReady:()=>void;onFailure:()=>void};
function Hero({progress,running,onReady,sky}:Props){
 const group=useRef<Group>(null),current=useRef(0),time=useRef(0),frames=useRef(0);
 const {viewport,invalidate}=useThree();
 useEffect(()=>{invalidate();},[invalidate]);
 useFrame((_,delta)=>{
  if(!group.current)return;
  if(running){current.current=MathUtils.damp(current.current,progress.current,7,Math.min(delta,.05));time.current+=Math.min(delta,.05);}
  const p=smooth(current.current),t=time.current;
  group.current.rotation.set(.08+.12*p+Math.sin(t*.45)*.035,sky?.25-.55*p:-.18+.55*p,sky?.18-.28*p:-.10+.16*p);
  group.current.position.set((sky?-.12:.09)*Math.sin(p*Math.PI),Math.sin(t*.5)*.035,sky?.12*Math.sin(p*Math.PI):0);
  group.current.scale.setScalar(Math.min(viewport.width/3.15,viewport.height/3.9)*(sky?.90+.08*p:1));
  if(frames.current++===2)onReady();
 });
 return <><group ref={group}><OnChocolateTub motionSurface/></group><OnStudioLighting motion resolution={128}/></>;
}
export default function MobileOnStudio(props:Props){return <Canvas camera={{position:[0,0,5],fov:34,near:.1,far:40}} dpr={[1,1.25]} frameloop={props.running?"always":"demand"} gl={{antialias:true,alpha:true,powerPreference:"low-power",toneMapping:NoToneMapping}} ><StudioContextGuard onFailure={props.onFailure}/><Suspense fallback={null}><Hero {...props}/></Suspense></Canvas>;}
