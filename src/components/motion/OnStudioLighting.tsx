"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { memo } from "react";

// 首页与独立样品共用v14中性轮廓光，标签自带独立低反光设置。
export const OnStudioLighting = memo(function OnStudioLighting({ motion = false, resolution = 256 }: { motion?: boolean; resolution?: 128 | 256 }) {
  return <>
    <ambientLight name="on-studio-ambient" intensity={Math.PI} />
    <Environment resolution={resolution} frames={1} environmentIntensity={1}>
      {motion ? <>
        {/* 固定在世界空间的竖向柔光箱：反射随真实法线变化，不随屏幕游走。 */}
        <Lightformer intensity={3.2} position={[-3.2,1.8,4]} target={[0,0,0]} scale={[1.1,5,1]} />
        <Lightformer intensity={1.5} position={[4,.8,2]} target={[0,0,0]} scale={[.45,3,1]} />
        <Lightformer intensity={2.2} position={[-1,5,-2]} target={[0,0,0]} scale={[3,2,1]} />
      </> : <>
        <Lightformer intensity={4} position={[-4.8,3.5,-1.2]} target={[0,0,0]} scale={[3,4.5,1]} />
        <Lightformer intensity={1.5} position={[4.5,1.3,-3]} target={[0,0,0]} scale={[3,4,1]} />
        <Lightformer intensity={1.8} position={[-.8,5,-4]} target={[0,0,0]} scale={[3,3,1]} />
      </>}
    </Environment>
  </>;
});
