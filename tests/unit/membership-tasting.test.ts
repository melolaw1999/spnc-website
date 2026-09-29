import { describe, expect, it } from "vitest";
import { tastingAllowance, tastingBenefit, tastingPreviewMenu, toggleTastingSelection } from "../../src/lib/membership-tasting";
import whey from "../../src/data/gold-standard-whey.json";

describe("黑卡试喝菜单", () => {
  it("候选口味必须存在于已核实的商品资料", () => {
    const known = new Set(whey.variants.map((item) => item.flavorZh));
    for (const item of tastingPreviewMenu) expect(known.has(item.name)).toBe(true);
  });
  it("最多三款不同口味，可以取消重选，未知品项不加入", () => {
    const [a, b, c, d] = tastingPreviewMenu;
    let selected = toggleTastingSelection([], a.id, 3);
    selected = toggleTastingSelection(selected, b.id, 3);
    selected = toggleTastingSelection(selected, c.id, 3);
    expect(toggleTastingSelection(selected, d.id, 3)).toEqual(selected);
    expect(toggleTastingSelection(selected, "unknown", 3)).toEqual(selected);
    selected = toggleTastingSelection(selected, b.id, 3);
    expect(selected).toEqual([a.id, c.id]);
    expect(toggleTastingSelection(selected, d.id, 3)).toEqual([a.id, c.id, d.id]);
    expect(toggleTastingSelection([a.id], b.id)).toEqual([a.id]);
  });
  it("前三期为9袋，第四期恢复3袋，只有首期免单寄运费", () => {
    expect(tastingAllowance(0)).toEqual({flavors:3, bonusFlavors:2, bags:9, grams:180, freeStandaloneShipping:true});
    expect(tastingAllowance(2).bags).toBe(9);
    expect(tastingAllowance(1).freeStandaloneShipping).toBe(false);
    expect(tastingAllowance(3)).toEqual({flavors:1, bonusFlavors:0, bags:3, grams:60, freeStandaloneShipping:false});
    expect(tastingAllowance(11).bags).toBe(3);
  });
  it("首年含加赠54袋1080g，续费基础36袋720g", () => {
    const first = Array.from({length:12}, (_, i) => tastingAllowance(i));
    const renewal = Array.from({length:12}, (_, i) => tastingAllowance(i, false));
    expect(first.reduce((n, x) => n + x.bags, 0)).toBe(54);
    expect(first.reduce((n, x) => n + x.grams, 0)).toBe(1080);
    expect(renewal.reduce((n, x) => n + x.bags, 0)).toBe(36);
    expect(renewal.reduce((n, x) => n + x.grams, 0)).toBe(720);
    expect(renewal[0].freeStandaloneShipping).toBe(false);
    expect(tastingBenefit.priceYuan).toBe(0);
  });
  it("拒绝无效期数", () => {
    for (const value of [-1,12,1.5,NaN]) expect(() => tastingAllowance(value)).toThrow();
  });
});
