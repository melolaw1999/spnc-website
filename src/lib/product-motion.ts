export type MotionPose = { x: number; y: number; z: number; scale: number; rx: number; ry: number; rz: number };
const pose = (x: number, y: number, scale: number, rz = 0, z = 0): MotionPose => ({ x, y, scale, rz, z, rx: 0, ry: 0 });
export const sourceYawLimit = 0.12;

export const motionChapters = { intro: 0, on: 1, ovodan: 2, sky: 3 } as const;
export const mobileSkyRange = [.45, .85] as const;
export function mobileMotionChapterAt(progress: number) {
  return progress < 1 / 6 ? motionChapters.intro : progress < mobileSkyRange[0] ? motionChapters.on
    : progress < mobileSkyRange[1] ? motionChapters.sky : motionChapters.ovodan;
}
export function mobileMotionTarget(chapter: number) {
  return chapter === motionChapters.sky ? .65 : chapter === motionChapters.on ? 1 / 3 : chapter === motionChapters.ovodan ? 1 : 0;
}

// x/y按画面宽高归一化。首屏金标为主，ON系列居次，欧福独立在最后一段。
export function motionFrames(mobile: boolean, aspect = 1.6): { bottles: MotionPose[][]; photos: MotionPose[][] } {
  const bottles = mobile ? [
    pose(0, -.185, .38), pose(0, -.185, .38),
  ] : [
    pose(.18, -.015, .53, .035), pose(.37, -.015, .53, -.035),
  ];
  const hiddenBottles = bottles.map((item) => ({ ...item, y: item.y - .7, scale: .001 }));
  // 金标位置由完整DRC模型复用；其余ON位置仅陈列核验后的正面照片。
  const entrance = mobile ? [
    pose(0, -.17, .55, -.04, 1), pose(-.27, -.10, .28, .10, -2),
    pose(.27, -.075, .31, -.10, -2), pose(.26, -.26, .22, -.12, -1),
  ] : [
    pose(.24, -.035, .86, -.055, 1), pose(.075, .20, .40, .10, -2),
    pose(.38, .14, .44, -.10, -2), pose(.38, -.215, .28, -.10, -1),
  ];
  const range = mobile ? [
    pose(-.09, -.185, .46, -.04, 1), pose(-.285, -.085, .25, .10, -2),
    pose(.24, -.125, .29, -.10, -2), pose(.22, -.255, .24, -.10, -1),
  ] : [
    pose(.22, -.08, .68, -.055, 1), pose(.065, .18, .40, .10, -2),
    pose(.38, .14, .43, -.10, -2), pose(.38, -.21, .30, -.10, -1),
  ];
  // 辅助罐按手机宽度收缩，保证310~390窄屏和竖高窗口不截断包装。
  const onMobileScale = mobile ? Math.min(1, Math.max(.1, aspect) / (390 / 772)) : 1;
  const fitOn = (frame: MotionPose[]) => frame.map((item) => ({ ...item, scale: item.scale * onMobileScale }));
  const hiddenPhotos = range.map((item) => ({ ...item, y: item.y + .7, scale: .001 }));
  const scaleLimit = mobile ? 1 : Math.min(1, Math.max(.1, aspect) / 1.45);
  const fit = (frame: MotionPose[]) => frame.map((item) => ({ ...item, scale: item.scale * scaleLimit }));
  return { bottles: [hiddenBottles, hiddenBottles, bottles].map(fit), photos: [entrance, range, hiddenPhotos].map(fitOn).map(fit) };
}

export function motionChapterAt(progress: number) {
  return Math.min(2, Math.max(0, Math.round(Math.max(0, Math.min(1, progress)) * 2)));
}

export function motionScrollTarget(top: number, sectionHeight: number, frameHeight: number, navHeight: number, chapter: number) {
  return Math.max(0, top - navHeight + Math.max(0, sectionHeight - frameHeight) * Math.min(2, Math.max(0, chapter)) / 2);
}

export type MotionLoadState = { loaded: boolean; failed: boolean; delayed: boolean };
export const initialMotionLoadState: MotionLoadState = { loaded: false, failed: false, delayed: false };
export function motionLoadReducer(state: MotionLoadState, action: "ready" | "slow" | "failed"): MotionLoadState {
  if (action === "failed") return { loaded: false, failed: true, delayed: false };
  if (state.failed || state.loaded) return state;
  if (action === "ready") return { loaded: true, failed: false, delayed: false };
  // 等待较久不等于贴图或WebGL损坏：保留正在加载的Canvas，以便稍后恢复。
  return { ...state, delayed: true };
}

type LoadingVisibility = {
  readonly hidden: boolean;
  addEventListener(type: "visibilitychange", listener: () => void): void;
  removeEventListener(type: "visibilitychange", listener: () => void): void;
};
export function watchMotionLoading(visibility: LoadingVisibility, onSlow: () => void, waitMs = 12000) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const update = () => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
    // 隐藏标签页的rAF可能暂停，返回后给予一次完整的可见加载等待时间。
    if (!visibility.hidden) timer = setTimeout(onSlow, waitMs);
  };
  visibility.addEventListener("visibilitychange", update);
  update();
  return () => {
    if (timer !== undefined) clearTimeout(timer);
    visibility.removeEventListener("visibilitychange", update);
  };
}
