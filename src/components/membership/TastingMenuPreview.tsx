"use client";

import { useState } from "react";
import { tastingBenefit, tastingPreviewMenu, toggleTastingSelection } from "@/lib/membership-tasting";
import styles from "@/app/membership/tasting/tasting.module.css";

export function TastingMenuPreview() {
  const [selected, setSelected] = useState<string[]>([]);
  const [shipping, setShipping] = useState<"with-order" | "separate">("with-order");
  const [notice, setNotice] = useState("");
  const names = tastingPreviewMenu.filter((item) => selected.includes(item.id)).map((item) => item.name);
  return <div>
    <div className={styles.menuGrid}>{tastingPreviewMenu.map((item, index) => {
      const active = selected.includes(item.id);
      const full = selected.length >= tastingBenefit.portions;
      return <button key={item.id} type="button" className={`${styles.menuCard} ${active ? styles.selected : ""}`} aria-pressed={active} disabled={full && !active} onClick={() => { setSelected(toggleTastingSelection(selected, item.id)); setNotice(""); }}>
        <div className={`${styles.flavorTile} ${styles[item.tone]}`} aria-hidden="true"><span>0{index + 1}</span><b>15<small>g</small></b><i>FLAVOR STUDY</i></div>
        <div className={styles.menuCardCopy}><small>ON 金标乳清 · {item.family}</small><h3>{item.name}</h3><p>菜单候选 · 待确认批次</p><span>{active ? "已选 ✓" : "加入试喝组合 +"}</span></div>
      </button>;
    })}</div>
    <div className={styles.selectionPanel}>
      <div><span className={styles.eyebrow}>YOUR FLAVOR FLIGHT</span><h3>你的三味组合</h3><p aria-live="polite">已选 {selected.length} / {tastingBenefit.portions} 份{names.length ? `：${names.join("、")}` : "，选三款想尝的口味。"}</p></div>
      <fieldset className={styles.shippingChoices}><legend>寄送方式</legend><label><input type="radio" name="tasting-shipping" checked={shipping === "with-order"} onChange={() => setShipping("with-order")} />随店铺订单寄 · 免运费</label><label><input type="radio" name="tasting-shipping" checked={shipping === "separate"} onChange={() => setShipping("separate")} />单独寄送 · ¥6 运费</label></fieldset>
      <div className={styles.selectionTotal}><span>试喝装 ¥0 + 运费 ¥{shipping === "separate" ? tastingBenefit.standaloneShippingYuan : 0}</span><strong>¥{shipping === "separate" ? tastingBenefit.standaloneShippingYuan : 0}</strong><button type="button" disabled={selected.length !== tastingBenefit.portions} onClick={() => setNotice(`组合已预览：${names.join("、")}。当前为内测选味体验，未提交领取、未扣减权益，也不会产生费用。`)}>预览我的组合</button></div>
      <p className={styles.previewNote}>内测菜单仅用于体验选味；实际采购、批次和可领取库存确认后开放领取。本页不收款、不生成发货订单。</p>
      {notice && <p className={styles.feedback} role="status">{notice}</p>}
    </div>
  </div>;
}
