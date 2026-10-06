import { pageMetadata } from "@/lib/site";

const statement = "理想营养正在梳理适合自身业务的可持续经营方向：让产品信息更透明，让采购与销售更可追溯，在保障品质的前提下减少浪费，并持续改善消费者服务与经营管理。";

export const metadata = pageMetadata("ESG", statement, "/esg");

export default function EsgPage() {
  return (
    <main>
      <section className="hero" aria-labelledby="esg-title">
        <div className="container">
          <h1 id="esg-title" style={{ fontSize: "clamp(28px, 3vw, 38px)", fontWeight: 400, letterSpacing: ".14em", lineHeight: 1.3, color: "var(--blue)", paddingLeft: ".14em", margin: "22px auto 24px" }}>ESG</h1>
          <p className="lead">{statement}</p>
        </div>
      </section>
    </main>
  );
}
