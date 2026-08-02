import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const pageSource = readFileSync(path.join(process.cwd(), "src/app/authenticity/page.tsx"), "utf8");

describe("防伪码与溯源码页面", () => {
  it("明确区分两种码，并提示买家扫描实物标签", () => {
    expect(pageSource).toContain("国产 / 一般贸易");
    expect(pageSource).toContain("跨境 · 防伪码 + 溯源码");
    expect(pageSource).toContain("请扫描你收到的实物标签");
    expect(pageSource).toContain("https://www.optimumnutrition.com/en-us/pages/authentic-products");
  });

  it("包含双层防伪码、验证码结构和易混字符说明", () => {
    expect(pageSource).toContain("看到双层防伪码，先别慌");
    expect(pageSource).toContain("前 6 位");
    expect(pageSource).toContain("后 4 位");
    ["rn", "m", "O", "0", "I", "l"].forEach((character) => expect(pageSource).toContain(`>${character}<`));
  });

  it("两种标签的网页素材均已保存到本地", () => {
    [
      "public/assets/authenticity/on-authentication-label-crop.png",
      "public/assets/authenticity/import-traceability-label-crop.png",
    ].forEach((relativePath) => {
      const filePath = path.join(process.cwd(), relativePath);
      expect(existsSync(filePath)).toBe(true);
      expect(statSync(filePath).size).toBeGreaterThan(100_000);
    });
  });
});
