import { motionFrames, MotionPose } from "./product-motion";

// 同一外层负责滚动姿态；入场、静止时的浮动和用户旋转分别使用子层。
// 前后两个静止编队沿用原页面锚点，中间帧加入真正的俯仰、纵深和遮挡。
export const motionStops = [0, .23, .5, .64, .86, 1] as const;
export type ProductChoreography = { stops: readonly number[]; actors: MotionPose[][] };
export function productChoreography(mobile: boolean, aspect: number): ProductChoreography {
  const old = motionFrames(mobile, aspect);
  const gold = (frame: MotionPose, patch: Partial<MotionPose>) => ({ ...frame, ...patch });
  const first = old.photos[0].map(p => ({ ...p }));
  const range = old.photos[1].map(p => ({ ...p }));
  first[0] = gold(first[0], { y: first[0].y + (mobile ? 0 : .035), scale: first[0].scale * .89, rx: .17, rz: -.14, z: .45 });
  range[0] = gold(range[0], { y: range[0].y + (mobile ? 0 : .035), scale: range[0].scale * .94, rx: .22, ry: Math.PI * 2, rz: .10, z: .65 });
  const middle = first.map((p, i) => i === 0 ? gold(p, {
    x: mobile ? .045 : .27, y: mobile ? -.18 : .015, z: -1.15,
    scale: p.scale * .94, rx: -.30, ry: Math.PI, rz: .28,
  }) : gold(p, {
    x: mobile ? [-.26, .27, .25][i-1] : [.08, .39, .35][i-1],
    y: p.y + (i === 1 ? -.05 : .025), z: i === 1 ? -.2 : -2.8,
    rz: i === 1 ? -.13 : .13,
  }));
  const lift = range.map((p, i) => gold(p, {
    x: p.x + (mobile ? .045 : .015), y: p.y + .035,
    z: i === 0 ? 1.4 : p.z - .5,
    rx: i === 0 ? .35 : 0, ry: i === 0 ? Math.PI * 2.3 : 0,
    rz: i === 0 ? -.25 : p.rz - .10,
  }));
  // 出场先移到视口外，再关闭可见性；避免在章节标题切换时突然换瓶。
  const exit = range.map((p, i) => gold(p, {
    x: 1.1 + i*.15, y: mobile ? -.05 : .40 + i*.1, z: -2.2-i,
    rx: i === 0 ? .95 : 0, ry: i === 0 ? Math.PI*3.25 : 0,
    rz: i === 0 ? -.85 : -.35,
  }));
  const settledBottles = old.bottles[2];
  const waitingBottles = settledBottles.map((p, i) => gold(p, { x: p.x + .12, y: p.y-1.25, z: -1.6, rx: .32, rz: i ? -.4 : .4 }));
  const incomingBottles = settledBottles.map((p, i) => gold(p, { x: p.x + .035, y: p.y-.06, z: -.2, rx: .10, rz: i ? -.10 : .10 }));
  const photos = [first, middle, range, lift, exit, exit];
  const bottles = [waitingBottles, waitingBottles, waitingBottles, waitingBottles, incomingBottles, settledBottles];
  return { stops: motionStops, actors: photos.map((frame, i) => [...bottles[i], ...frame]) };
}

// 不从全局时钟读取：暂停和滚动时冻结自身时间，恢复不会跳相位。
export function goldIdlePose(time: number) {
  return { x: .13 * Math.sin(time * .78), z: .105 * Math.sin(time * .63), y: .035 * Math.sin(time * .9) };
}

// 手动选正/背面按滚动最终停留角度补偿，避免scrub仍在收尾时产生角度偏差。
export function choreographyYawAt(motion: ProductChoreography, progress: number) {
  const p=Math.max(0,Math.min(1,progress));
  const end=motion.stops.findIndex(stop=>stop>=p);
  if(end<=0)return motion.actors[0][2].ry;
  const t=(p-motion.stops[end-1])/(motion.stops[end]-motion.stops[end-1]);
  const eased=(1-Math.cos(t*Math.PI))/2;
  return motion.actors[end-1][2].ry+(motion.actors[end][2].ry-motion.actors[end-1][2].ry)*eased;
}
