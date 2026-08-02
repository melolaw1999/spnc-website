"use client";

import { FormEvent, useState } from "react";
import styles from "./access.module.css";

type AccessFormProps = {
  nextPath: string;
  unavailable: boolean;
};

export function AccessForm({ nextPath, unavailable }: AccessFormProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(unavailable ? "团队预览暂未开放。" : "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/membership/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, next: nextPath }),
      });
      const result = await response.json() as { error?: string; redirectTo?: string };
      if (!response.ok || !result.redirectTo) {
        setError(result.error || "暂时无法进入预览，请稍后再试。");
        return;
      }
      window.location.assign(result.redirectTo);
    } catch {
      setError("网络连接异常，请稍后再试。");
    } finally {
      setSubmitting(false);
    }
  };

  return <form className={styles.accessForm} onSubmit={handleSubmit}>
    <label htmlFor="membership-preview-password">邀请密码</label>
    <input
      id="membership-preview-password"
      type="password"
      inputMode="numeric"
      autoComplete="current-password"
      value={password}
      onChange={(event) => setPassword(event.target.value.replace(/\D/g, "").slice(0, 16))}
      placeholder="请输入团队邀请密码"
      required
      autoFocus
    />
    {error && <p role="alert" className={styles.formError}>{error}</p>}
    <button type="submit" disabled={submitting || password.length === 0}>
      {submitting ? "正在验证…" : "进入黑卡预览"}
    </button>
    <p className={styles.formNote}>访问凭证仅保存在当前浏览器，7天后需要重新验证。</p>
  </form>;
}
