// 本机预览的初始化诊断。不记录用户数据、完整地址或调用栈。
export type MotionInitPhase = "pending" | "module" | "canvas" | "textures" | "ready";
export type MotionFailure = { stage: "module" | "canvas" | "texture" | "webgl"; code: string; message: string };
export const motionPhaseOrder: Record<MotionInitPhase, number> = { pending: 0, module: 1, canvas: 2, textures: 3, ready: 4 };

export function motionFailure(stage: MotionFailure["stage"], error: unknown): MotionFailure {
  const code = error instanceof Error ? error.name : "MotionError";
  const raw = error instanceof Error ? error.message : String(error);
  const message = raw.replace(/https?:\/\/[^\s)]+/g, "[资源地址]").replace(/[\r\n]+/g, " ").slice(0, 400);
  return { stage, code, message };
}
