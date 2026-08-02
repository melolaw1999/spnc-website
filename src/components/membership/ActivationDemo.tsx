"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { isMembershipKey, isTaobaoOrderNumber, membershipExpiryDate } from "@/lib/membership";
import styles from "@/app/membership/membership.module.css";

export function ActivationDemo() {
  const [mode, setMode] = useState<"activate" | "login">("activate");
  const [orderNumber, setOrderNumber] = useState("");
  const [membershipKey, setMembershipKey] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [activated, setActivated] = useState(false);

  const handleActivate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!/^1\d{10}$/.test(phone)) return setError("请输入11位中国大陆手机号。");
    if (!isTaobaoOrderNumber(orderNumber)) return setError("请输入淘宝会员服务订单号。");
    if (!isMembershipKey(membershipKey)) return setError("CDKEY格式应为四组字母或数字。");
    setActivated(true);
  };

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!/^1\d{10}$/.test(phone)) return setError("请输入11位中国大陆手机号。");
    setActivated(true);
  };

  const fillDemo = () => {
    setPhone("13800138000");
    setOrderNumber("20260802123456789001");
    setMembershipKey("SPNC-2026-BLCK-0001");
    setError("");
  };

  if (activated) {
    const expiry = membershipExpiryDate(new Date());
    return <div className={styles.activationSuccess}>
      <span className={styles.successSeal}>✓</span>
      <p>SPNC BLACK</p>
      <h2>{mode === "activate" ? "黑卡已激活" : "欢迎回来"}</h2>
      <div className={styles.successDates}>
        <div><span>开卡时间</span><strong>{new Date().toLocaleDateString("zh-CN")}</strong></div>
        <div><span>有效期至</span><strong>{expiry.toLocaleDateString("zh-CN")}</strong></div>
      </div>
      <p className={styles.previewDisclaimer}>内部交互预览：本页暂不保存真实账户或兑换CDKEY。</p>
      <Link href="/membership/account" className={styles.primaryButton}>进入会员中心</Link>
    </div>;
  }

  return <div className={styles.authPanel}>
    <div className={styles.authTabs}>
      <button className={mode === "activate" ? styles.authTabActive : ""} onClick={() => { setMode("activate"); setError(""); }} type="button">注册开卡</button>
      <button className={mode === "login" ? styles.authTabActive : ""} onClick={() => { setMode("login"); setError(""); }} type="button">会员登录</button>
    </div>

    <div className={styles.authCopy}>
      <span>{mode === "activate" ? "ACTIVATE MEMBERSHIP" : "MEMBER SIGN IN"}</span>
      <h1>{mode === "activate" ? "兑换你的黑卡。" : "回到会员中心。"}</h1>
      <p>{mode === "activate" ? "CDKEY与淘宝会员服务订单号共同验证。兑换成功时间即为会籍开始时间。" : "通过已绑定手机号登录，查看返利记录与结算进度。"}</p>
    </div>

    <form className={styles.activationForm} onSubmit={mode === "activate" ? handleActivate : handleLogin}>
      <label>手机号<input value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 11))} inputMode="numeric" autoComplete="tel" placeholder="用于登录与账户识别" /></label>
      <label>短信验证码<div className={styles.inlineField}><input inputMode="numeric" placeholder="6位验证码" maxLength={6} /><button type="button">获取验证码</button></div></label>
      {mode === "activate" && <>
        <label>淘宝会员服务订单号<input value={orderNumber} onChange={(event) => setOrderNumber(event.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="购买 ¥299 黑卡的订单号" /></label>
        <label>CDKEY<input value={membershipKey} onChange={(event) => setMembershipKey(event.target.value.toUpperCase())} autoCapitalize="characters" placeholder="SPNC-XXXX-XXXX-XXXX" /></label>
        <label className={styles.consentRow}><input type="checkbox" required /><span>我已阅读并同意黑卡会籍与返利规则。</span></label>
      </>}
      {error && <p className={styles.formError} role="alert">{error}</p>}
      <button className={styles.primaryButton} type="submit">{mode === "activate" ? "验证并开卡" : "登录"}</button>
      <button className={styles.demoFill} type="button" onClick={fillDemo}>填入演示资料</button>
    </form>
  </div>;
}

