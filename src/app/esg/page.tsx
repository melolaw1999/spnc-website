import Image from "next/image";
import { pageMetadata } from "@/lib/site";
import styles from "./page.module.css";

const statement = "理想营养正在梳理适合自身业务的可持续经营方向：让产品信息更透明，让采购与销售更可追溯，在保障品质的前提下减少浪费，并持续改善消费者服务与经营管理。";

export const metadata = pageMetadata("可持续经营 · ESG", statement, "/esg");

function DirectionIcon({ kind }: { kind: "trace" | "care" }) {
  return <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === "trace" ? <><path d="M9 3H4v6M23 3h5v6M28 23v6h-5M9 29H4v-6"/><path d="m9 12 7-4 7 4v9l-7 4-7-4Z"/><path d="m9 12 7 4 7-4M16 16v9"/></> : <><path d="M26 12A11 11 0 0 0 7 7L4 11M4 4v7h7M6 20a11 11 0 0 0 19 5l3-4M28 28v-7h-7"/><path d="M13 12h6v9h-6zM12 12h8"/></>}
  </svg>;
}

export default function EsgPage() {
  return <main className={styles.page}>
    <header className={styles.intro}>
      <div><p className={styles.eyebrow}>SPNC / ESG</p><h1>可持续经营</h1></div>
      <p className={styles.statement}>{statement}</p>
    </header>
    <div className={styles.scenes}>
      <section className={styles.scene} aria-labelledby="trace-title">
        <div className={styles.photo}>
          <Image src="/assets/esg/product-check-scene.png" alt="两位现场人员查看营养品包装，手部动作与产品细节" width={1080} height={1440} sizes="(max-width: 700px) 150vw, 850px" priority className={styles.peoplePhoto}/>
        </div>
        <div className={styles.caption}><DirectionIcon kind="trace"/><div><h2 id="trace-title">信息与追溯</h2><p>让产品信息更透明，<br/>让采购与销售更可追溯。</p></div></div>
      </section>
      <section className={styles.scene} aria-labelledby="care-title">
        <div className={styles.photo}>
          <Image src="/assets/esg/warehouse-scene.png" alt="货架、周转车与营养品的真实仓储场景" width={1440} height={1080} sizes="(max-width: 700px) calc(100vw - 40px), 544px" className={styles.warehousePhoto}/>
        </div>
        <div className={styles.caption}><DirectionIcon kind="care"/><div><h2 id="care-title">品质与资源</h2><p>在保障品质的前提下，<br/>减少浪费。</p></div></div>
      </section>
    </div>
  </main>;
}
