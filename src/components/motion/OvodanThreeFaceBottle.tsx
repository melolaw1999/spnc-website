"use client";

import { useEffect, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { SRGBColorSpace } from "three";
import { OvodanLabelFlavor, ovodanLabelViews } from "@/data/ovodan-labels";
import { ovodanFlavors } from "@/data/motion-products";
import { OvodanBottle } from "./OvodanBottle";

export function OvodanThreeFaceBottle({ flavor, onReady }: { flavor: OvodanLabelFlavor; onReady?: (flavor: OvodanLabelFlavor) => void }) {
  const paths = useMemo(() => ovodanLabelViews[flavor].map((view) => view.image), [flavor]);
  const [front, ingredients, nutrition] = useTexture(paths);
  const textures = useMemo(() => [front, ingredients, nutrition] as const, [front, ingredients, nutrition]);
  const { gl } = useThree();
  textures.forEach((texture) => { texture.colorSpace = SRGBColorSpace; texture.anisotropy = Math.min(4, gl.capabilities.getMaxAnisotropy()); });
  useEffect(() => { onReady?.(flavor); }, [flavor, onReady]);
  const data = ovodanFlavors.find((item) => item.id === flavor)!;
  return <OvodanBottle texture={front} color={data.color} volumePreview labelTextures={textures} labelFlavor={flavor} />;
}
