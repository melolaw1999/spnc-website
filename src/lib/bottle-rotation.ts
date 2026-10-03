import type { Euler } from "three";

export type BottlePose = { yaw: number; tilt: number };
export const bottleRotationSpeed = Math.PI / 8; // 16秒完成一周，暂停后无惯性。
export const frontProjectionHalfAngle = 55 * Math.PI / 180;

export function applyBottlePose(rotation: Euler, pose: BottlePose) {
  // 先绕瓶身旋转，再朝镜头俯仰；任何侧面/背面角度都可看到盖或底。
  rotation.set(pose.tilt, pose.yaw, 0, "XYZ");
}

export function rotationDegrees(yaw: number) {
  return ((yaw * 180 / Math.PI) % 360 + 360) % 360;
}

export function advanceBottleYaw(yaw: number, delta: number, running: boolean) {
  if (!running) return yaw;
  // 离屏恢复时不跳过角度，旋转始终只作用于Y轴的真实几何。
  return (yaw + Math.max(0, Math.min(delta, .05)) * bottleRotationSpeed) % (Math.PI * 2);
}

export function draggedBottleYaw(initialYaw: number, distance: number, stageWidth: number) {
  return initialYaw + distance / Math.max(1, stageWidth) * Math.PI * 2;
}
