export const tastingBenefit = {
  intervalMonths: 3,
  portions: 3,
  gramsPerPortion: 15,
  priceYuan: 0,
  yearlyRounds: 4,
  standaloneShippingYuan: 6,
} as const;

// 来自官网已核实的 ON 金标乳清口味资料。候选菜单不代表已采购或可发货库存。
export const tastingPreviewMenu = [
  { id: "double-chocolate", name: "双重巧克力", family: "可可风味", tone: "cocoa" },
  { id: "vanilla-ice-cream", name: "香草冰淇淋", family: "香草风味", tone: "vanilla" },
  { id: "cookies-cream", name: "曲奇奶油", family: "甜点风味", tone: "cookie" },
  { id: "delicious-strawberry", name: "美味草莓", family: "莓果风味", tone: "berry" },
  { id: "banana-cream", name: "香蕉奶油", family: "果味奶香", tone: "banana" },
  { id: "mocha-cappuccino", name: "摩卡卡布奇诺", family: "咖啡风味", tone: "coffee" },
] as const;

export function toggleTastingSelection(selected: readonly string[], id: string) {
  if (!tastingPreviewMenu.some((item) => item.id === id)) return [...selected];
  if (selected.includes(id)) return selected.filter((item) => item !== id);
  if (selected.length >= tastingBenefit.portions) return [...selected];
  return [...selected, id];
}
