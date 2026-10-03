import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { motionOnProducts, ovodanFlavors } from "@/data/motion-products";
import { catalog } from "@/data/catalog";
import { homeSlogan } from "@/data/hero-products";
import { createOvodanGeometries } from "@/lib/ovodan-geometry";
import { motionChapterAt, motionChapters, motionFrames, motionScrollTarget, sourceYawLimit } from "@/lib/product-motion";
import { createOvodanBodyMaterials } from "@/components/motion/OvodanBottle";
import { Color, MeshBasicMaterial, SRGBColorSpace, Texture } from "three";
import sharp from "sharp";

describe("商品悬浮预览的数据与运动边界", () => {
  it("商品图片仍为原始字节，ON购买入口仍绑定现有目录", () => {
    const source = JSON.parse(readFileSync(path.resolve("docs/fizzi-product-motion-source.json"), "utf8"));
    ovodanFlavors.forEach((flavor) => {
      const bytes = readFileSync(path.join(process.cwd(), "public", flavor.image));
      const evidence = source.ovodan.photos.find((photo: { file: string }) => flavor.image.endsWith(photo.file));
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(evidence.sha256);
    });
    motionOnProducts.forEach((product) => {
      const original = catalog.find((item) => item.id === product.id)!;
      expect(product.href).toBe(`/products/${original.slug}`);
      if (product.id === "on-gold-standard-whey") {
        expect(product.image.asset.projectPath).toContain("/5lb/vanilla-ice-cream/");
        expect(product.image.variantIds).toEqual(["on-whey-5lb-vanilla"]);
      } else expect(product.image).toEqual(original.images[0]);
    });
    expect(["为你的", "下一次突破", "做好准备"].join("")).toBe(homeSlogan);
  });

  it("正面投射受真实照片范围约束，材质合并控制绘制次数", () => {
    const geometry = createOvodanGeometries();
    expect(geometry.body.groups).toHaveLength(2);
    expect(geometry.body.getIndex()!.count / 3).toBeLessThan(4500);
    const uv = geometry.body.getAttribute("uv");
    for (let i = 0; i < uv.count; i++) {
      expect(uv.getX(i)).toBeGreaterThanOrEqual(0);
      expect(uv.getX(i)).toBeLessThanOrEqual(1);
      expect(uv.getY(i)).toBeGreaterThanOrEqual(0);
      expect(uv.getY(i)).toBeLessThanOrEqual(1);
    }
    Object.values(geometry).forEach((item) => item.dispose());
  });

  it("实际瓶身正面使用原照片且不被灯光/色调映射重新着色，sRGB往返保持颜色", () => {
    const texture = new Texture(); texture.colorSpace = SRGBColorSpace;
    const materials = createOvodanBodyMaterials(texture, ovodanFlavors[0].color);
    const geometry = createOvodanGeometries();
    const front = materials[geometry.body.groups[0].materialIndex!];
    expect(front).toBeInstanceOf(MeshBasicMaterial);
    expect(front.map).toBe(texture);
    expect(front.toneMapped).toBe(false);
    expect(front.color.getHexString(SRGBColorSpace)).toBe("ffffff");
    for (const hex of ["67aedc", "ffd33f", "003558"]) {
      const pixel = new Color(`#${hex}`);
      expect(pixel.getHexString(SRGBColorSpace)).toBe(hex);
    }
    materials.forEach((material) => material.dispose());
    Object.values(geometry).forEach((item) => item.dispose()); texture.dispose();
  });

  it.each([false, true])("外层位置编排保持稳定，欧福全周旋转由已核验贴图的内层处理（mobile=%s）", (mobile) => {
    const frames = motionFrames(mobile);
    for (const frame of [...frames.bottles, ...frames.photos]) for (const actor of frame) {
      expect(Number.isFinite(actor.x + actor.y + actor.scale)).toBe(true);
      expect(Math.abs(actor.ry) + .04).toBeLessThan(sourceYawLimit);
      expect(Math.abs(actor.rx)).toBeLessThan(.12);
    }
    expect(frames.bottles[motionChapters.intro].every((actor) => actor.scale < .01)).toBe(true);
    expect(frames.bottles[motionChapters.ovodan].filter((actor) => actor.scale > .1)).toHaveLength(2);
    expect(frames.photos[motionChapters.intro].filter((actor) => actor.scale > .1)).toHaveLength(4);
    expect(frames.photos[motionChapters.on].filter((actor) => actor.scale > .1)).toHaveLength(4);
    expect(frames.photos[motionChapters.ovodan].every((actor) => actor.scale < .01)).toBe(true);
    expect(frames.photos[motionChapters.intro][0].scale).toBeGreaterThan(Math.max(...frames.photos[motionChapters.intro].slice(1).map((actor) => actor.scale)) * 1.5);
  });

  it("窄屏瓶身留在文案与按钮下方，320与390宽度没有大幅出界", () => {
    const frames = motionFrames(true);
    for (const width of [320, 390]) for (const frame of [frames.bottles[motionChapters.ovodan]]) for (const actor of frame) {
      const extentX = actor.scale*772/width*(.39*Math.abs(Math.cos(actor.rz)) + Math.abs(Math.sin(actor.rz)))/2;
      expect(Math.abs(actor.x) + extentX).toBeLessThan(.54);
      expect(.5-actor.y-actor.scale/2).toBeGreaterThan(.35);
      expect(.5-actor.y+actor.scale/2).toBeLessThan(.99);
    }
  });

  it("ON首屏与系列组按真实像素轮廓避开桌面文案、手机边缘和底部控制", async () => {
    const outlines = await Promise.all(motionOnProducts.map(async (product) => {
      const { data, info } = await sharp(path.join(process.cwd(), "public", product.image.asset.projectPath)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      let left = info.width, top = info.height, right = 0, bottom = 0;
      for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
        // 与实际材质alphaTest=.025一致，忽略完全透明空边。
        if (data[(y * info.width + x) * info.channels + 3] < 7) continue;
        left = Math.min(left, x); right = Math.max(right, x);
        top = Math.min(top, y); bottom = Math.max(bottom, y);
      }
      return { ratio: info.width / info.height, left: left / info.width, right: right / info.width, top: top / info.height, bottom: bottom / info.height };
    }));
    for (const mobile of [true, false]) {
      const sizes = mobile ? [310, 320, 360, 390].flatMap((width) => [760, 772, 900].map((height) => [width, height])) : [761, 1024, 1440, 1920].flatMap((width) => [720, 924, 1600].map((height) => [width, height]));
      for (const [width, height] of sizes) for (const chapter of [motionChapters.intro, motionChapters.on]) {
        const frame = motionFrames(mobile, width / height).photos[chapter];
        frame.forEach((actor, i) => {
          const outline = outlines[i];
          for (const tilt of [actor.rz - .04, actor.rz + .04]) {
            for (const u of [outline.left, outline.right]) for (const v of [outline.top, outline.bottom]) {
              const x = (u - .5) * actor.scale * height * outline.ratio, y = (.5 - v) * actor.scale * height;
              const screenX = (.5 + actor.x) * width + x * Math.cos(tilt) - y * Math.sin(tilt);
              const screenY = (.5 - actor.y) * height - x * Math.sin(tilt) - y * Math.cos(tilt);
              const context = `mobile=${mobile}, ${width}x${height}, chapter=${chapter}, product=${i}`;
              expect(screenX - 2, context).toBeGreaterThanOrEqual(mobile ? 12 : width * (.05 + .9 * .43) + 24);
              expect(screenX + 2, context).toBeLessThanOrEqual(width - 12);
              expect(screenY - 2, context).toBeGreaterThanOrEqual(mobile ? chapter === motionChapters.intro ? 300 : 344 : 50);
              expect(screenY + 2, context).toBeLessThanOrEqual(height - 84);
            }
          }
        });
      }
    }
  });

  it("章节滚动支持深链接位置与范围外输入，不改变页面滚动距离", () => {
    expect([-.5,0,.26,.74,1,2].map(motionChapterAt)).toEqual([0,0,1,1,2,2]);
    expect(motionScrollTarget(76,2772,924,76,0)).toBe(0);
    expect(motionScrollTarget(76,2772,924,76,1)).toBe(924);
    expect(motionScrollTarget(76,2772,924,76,2)).toBe(1848);
  });
});
