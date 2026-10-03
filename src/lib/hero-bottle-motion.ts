import { motionChapters } from "@/lib/product-motion";
import { advanceBottleYaw } from "@/lib/bottle-rotation";
import type { OvodanLabelFlavor } from "@/data/ovodan-labels";

export type HeroBottleCommand = { yaw: number; revision: number };
export type HeroLabelStatus = Record<OvodanLabelFlavor, "idle" | "ready" | "failed">;

export function advanceHeroBottleYaw(yaw: number, delta: number, chapter: number, running: boolean, ready: boolean) {
  return advanceBottleYaw(yaw, delta, chapter === motionChapters.ovodan && running && ready);
}

export function advanceHeroGoldYaw(yaw: number, delta: number, chapter: number, running: boolean, ready: boolean, inspecting: boolean) {
  return advanceBottleYaw(yaw, delta * .65, chapter !== motionChapters.ovodan && running && ready && !inspecting);
}

export const heroGoldModel = { height: 2.809, width: 2.06, centerY: -.0655, pitch: .074, desktopFit: .75, mobileFit: .72, inspectZoom: 1.06 } as const;
