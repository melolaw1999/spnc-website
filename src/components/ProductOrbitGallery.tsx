"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { galleryPosition, isHorizontalDrag } from "@/lib/product-gallery";
import styles from "./ProductOrbitGallery.module.css";

type GalleryProduct = {
  slug: string;
  name: string;
  version: string;
  image: { src: string; alt: string; width: number; height: number };
};

export function ProductOrbitGallery({ products }: { products: GalleryProduct[] }) {
  const stage = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLLIElement | null)[]>([]);
  const angle = useRef(0);
  const target = useRef<number | null>(null);
  const width = useRef(1200);
  const gesture = useRef<{ id: number; x: number; y: number; start: number; dragging: boolean } | null>(null);
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [visible, setVisible] = useState(false);
  const [foreground, setForeground] = useState(true);
  const [paused, setPaused] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [active, setActive] = useState(0);
  const [revision, setRevision] = useState(0);
  const step = 360 / products.length;
  const orbit = ready && !reduced;
  const playing = orbit && visible && foreground && !paused && !focused && !hovered && !dragging;

  const paint = useCallback(() => {
    cards.current.forEach((card, index) => {
      if (!card) return;
      const position = galleryPosition(index * step + angle.current, width.current);
      card.style.transform = `translate3d(${position.x}px, 0, ${position.z}px) rotateY(${position.rotate}deg)`;
      card.style.opacity = String(position.opacity);
      card.style.zIndex = String(position.order);
    });
    const index = ((Math.round(-angle.current / step) % products.length) + products.length) % products.length;
    setActive((previous) => previous === index ? previous : index);
  }, [products.length, step]);

  useEffect(() => {
    const node = stage.current;
    if (!node) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReduced(preference.matches);
    const updateVisibility = () => setForeground(!document.hidden);
    updateMotion();
    updateVisibility();
    preference.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    const resize = new ResizeObserver(([entry]) => { width.current = entry.contentRect.width; paint(); });
    const intersection = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.2 });
    resize.observe(node);
    intersection.observe(node);
    paint();
    setReady(true);
    return () => {
      resize.disconnect();
      intersection.disconnect();
      preference.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, [paint]);

  useEffect(() => {
    if (!orbit || !visible || !foreground || dragging) return;
    let frame = 0;
    let last = 0;
    const tick = (now: number) => {
      const elapsed = last ? Math.min(now - last, 40) : 0;
      last = now;
      if (target.current !== null) {
        const distance = target.current - angle.current;
        angle.current += distance * (1 - Math.exp(-elapsed / 110));
        if (Math.abs(distance) < 0.08) { angle.current = target.current; target.current = null; }
      } else if (playing) {
        // 一圈约 100 秒：动效保持轻缓，阅读与购买入口保持静止。
        angle.current -= elapsed * 0.0036;
      }
      paint();
      if (playing || target.current !== null) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [dragging, foreground, orbit, paint, playing, revision, visible]);

  const select = (index: number) => {
    setPaused(true);
    setActive(index);
    const turn = Math.round((angle.current + index * step) / 360);
    target.current = turn * 360 - index * step;
    if (!orbit) cards.current[index]?.scrollIntoView({ block: "nearest", inline: "center", behavior: "instant" });
    setRevision((current) => current + 1);
  };
  const move = (direction: number) => {
    const current = ((Math.round(-(target.current ?? angle.current) / step) % products.length) + products.length) % products.length;
    select((current + direction + products.length) % products.length);
  };
  const pointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!orbit || !event.isPrimary || event.button !== 0) return;
    gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, start: angle.current, dragging: false };
  };
  const pointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const current = gesture.current;
    if (!current || current.id !== event.pointerId) return;
    const x = event.clientX - current.x;
    const y = event.clientY - current.y;
    if (!current.dragging) {
      if (Math.abs(y) > 8 && Math.abs(y) > Math.abs(x)) { gesture.current = null; return; }
      if (!isHorizontalDrag(x, y)) return;
      current.dragging = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      target.current = null;
      setPaused(true);
      setDragging(true);
    }
    angle.current = current.start + x * 0.16;
    paint();
  };
  const pointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    const current = gesture.current;
    if (!current || current.id !== event.pointerId) return;
    gesture.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (current.dragging) {
      target.current = Math.round(angle.current / step) * step;
      setRevision((value) => value + 1);
    }
  };

  if (!products.length) return null;
  const product = products[active];

  return <div className={styles.gallery} data-orbit={orbit} data-dragging={dragging}
    onFocusCapture={() => setFocused(true)}
    onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false); }}>
    <p className={styles.hint} id="on-gallery-help">左右拖动，探索 ON</p>
    <div ref={stage} className={styles.stage} tabIndex={orbit ? 0 : -1}
      role="group" aria-label="ON 产品旋转画廊" aria-describedby="on-gallery-help"
      onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerEnd}
      onPointerCancel={pointerEnd} onLostPointerCapture={pointerEnd}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1); }
        if (event.key === "Home" || event.key === "End") { event.preventDefault(); select(event.key === "Home" ? 0 : products.length - 1); }
      }}>
      <ul className={styles.ring} aria-hidden={orbit || undefined}>
        {products.map((item, index) => <li className={styles.card} key={item.slug} ref={(node) => { cards.current[index] = node; }}>
          <Link href={`/products/${item.slug}`} tabIndex={orbit ? -1 : 0} draggable={false}>
            <span className={styles.cardVersion}>{item.version}</span>
            <div className={styles.image}>
              <Image src={item.image.src} alt={item.image.alt} width={item.image.width} height={item.image.height}
                sizes="(max-width: 600px) 180px, 240px" loading="lazy" draggable={false} />
            </div>
            <span className={styles.cardName}>{item.name}</span>
          </Link>
        </li>)}
      </ul>
    </div>
    <div className={styles.selection} aria-live={paused ? "polite" : "off"} aria-atomic="true">
      <span>{product.version} <i aria-hidden="true">·</i> {String(active + 1).padStart(2, "0")} / {String(products.length).padStart(2, "0")}</span>
      <Link href={`/products/${product.slug}`}>{product.name} <b aria-hidden="true">↗</b></Link>
    </div>
    {ready && <div className={styles.controls} aria-label="画廊控制">
      <button type="button" aria-label="上一件产品" onClick={() => move(-1)}>←</button>
      <div className={styles.dots}>
        {products.map((item, index) => <button type="button" key={item.slug}
          aria-label={`查看${item.version}：${item.name}`} aria-pressed={index === active}
          onClick={() => select(index)}><span /></button>)}
      </div>
      <button type="button" aria-label="下一件产品" onClick={() => move(1)}>→</button>
      {orbit && <button className={styles.pause} type="button" aria-label={paused ? "继续旋转画廊" : "暂停旋转画廊"}
        aria-pressed={paused} onClick={() => setPaused((value) => !value)}>{paused ? "继续" : "暂停"}</button>}
    </div>}
  </div>;
}
