"use client";

import { useState } from "react";
import { tastingAllowance, tastingBenefit, tastingPreviewMenu, toggleTastingSelection } from "@/lib/membership-tasting";
import styles from "@/app/membership/tasting/tasting.module.css";

export function TastingMenuPreview() {
  const [selected, setSelected] = useState<string[]>([]);
  const [shipping, setShipping] = useState<"with-order" | "separate">("with-order");
  const [notice, setNotice] = useState("");
  const [periodIndex, setPeriodIndex] = useState(0);
  const allowance = tastingAllowance(periodIndex);
  const shippingYuan = shipping === "separate" && !allowance.freeStandaloneShipping ? tastingBenefit.standaloneShippingYuan : 0;
  function changePeriod(index: number) {
    setPeriodIndex(index);
    setSelected((current) => current.slice(0, tastingAllowance(index).flavors));
    setNotice("");
  }
  const names = tastingPreviewMenu.filter((item) => selected.includes(item.id)).map((item) => item.name);
  return <div>
    <div className={styles.periodPreview}><span>切换权益预览</span><div>{[[0, "首期 · 加赠＋免运费"], [1, "第2–3期 · 加赠"], [3, "第4期起 · 基础权益"]].map(([index, label]) => <button key={index} type="button" aria-pressed={periodIndex === index} onClick={() => changePeriod(Number(index))}>{label}</button>)}</div><p>{allowance.bonusFlavors ? "基础 1 款 + 内测加赠 2 款 = 本期任选 3 款" : "基础权益：本期任选 1 款"}。每款 3 袋 × 20g，共 {allowance.bags} 袋 / {allowance.grams}g。</p><small>这是规则预览，不代表当前账号的真实会籍或领取额度。</small></div>
    <div className={styles.menuGrid}>{tastingPreviewMenu.map((item, index) => {
      const active = selected.includes(item.id);
      const full = selected.length >= allowance.flavors;
      return <button key={item.id} type="button" className={`${styles.menuCard} ${active ? styles.selected : ""}`} aria-pressed={active} disabled={full && !active} onClick={() => { setSelected(toggleTastingSelection(selected, item.id, allowance.flavors)); setNotice(""); }}>
        <div className={`${styles.flavorTile} ${styles[item.tone]}`} aria-hidden="true"><span>0{index + 1}</span><b>{tastingBenefit.gramsPerBag}<small>g × 3</small></b><i>THREE MOMENTS, ONE FLAVOR</i></div>
        <div className={styles.menuCardCopy}><small>ON 金标乳清 · {item.family}</small><h3>{item.name}</h3><p>每款 3 袋 · 候选口味，待确认批次</p><span>{active ? "已选 ✓" : "选择这个口味 +"}</span></div>
      </button>;
    })}</div>
    <div className={styles.selectionPanel}>
      <div><span className={styles.eyebrow}>YOUR FLAVOR FLIGHT</span><h3>你的试喝组合</h3><p aria-live="polite">已选 {selected.length} / {allowance.flavors} 款，共 {selected.length * tastingBenefit.bagsPerFlavor} 袋{names.length ? `：${names.join("、")}` : "，选一个想认真了解的口味。"}</p></div>
      <fieldset className={styles.shippingChoices}><legend>寄送方式</legend><label><input type="radio" name="tasting-shipping" checked={shipping === "with-order"} onChange={() => setShipping("with-order")} />随店铺订单寄 · 免运费</label><label><input type="radio" name="tasting-shipping" checked={shipping === "separate"} onChange={() => setShipping("separate")} />{allowance.freeStandaloneShipping ? "单独寄送 · 首盒免运费" : "单独寄送 · ¥6 运费"}</label></fieldset>
      <div className={styles.selectionTotal}><span>试喝装 ¥0 + 运费 ¥{shippingYuan}</span><strong>¥{shippingYuan}</strong><button type="button" disabled={selected.length !== allowance.flavors} onClick={() => setNotice(`组合已预览：${names.join("、")}，每款 3 袋，共 ${allowance.bags} 袋。当前为内测选味体验，未提交领取、未扣减权益，也不会产生费用。`)}>预览我的组合</button></div>
      <p className={styles.previewNote}>内测菜单仅用于体验选味；实际采购、批次和可领取库存确认后开放领取。本页不收款、不生成发货订单。</p>
      {notice && <p className={styles.feedback} role="status">{notice}</p>}
    </div>
  </div>;
}
