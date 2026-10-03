import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { Color, Group, Mesh, MeshBasicMaterial, Raycaster, SRGBColorSpace, Texture, Vector3 } from "three";
import { ovodanLabelViews, OvodanLabelFlavor } from "@/data/ovodan-labels";
import { createOvodanLabelMaterial, isPlainLabelBackground, labelPhotoUv, labelViewAt } from "@/lib/ovodan-label-projection";
import { createOvodanGeometries } from "@/lib/ovodan-geometry";

describe.each<OvodanLabelFlavor>(["strawberry", "passionfruit"])("%s 三面真实包装曲面投射", (flavor) => {
  const labelViews = ovodanLabelViews[flavor];
  it("三面文件与本次用户原始上传字节一致，口味来源没有混用", () => {
    expect(labelViews.map((view) => view.id)).toEqual(["front", "ingredients", "nutrition"]);
    for (const view of labelViews) {
      expect(createHash("sha256").update(readFileSync(path.join(process.cwd(), "public", view.image))).digest("hex")).toBe(view.sha256);
    }
  });

  it("旋转到三个面时命中各自原图，字面左右方向不镜像，整周没有无来源空白", () => {
    const geometry = createOvodanGeometries(); geometry.body.clearGroups();
    const material = new MeshBasicMaterial();
    const model = new Group(); model.add(new Mesh(geometry.body, material));
    for (let i = 0; i < labelViews.length; i++) {
      const view = labelViews[i];
      model.rotation.y = view.viewDegrees * Math.PI / 180; model.updateMatrixWorld(true);
      const hits = [-.15, 0, .15].map((x) => new Raycaster(new Vector3(x, 1.3, 5), new Vector3(0, 0, -1)).intersectObject(model, true)[0]);
      const local = hits.map((hit) => model.worldToLocal(hit.point.clone()));
      local.forEach((point) => expect(labelViewAt(Math.atan2(point.x, point.z) * 180 / Math.PI)).toBe(i));
      const uv = local.map((point) => labelPhotoUv(point, i, flavor));
      expect(uv[0].u).toBeLessThan(uv[1].u); expect(uv[1].u).toBeLessThan(uv[2].u);
      expect(uv[1].u).toBeCloseTo(view.centerPixelX / 1500);
      expect(uv[1].v).toBeCloseTo(1 - 1188 / 2126);
    }
    const counts = [0, 0, 0];
    for (let degree = 0; degree < 360; degree++) counts[labelViewAt(degree)]++;
    expect(counts).toEqual([140, 110, 110]);
    Object.values(geometry).forEach((g) => g.dispose()); material.dispose();
  });

  it("背景衔接保护白字、金字、蓝标、黑白条码及白色粉末图案", () => {
    const linear = (hex: string) => new Color(hex).toArray() as [number, number, number];
    expect(new Color("#c81d22").getHexString(SRGBColorSpace)).toBe("c81d22");
    expect(isPlainLabelBackground(linear(flavor === "strawberry" ? "#c81d22" : "#67aedc"), flavor)).toBe(true);
    for (const hex of ["#ffffff", "#e8e8e8", "#ffd33f", "#ad8024", "#003558", "#111111"]) {
      expect(isPlainLabelBackground(linear(hex), flavor)).toBe(false);
    }
  });
});

it("两口味不能共享错误的着色器常量缓存，避免三面纹理校准串用", () => {
  const textures = [new Texture(), new Texture(), new Texture()] as const;
  const red = createOvodanLabelMaterial(textures, "strawberry"), blue = createOvodanLabelMaterial(textures, "passionfruit");
  expect(red.customProgramCacheKey()).not.toBe(blue.customProgramCacheKey());
  red.dispose(); blue.dispose(); textures.forEach((texture) => texture.dispose());
});
