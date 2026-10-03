"use client";

import { useEffect, useMemo, useRef } from "react";
import { BoxGeometry, InstancedMesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, Texture } from "three";
import { createOvodanGeometries } from "@/lib/ovodan-geometry";
import { frontProjectionHalfAngle } from "@/lib/bottle-rotation";
import { createOvodanLabelMaterial } from "@/lib/ovodan-label-projection";
import { OvodanLabelFlavor } from "@/data/ovodan-labels";

export function createOvodanBodyMaterials(texture: Texture, color: string, volumePreview = false) {
  if (volumePreview) return [
    // 仅体积样品打光；真实照片的原有光影使其不能用作印刷色校样。
    new MeshStandardMaterial({ map: texture, roughness: .72, metalness: 0, toneMapped: false }),
    new MeshStandardMaterial({ color: "#c8c8c3", roughness: .72, metalness: 0, toneMapped: false }),
  ];
  // 正面是已含光影的实物照片：保持sRGB原色，避免二次打光与ACES漂白。
  return [
    new MeshBasicMaterial({ map: texture, toneMapped: false }),
    new MeshStandardMaterial({ color, roughness: .62, toneMapped: false }),
  ];
}

export function OvodanBottle({ texture, color, volumePreview = false, labelTextures, labelFlavor = "strawberry" }: { texture: Texture; color: string; volumePreview?: boolean; labelTextures?: readonly [Texture, Texture, Texture]; labelFlavor?: OvodanLabelFlavor }) {
  const hasLabelTextures = Boolean(labelTextures);
  const geometry = useMemo(() => {
    const result = createOvodanGeometries(volumePreview ? frontProjectionHalfAngle : Math.PI / 2);
    if (hasLabelTextures) { result.body.clearGroups(); result.body.addGroup(0, result.body.getIndex()!.count, 0); }
    return result;
  }, [volumePreview, hasLabelTextures]);
  const bodyMaterials = useMemo(() => labelTextures ? [createOvodanLabelMaterial(labelTextures, labelFlavor)] : createOvodanBodyMaterials(texture, color, volumePreview), [texture, color, volumePreview, labelTextures, labelFlavor]);
  const gripGeometry = useMemo(() => new BoxGeometry(.008, .335, .006), []);
  const gripMaterial = useMemo(() => new MeshStandardMaterial({ color, roughness: .45, toneMapped: false }), [color]);
  const grips = useRef<InstancedMesh>(null);
  useEffect(() => {
    const mesh = grips.current;
    if (!mesh) return;
    const part = new Object3D();
    for (let i = 0; i < 64; i++) {
      const angle = i/64*Math.PI*2;
      part.position.set(.432*Math.sin(angle), 2.995, .432*Math.cos(angle));
      part.rotation.y = angle;
      part.updateMatrix(); mesh.setMatrixAt(i, part.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);
  useEffect(() => () => {
    Object.values(geometry).forEach((item) => item.dispose());
  }, [geometry]);
  useEffect(() => () => {
    bodyMaterials.forEach((item) => item.dispose());
  }, [bodyMaterials]);
  useEffect(() => () => {
    gripGeometry.dispose(); gripMaterial.dispose();
  }, [gripGeometry, gripMaterial]);
  return <group position-y={-1.5975}>
    <mesh geometry={geometry.body} material={bodyMaterials} castShadow={volumePreview} receiveShadow={volumePreview} />
    <mesh geometry={geometry.neck} castShadow={volumePreview}><meshStandardMaterial color="#eeeeea" roughness={.55} toneMapped={false} /></mesh>
    <mesh geometry={geometry.cap} castShadow={volumePreview}><meshStandardMaterial color={color} roughness={.45} toneMapped={false} /></mesh>
    <mesh position-y={3.195} rotation-x={-Math.PI/2} castShadow={volumePreview}>
      <circleGeometry args={[.405, 64]} /><meshStandardMaterial color={color} roughness={.45} toneMapped={false} />
    </mesh>
    <mesh rotation-x={Math.PI/2} castShadow={volumePreview}><circleGeometry args={[.48, 64]} /><meshStandardMaterial color={volumePreview ? "#eeeeea" : color} roughness={.6} toneMapped={false} /></mesh>
    <instancedMesh ref={grips} args={[gripGeometry, gripMaterial, 64]} castShadow={volumePreview} />
  </group>;
}
