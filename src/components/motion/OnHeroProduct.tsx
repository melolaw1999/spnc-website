"use client";

import { MutableRefObject, useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Group } from "three";
import { bottleHeight } from "@/lib/ovodan-geometry";
import { advanceHeroGoldYaw, HeroBottleCommand, heroGoldModel } from "@/lib/hero-bottle-motion";
import { OnChocolateTub } from "./OnChocolateTub";
import { motionChapters } from "@/lib/product-motion";
import { goldIdlePose } from "@/lib/on-choreography";

type Props = { mobile: boolean; chapter: number; running: boolean; inspecting: boolean; ready: boolean; command: HeroBottleCommand; onAngle: (yaw: number) => void; onReady: () => void; scrolling: MutableRefObject<boolean>; scrollYaw: MutableRefObject<number>; targetYaw: MutableRefObject<number>; gray: boolean };

export function OnHeroProduct({ mobile, chapter, running, inspecting, ready, command, onAngle, onReady, scrolling, scrollYaw, targetYaw, gray }: Props) {
  const rotating = useRef<Group>(null), zoom = useRef<Group>(null), idle = useRef<Group>(null), time = useRef(0);
  const { invalidate } = useThree();
  const base = bottleHeight / heroGoldModel.height * (mobile ? heroGoldModel.mobileFit : heroGoldModel.desktopFit);
  const target = base * (inspecting ? heroGoldModel.inspectZoom : 1);
  useEffect(() => { invalidate(); }, [target, invalidate]);
  useEffect(() => {
    if (rotating.current) { rotating.current.rotation.y = command.yaw - targetYaw.current; onAngle(command.yaw); invalidate(); }
  }, [command, onAngle, invalidate, targetYaw]);
  useFrame((_, delta) => {
    if (zoom.current && Math.abs(zoom.current.scale.x - target) > .0001) {
      zoom.current.scale.setScalar(zoom.current.scale.x + (target - zoom.current.scale.x) * (1 - Math.exp(-delta * 6)));
      invalidate();
    }
    const moving = running && !scrolling.current && !inspecting && ready && chapter !== motionChapters.ovodan;
    if (idle.current && moving) {
      time.current += Math.min(delta, .05);
      const pose = goldIdlePose(time.current);
      idle.current.rotation.set(pose.x, 0, pose.z);
      idle.current.position.y = pose.y;
    }
    if (rotating.current) {
      rotating.current.rotation.y = advanceHeroGoldYaw(rotating.current.rotation.y, delta, chapter, running && !scrolling.current, ready, inspecting);
      onAngle(rotating.current.rotation.y + scrollYaw.current);
    }
  });
  return <group ref={zoom} scale={base}>
    <group ref={idle} name="on-idle-pose">
      <group rotation-x={heroGoldModel.pitch}><group ref={rotating}><group position-y={-heroGoldModel.centerY}>
        <OnChocolateTub onReady={onReady} gray={gray} />
      </group></group></group>
    </group>
  </group>;
}
