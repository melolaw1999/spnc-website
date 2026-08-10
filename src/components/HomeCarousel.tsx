"use client";

import {
  Children,
  type FocusEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./HomeCarousel.module.css";

const rotationInterval = 7000;

type HomeCarouselProps = {
  children: ReactNode;
  labels: readonly string[];
};

export function HomeCarousel({ children, labels }: HomeCarouselProps) {
  const slides = Children.toArray(children);
  const [activeIndex, setActiveIndex] = useState(0);
  const [manualPause, setManualPause] = useState(false);
  const [interactionPause, setInteractionPause] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [visible, setVisible] = useState(true);
  const carouselRef = useRef<HTMLElement>(null);

  const goTo = useCallback((index: number) => {
    setActiveIndex((index + slides.length) % slides.length);
  }, [slides.length]);

  const showPrevious = useCallback(() => {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const showNext = useCallback(() => {
    setActiveIndex((current) => (current + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.16 },
    );
    observer.observe(carousel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (slides.length < 2 || manualPause || interactionPause || reducedMotion || !visible) return;
    const timer = window.setInterval(showNext, rotationInterval);
    return () => window.clearInterval(timer);
  }, [interactionPause, manualPause, reducedMotion, showNext, slides.length, visible]);

  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setInteractionPause(false);
  };

  if (slides.length === 0) return null;

  const activeLabel = labels[activeIndex] ?? `第 ${activeIndex + 1} 屏`;

  return <section
    ref={carouselRef}
    className={styles.carousel}
    aria-label="首页精选内容"
    aria-roledescription="轮播广告"
    onFocusCapture={() => setInteractionPause(true)}
    onBlurCapture={handleBlur}
  >
    <div className={styles.viewport}>
      <div
        className={styles.slide}
        key={activeIndex}
        role="group"
        aria-label={`${activeIndex + 1} / ${slides.length} · ${activeLabel}`}
        aria-roledescription="幻灯片"
      >
        {slides[activeIndex]}
      </div>
    </div>

    {slides.length > 1 && <>
      <button className={`${styles.arrow} ${styles.previous}`} type="button" onClick={showPrevious} aria-label="上一屏">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 6-6 6 6 6" /></svg>
      </button>
      <button className={`${styles.arrow} ${styles.next}`} type="button" onClick={showNext} aria-label="下一屏">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9.5 6 6 6-6 6" /></svg>
      </button>

      <div className={styles.controls} aria-label="选择轮播内容">
        <div className={styles.dots}>
          {slides.map((_, index) => <button
            className={`${styles.dot} ${index === activeIndex ? styles.activeDot : ""}`}
            type="button"
            onClick={() => goTo(index)}
            aria-label={`查看第 ${index + 1} 屏：${labels[index] ?? "精选内容"}`}
            aria-current={index === activeIndex ? "true" : undefined}
            key={labels[index] ?? index}
          />)}
        </div>
        {!reducedMotion && <button
          className={styles.pause}
          type="button"
          onClick={() => setManualPause((paused) => !paused)}
          aria-label={manualPause ? "继续自动播放" : "暂停自动播放"}
          title={manualPause ? "继续播放" : "暂停播放"}
        >
          {manualPause
            ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 7 8 5-8 5Z" /></svg>
            : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 7v10M15 7v10" /></svg>}
        </button>}
      </div>
      <span className="sr-only" aria-live="polite" aria-atomic="true">当前显示：{activeLabel}</span>
    </>}
  </section>;
}
