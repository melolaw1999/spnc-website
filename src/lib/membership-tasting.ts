export const tastingBenefit = {
  intervalMonths: 1,
  baseFlavors: 1,
  bonusFlavors: 2,
  introRounds: 3,
  bagsPerFlavor: 3,
  gramsPerBag: 20,
  priceYuan: 0,
  yearlyRounds: 12,
  standaloneShippingYuan: 6,
} as const;

// 仅表达内测预览规则；真实额度必须由服务器核验会籍和领取记录。
export function tastingAllowance(periodIndex: number, introductoryOffer = true) {
  if (!Number.isInteger(periodIndex) || periodIndex < 0 || periodIndex >= tastingBenefit.yearlyRounds) {
    throw new Error("会籍期数必须在 0–11 之间。");
  }
  const bonusFlavors = introductoryOffer && periodIndex < tastingBenefit.introRounds ? tastingBenefit.bonusFlavors : 0;
  const flavors = tastingBenefit.baseFlavors + bonusFlavors;
  const bags = flavors * tastingBenefit.bagsPerFlavor;
  return { flavors, bonusFlavors, bags, grams: bags * tastingBenefit.gramsPerBag, freeStandaloneShipping: introductoryOffer && periodIndex === 0 };
}

// 来自官网已核实的 ON 金标乳清口味资料。候选菜单不代表已采购或可发货库存。
export const tastingPreviewMenu = [
  { id: "double-chocolate", name: "双重巧克力", family: "可可风味", tone: "cocoa" },
  { id: "vanilla-ice-cream", name: "香草冰淇淋", family: "香草风味", tone: "vanilla" },
  { id: "cookies-cream", name: "曲奇奶油", family: "甜点风味", tone: "cookie" },
  { id: "delicious-strawberry", name: "美味草莓", family: "莓果风味", tone: "berry" },
  { id: "banana-cream", name: "香蕉奶油", family: "果味奶香", tone: "banana" },
  { id: "mocha-cappuccino", name: "摩卡卡布奇诺", family: "咖啡风味", tone: "coffee" },
] as const;

export function toggleTastingSelection(selected: readonly string[], id: string, limit: number = tastingBenefit.baseFlavors) {
  if (!tastingPreviewMenu.some((item) => item.id === id)) return [...selected];
  if (selected.includes(id)) return selected.filter((item) => item !== id);
  if (selected.length >= limit) return [...selected];
  return [...selected, id];
}
