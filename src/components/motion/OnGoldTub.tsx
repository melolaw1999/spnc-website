"use client";

import { ReactNode, useEffect, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import { CubicBezierCurve, CylinderGeometry, DataTexture, LatheGeometry, QuadraticBezierCurve, RepeatWrapping, RGBAFormat, SRGBColorSpace, Vector2 } from "three";
import { onLabelViews } from "@/data/on-labels";
import { createOnLabelMaterial, onTub } from "@/lib/on-label-projection";

export function OnTubShell({ children, gray = false, motionSurface = false }: { children: ReactNode; gray?: boolean; motionSurface?: boolean }) {
  const body = useMemo(() => {
    // 包装稿宽高决定标签圆周，实物主图用于肩部、圆底和盖边的近似造型。
    // 保留标签原比例，不用拉伸原稿来补偿罐形。
    const bottom = Array.from({ length: 17 }, (_, i) => {
      const angle = -Math.PI / 2 + i / 16 * Math.PI / 2;
      return new Vector2(.85 + .18 * Math.cos(angle), -1.29 + .18 * Math.sin(angle));
    });
    const shoulder = new QuadraticBezierCurve(new Vector2(1.03,.48), new Vector2(1.03,.77), new Vector2(.85,.925)).getPoints(24);
    const neck = new CubicBezierCurve(new Vector2(.85,.925), new Vector2(.74,1.035), new Vector2(.62,1.035), new Vector2(.605,1.06)).getPoints(16);
    return new LatheGeometry([new Vector2(0,-1.47), ...bottom, ...shoulder, ...neck.slice(1), new Vector2(.605,1.145), new Vector2(0,1.145)], 128);
  }, []);
  const cap = useMemo(() => {
    const geometry = new LatheGeometry([[0,1.12],[.622,1.12],[.65,1.131],[.66,1.151],[.66,1.311],[.65,1.332],[.625,1.339],[0,1.339]].map(([r,y]) => new Vector2(r,y)), 384);
    const position = geometry.getAttribute("position");
    // 注塑盖的细密竖向抓握纹直接改变几何法线，不把光泽画在贴图上。
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i), y = position.getY(i), z = position.getZ(i), radius = Math.hypot(x,z);
      if (y >= 1.15 && y <= 1.312 && radius > .64) {
        const flute = .0038 * (.5 + .5*Math.cos(Math.atan2(x,z)*96));
        position.setXYZ(i, x*(1+flute/radius), y, z*(1+flute/radius));
      }
    }
    geometry.computeVertexNormals();
    return geometry;
  }, []);
  const grain = useMemo(() => {
    // 无文字的微小塑料颗粒，只影响表面法线，不更改标签纹理。
    const pixels = new Uint8Array(128 * 128 * 4);
    let seed = 37;
    for (let i = 0; i < pixels.length; i += 4) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      pixels[i] = pixels[i+1] = pixels[i+2] = 100 + (seed >>> 26);
      pixels[i+3] = 255;
    }
    const texture = new DataTexture(pixels,128,128,RGBAFormat);
    texture.wrapS = texture.wrapT = RepeatWrapping; texture.repeat.set(12,8); texture.needsUpdate = true;
    return texture;
  }, []);
  useEffect(() => () => { body.dispose(); cap.dispose(); grain.dispose(); }, [body, cap, grain]);
  return <group name="on-whole-tub">
    <mesh name="on-body" geometry={body} castShadow><meshPhysicalMaterial color={gray ? "#777777" : "#0b0b0b"} roughness={motionSurface ? .24 : .30} metalness={0} specularIntensity={.8} clearcoat={motionSurface ? .12 : .02} clearcoatRoughness={motionSurface ? .28 : .4} bumpMap={grain} bumpScale={.0022} toneMapped={false} /></mesh>
    {children}
    <mesh name="on-cap" geometry={cap} castShadow><meshPhysicalMaterial color={gray ? "#777777" : "#101010"} roughness={motionSurface ? .27 : .30} metalness={0} specularIntensity={.75} clearcoat={motionSurface ? .08 : .02} bumpMap={grain} bumpScale={.0012} toneMapped={false} /></mesh>
    <mesh name="on-neck-ring" position-y={1.096}><cylinderGeometry args={[.637,.637,.029,96]} /><meshStandardMaterial color={gray ? "#777777" : "#151515"} roughness={.43} toneMapped={false} /></mesh>
    <mesh position-y={1.104} rotation-x={Math.PI/2}><torusGeometry args={[.629,.011,12,96]} /><meshStandardMaterial color={gray ? "#777777" : "#161616"} roughness={.4} toneMapped={false} /></mesh>
  </group>;
}

export function OnGoldTub() {
  const textures = useTexture(onLabelViews.map((view) => view.image));
  const material = useMemo(() => {
    textures.forEach((texture) => { texture.colorSpace = SRGBColorSpace; texture.anisotropy = 4; });
    return createOnLabelMaterial(textures);
  }, [textures]);
  const label = useMemo(() => {
    const geometry = new CylinderGeometry(onTub.radius + .002, onTub.radius + .002, onTub.labelTop - onTub.labelBottom, 128, 32, true);
    geometry.translate(0, (onTub.labelTop + onTub.labelBottom) / 2, 0);
    return geometry;
  }, []);
  useEffect(() => () => { material.dispose(); label.dispose(); }, [material, label]);
  return <OnTubShell><mesh geometry={label} material={material} /></OnTubShell>;
}
