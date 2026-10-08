"use client";

import { useEffect, useState } from "react";
import { MobileHomeStory } from "./MobileHomeStory";
import { OvodanStory } from "./OvodanStory";
import { FizziDesktopHero } from "./FizziDesktopHero";
import styles from "./HomeProductMotion.module.css";

export function HomeProductMotion() {
  const [desktop, setDesktop] = useState<boolean | null>(null);
  useEffect(() => {
    const query = matchMedia("(min-width: 761px)");
    const update = () => setDesktop(query.matches);
    update(); query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return <>{desktop === null ? <><div className={styles.mobile}><MobileHomeStory interactive={false} /></div><div className={styles.desktop}><FizziDesktopHero interactive={false} /></div></>
    : desktop ? <FizziDesktopHero interactive /> : <MobileHomeStory />}<OvodanStory /></>;
}
