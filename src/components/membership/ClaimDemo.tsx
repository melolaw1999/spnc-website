"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { eligibleProductRules, isTaobaoOrderNumber, maskAlipayAccount, maskOrderNumber } from "@/lib/membership";
import styles from "@/app/membership/membership.module.css";

export function ClaimDemo() {
  const [orderNumber, setOrderNumber] = useState("");
  const [productId, setProductId] = useState(eligibleProductRules[0].id);
  const [alipay, setAlipay] = useState("");
  const [realName, setRealName] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!isTaobaoOrderNumber(orderNumber)) return setError("请输入正确的淘宝订单号。");
    if (alipay.trim().length < 6 || realName.trim().length < 2) return setError("请完整填写支付宝账号和实名姓名。");
    setSubmitted(true);
  };

  if (submitted) {
    const product = eligibleProductRules.find((rule) => rule.id === productId) ?? eligibleProductRules[0];
    return <div className={styles.claimSuccess}>
      <div className={styles.claimSuccessTop}><span>✓</span><div><small>CLAIM RECEIVED</small><h1>申请已提交。</h1></div></div>
      <dl>
        <div><dt>订单号</dt><dd>{maskOrderNumber(orderNumber)}</dd></div>
        <div><dt>商品</dt><dd>{product.shortName}</dd></div>
        <div><dt>返利金额</dt><dd>等待月度报表核准</dd></div>
        <div><dt>支付宝</dt><dd>{maskAlipayAccount(alipay)} · {realName.slice(0, 1)}*</dd></div>
        <div><dt>当前状态</dt><dd><span className={styles.statusBlue}>待订单匹配</span></dd></div>
      </dl>
      <p>每月1日导入上月宝贝销售明细后，系统会核对规格、实付金额、退款状态与确认收货时间。</p>
      <div className={styles.actionRow}><Link className={styles.primaryButton} href="/membership/account">查看会员中心</Link><button className={styles.secondaryButton} onClick={() => setSubmitted(false)} type="button">再提交一笔</button></div>
    </div>;
  }

  return <form className={styles.claimForm} onSubmit={handleSubmit}>
    <header><span>CLAIM YOUR REBATE</span><h1>登记一笔返利。</h1><p>你只需提交订单号和已购买规格。实付金额、税费和退款状态全部以淘宝明细报表为准。</p></header>
    <div className={styles.formSection}>
      <div className={styles.formSectionNumber}>01</div>
      <div><h2>购买信息</h2><label>淘宝订单号<input value={orderNumber} onChange={(event) => setOrderNumber(event.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="主订单号或子订单号" /></label><label>已购买商品<select value={productId} onChange={(event) => setProductId(event.target.value)}>{eligibleProductRules.map((rule) => <option key={rule.id} value={rule.id}>{rule.name}</option>)}</select></label><p className={styles.fieldHint}>商品由理想营养后台维护，买家无法自行填写。</p></div>
    </div>
    <div className={styles.formSection}>
      <div className={styles.formSectionNumber}>02</div>
      <div><h2>收款信息</h2><label>支付宝账号<input value={alipay} onChange={(event) => setAlipay(event.target.value)} autoComplete="off" placeholder="手机号或邮箱" /></label><label>支付宝实名姓名<input value={realName} onChange={(event) => setRealName(event.target.value)} autoComplete="name" placeholder="须与支付宝实名认证一致" /></label><p className={styles.fieldHint}>正常页面只显示脱敏账号；结算批次生成后，当期收款信息将被锁定。</p></div>
    </div>
    <label className={styles.consentRow}><input type="checkbox" required /><span>我确认订单归本人所有，收款信息真实有效，并同意返利审核规则。</span></label>
    {error && <p className={styles.formError} role="alert">{error}</p>}
    <button className={styles.primaryButton} type="submit">提交返利申请</button>
  </form>;
}

