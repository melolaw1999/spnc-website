"use client";
import { RefObject, useEffect, useRef, useState } from "react";
import { sectionProgress } from "@/lib/studio-motion";

export function useStudioScroll(section: RefObject<HTMLElement | null>, frame: RefObject<HTMLDivElement | null>, preloadMargin = "450px") {
  const progress = useRef(0);
  const [near, setNear] = useState(false), [visible, setVisible] = useState(false);
  const [allowed, setAllowed] = useState(false), [foreground, setForeground] = useState(true);
  useEffect(() => {
    const node = section.current, stage = frame.current;
    if (!node || !stage) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const preference = () => setAllowed(!motion.matches && !(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
    const visibility = () => setForeground(!document.hidden);
    let raf = 0;
    const measure = () => {
      raf = 0;
      const header = parseFloat(getComputedStyle(stage).top) || 72;
      progress.current = sectionProgress(node.getBoundingClientRect().top, node.offsetHeight, stage.offsetHeight, header);
      node.dataset.scrollProgress = progress.current.toFixed(4);
      stage.style.setProperty("--progress", String(progress.current));
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(measure); };
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    const prefetch = new IntersectionObserver(([entry]) => { if (entry.isIntersecting && entry.intersectionRatio > 0) setNear(true); }, { rootMargin: preloadMargin });
    const resize = new ResizeObserver(schedule);
    observer.observe(node); prefetch.observe(node); resize.observe(node); resize.observe(stage);
    preference(); visibility(); schedule();
    window.addEventListener("scroll", schedule, { passive: true }); window.addEventListener("resize", schedule);
    motion.addEventListener("change", preference); document.addEventListener("visibilitychange", visibility);
    return () => { cancelAnimationFrame(raf); observer.disconnect(); prefetch.disconnect(); resize.disconnect(); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); motion.removeEventListener("change", preference); document.removeEventListener("visibilitychange", visibility); };
  }, [section, frame, preloadMargin]);
  return { progress, requested: near && allowed, running: visible && foreground && allowed, allowed };
}
