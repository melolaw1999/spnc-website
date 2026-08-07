"use client";

import { useEffect, useState } from "react";
import styles from "./BackToTop.module.css";

const visibilityThreshold = 520;

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY > visibilityThreshold);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return <button
    type="button"
    className={`${styles.button} ${visible ? styles.visible : ""}`}
    onClick={scrollToTop}
    aria-label="返回页面顶部"
    title="返回顶部"
    tabIndex={visible ? 0 : -1}
  >
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.75 14.25 12 9l5.25 5.25" />
    </svg>
  </button>;
}
