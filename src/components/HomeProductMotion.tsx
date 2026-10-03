"use client";

import { useEffect, useState } from "react";
import { ProductMotionHero } from "./ProductMotionHero";
import { FizziDesktopHero } from "./FizziDesktopHero";

export function HomeProductMotion() {
  const [desktop, setDesktop] = useState<boolean | null>(null);
  useEffect(() => {
    const query = matchMedia("(min-width: 761px)");
    const update = () => setDesktop(query.matches);
    update(); query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  // 手机沿用已实现的横拖/纵向滚页；原 Fizzi 手机首屏本来就是静态图。
  return desktop === false ? <ProductMotionHero /> : <FizziDesktopHero interactive={desktop === true} />;
}
