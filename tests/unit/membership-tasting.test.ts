import { describe, expect, it } from "vitest";
import { tastingBenefit, tastingPreviewMenu, toggleTastingSelection } from "../../src/lib/membership-tasting";
import whey from "../../src/data/gold-standard-whey.json";

describe("黑卡试喝菜单", () => {
  it("候选口味必须存在于已核实的商品资料", () => {
    const known = new Set(whey.variants.map((item) => item.flavorZh));
    for (const item of tastingPreviewMenu) expect(known.has(item.name)).toBe(true);
  });
  it("最多三款不同口味，可以取消重选，未知品项不加入", () => {
    const [a, b, c, d] = tastingPreviewMenu;
    let selected = toggleTastingSelection([], a.id);
    selected = toggleTastingSelection(selected, b.id);
    selected = toggleTastingSelection(selected, c.id);
    expect(toggleTastingSelection(selected, d.id)).toEqual(selected);
    expect(toggleTastingSelection(selected, "unknown")).toEqual(selected);
    selected = toggleTastingSelection(selected, b.id);
    expect(selected).toEqual([a.id, c.id]);
    expect(toggleTastingSelection(selected, d.id)).toEqual([a.id, c.id, d.id]);
  });
  it("年度配置为四期十二份，试喝免费", () => {
    expect(tastingBenefit.yearlyRounds * tastingBenefit.portions).toBe(12);
    expect(tastingBenefit.priceYuan).toBe(0);
  });
});
