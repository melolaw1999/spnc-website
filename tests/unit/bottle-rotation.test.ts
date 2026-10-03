import { describe, expect, it } from "vitest";
import { Euler, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, Raycaster, Texture, Vector3 } from "three";
import { advanceBottleYaw, applyBottlePose, bottleRotationSpeed, draggedBottleYaw, frontProjectionHalfAngle, rotationDegrees } from "@/lib/bottle-rotation";
import { createOvodanGeometries } from "@/lib/ovodan-geometry";
import { createOvodanBodyMaterials } from "@/components/motion/OvodanBottle";

describe("单品真实几何旋转与贴图边界", () => {
  it("看盖和看底在所有四面角度都朝向镜头，俯仰不随瓶身角度转走", () => {
    const rotation = new Euler();
    for (const yaw of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
      applyBottlePose(rotation, { yaw, tilt: .55 });
      expect(new Vector3(0, 1, 0).applyEuler(rotation).z).toBeGreaterThan(.5);
      applyBottlePose(rotation, { yaw, tilt: -.55 });
      expect(new Vector3(0, -1, 0).applyEuler(rotation).z).toBeGreaterThan(.5);
    }
  });
  it("模型正面、侧面与背面均有可命中的体积，背面和侧面不复制正面照片", () => {
    const geometry = createOvodanGeometries(frontProjectionHalfAngle);
    const texture = new Texture();
    const materials = createOvodanBodyMaterials(texture, "#d6382f", true);
    const mesh = new Mesh(geometry.body, materials);
    const model = new Group(); model.add(mesh);
    const ray = new Raycaster(new Vector3(0, 1.3, 5), new Vector3(0, 0, -1));
    for (const [yaw, material] of [[0, 0], [Math.PI / 2, 1], [Math.PI, 1], [Math.PI * 1.5, 1]]) {
      model.rotation.y = yaw; model.updateMatrixWorld(true);
      const hits = ray.intersectObject(model, true);
      expect(hits.length).toBeGreaterThan(0);
      expect(hits[0].point.z).toBeGreaterThan(.4);
      expect(hits[0].face!.materialIndex).toBe(material);
    }
    expect(materials[0]).toBeInstanceOf(MeshStandardMaterial);
    expect(materials[0].map).toBe(texture);
    expect(materials[1].map).toBeNull();
    // 默认首页保留原来的正面颜色方案。
    const original = createOvodanBodyMaterials(texture, "#d6382f");
    expect(original[0]).toBeInstanceOf(MeshBasicMaterial);
    original.forEach((material) => material.dispose()); materials.forEach((material) => material.dispose());
    Object.values(geometry).forEach((item) => item.dispose()); texture.dispose();
  });

  it("自动旋转经过侧面和背面完成一周，暂停及离屏恢复没有角度跳跃", () => {
    let yaw = 0;
    for (let i = 0; i < 240; i++) yaw = advanceBottleYaw(yaw, 1 / 60, true);
    expect(rotationDegrees(yaw)).toBeCloseTo(90);
    for (let i = 0; i < 240; i++) yaw = advanceBottleYaw(yaw, 1 / 60, true);
    expect(rotationDegrees(yaw)).toBeCloseTo(180);
    expect(advanceBottleYaw(yaw, 30, false)).toBe(yaw);
    expect(advanceBottleYaw(yaw, 30, true) - yaw).toBeCloseTo(.05 * bottleRotationSpeed);
    for (let i = 0; i < 480; i++) yaw = advanceBottleYaw(yaw, 1 / 60, true);
    expect(Math.min(rotationDegrees(yaw), 360 - rotationDegrees(yaw))).toBeCloseTo(0);
  });

  it("横拖覆盖全周，反向拖动和窄屏使用实际舞台宽度", () => {
    expect(rotationDegrees(draggedBottleYaw(0, 87.5, 350))).toBeCloseTo(90);
    expect(rotationDegrees(draggedBottleYaw(0, -100, 400))).toBeCloseTo(270);
    expect(rotationDegrees(draggedBottleYaw(Math.PI, 200, 400))).toBeCloseTo(0);
    expect(Number.isFinite(draggedBottleYaw(0, 20, 0))).toBe(true);
  });
});
