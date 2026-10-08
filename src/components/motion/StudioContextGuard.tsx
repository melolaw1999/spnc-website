"use client";
import { useEffect } from "react";
import { useThree } from "@react-three/fiber";

// R3F在正常卸载时主动释放上下文，监听必须先清理，避免误报永久故障。
export function StudioContextGuard({ onFailure }: { onFailure: () => void }) {
  const renderer = useThree(state => state.gl);
  useEffect(() => {
    const canvas = renderer.domElement;
    canvas.addEventListener("webglcontextlost", onFailure);
    return () => canvas.removeEventListener("webglcontextlost", onFailure);
  }, [renderer, onFailure]);
  return null;
}
