"use client";

import { useEffect, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Color, MeshStandardMaterial, SRGBColorSpace, Vector3 } from "three";
import { onChocolateLabel } from "@/data/on-chocolate-label";
import { createChocolateLabelGeometry } from "@/lib/on-chocolate-geometry";
import { OnTubShell } from "./OnGoldTub";

export function OnChocolateTub({ onReady, gray = false, motionSurface = false }: { onReady?: () => void; gray?: boolean; motionSurface?: boolean } = {}) {
  const scene = useThree((state) => state.scene);
  const texture = useTexture(onChocolateLabel.texture);
  const geometry = useMemo(createChocolateLabelGeometry, []);
  useEffect(() => { const frame = requestAnimationFrame(() => onReady?.()); return () => cancelAnimationFrame(frame); }, [onReady]);
  texture.colorSpace = SRGBColorSpace; texture.anisotropy = 8;
  const material = useMemo(() => {
    const printed = new MeshStandardMaterial({ map: texture, roughness: motionSurface ? .46 : .62, metalness: 0, envMapIntensity: motionSurface ? .10 : .04, toneMapped: false });
    printed.name = "ON original artwork · deep black display ink";
    const inkRatio = (kind: "red" | "gold") => {
      const source = new Color(onChocolateLabel.displayInk[kind].source), target = new Color(onChocolateLabel.displayInk[kind].target);
      return new Vector3(target.r/source.r,target.g/source.g,target.b/source.b);
    };
    printed.onBeforeCompile = (shader) => {
      // 原始PDF与贴图不变。只在已正确解码的线性颜色上压低近中性暗墨：
      // 35/31/32与46/43/44两档斜纹变为隐约黑纹，不对整张标签套gamma。
      // 明亮奶金文字、金条和有色红底不落入掩码，原QR/条码内容及UV不变。
      shader.uniforms.onRedInkRatio = { value: inkRatio("red") };
      shader.uniforms.onGoldInkRatio = { value: inkRatio("gold") };
      shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\nuniform vec3 onRedInkRatio;\nuniform vec3 onGoldInkRatio;");
      shader.fragmentShader = shader.fragmentShader.replace("#include <map_fragment>", `#include <map_fragment>
        vec3 sourceInk = diffuseColor.rgb;
        float inkMax = max(diffuseColor.r, max(diffuseColor.g, diffuseColor.b));
        float inkMin = min(diffuseColor.r, min(diffuseColor.g, diffuseColor.b));
        float inkChroma = (inkMax - inkMin) / max(inkMax, 0.0001);
        float darkInk = (1.0 - smoothstep(0.04, 0.10, inkMax)) * (1.0 - smoothstep(0.20, 0.38, inkChroma));
        float inkLuma = dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(inkLuma * 0.22), darkInk);
        float inkGreenRed = sourceInk.g / max(sourceInk.r, 0.0001);
        float inkBlueRed = sourceInk.b / max(sourceInk.r, 0.0001);
        float inkBlueGreen = sourceInk.b / max(sourceInk.g, 0.0001);
        float redInk = smoothstep(0.08, 0.18, sourceInk.r) * (1.0 - smoothstep(0.12, 0.22, inkGreenRed)) * (1.0 - smoothstep(0.14, 0.24, inkBlueRed));
        float goldInk = smoothstep(0.15, 0.30, sourceInk.r) * smoothstep(0.18, 0.30, inkGreenRed) * (1.0 - smoothstep(0.60, 0.75, inkGreenRed)) * (1.0 - smoothstep(0.30, 0.55, inkBlueGreen));
        diffuseColor.rgb *= mix(vec3(1.0), onRedInkRatio, redInk);
        diffuseColor.rgb *= mix(vec3(1.0), onGoldInkRatio, goldInk);
      `);
    };
    printed.customProgramCacheKey = () => "on-chocolate-local-red-dark-gold-v16";
    return printed;
  }, [texture, motionSurface]);
  useFrame(() => {
    // 当前Three在材质envMap为空时会用scene.environmentIntensity覆盖独立强度。
    // 显式复用同一环境纹理，让纸质标签保持低反光，塑料仍使用场景轮廓光。
    if (scene.environment && material.envMap !== scene.environment) {
      material.envMap = scene.environment;
      material.needsUpdate = true;
    }
  });
  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);
  return <OnTubShell gray={gray} motionSurface={motionSurface}><mesh name="on-label" geometry={geometry} material={gray ? undefined : material}>
    {gray && <meshStandardMaterial color="#777777" roughness={.5} toneMapped={false} />}
  </mesh></OnTubShell>;
}
