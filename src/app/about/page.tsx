import { SouthernLogo } from "@/components/SouthernLogo";
import { companyNameEn, companyNameZh } from "@/data/company";
import { mailto, publicContactEmail } from "@/data/contacts";
import { pageMetadata } from "@/lib/site";
import styles from "./page.module.css";

export const metadata=pageMetadata("关于我们","了解 SPNC 理想营养的店铺理念、经营原则与相关经营主体。","/about");

export default function About() {
  return (
    <main>
      <section className="hero">
        <div className="container">
          <div className="eyebrow">About SPNC</div>
          <h1>正品源自正道</h1>
          <p className="lead">理想营养由 SPNC 运营，专注于全球运动营养品牌商品的正品供应、版本说明、防伪溯源与售后服务。</p>
        </div>
      </section>
      <section className="section">
        <article className="container narrow prose">
          <h2>品牌信任页，而不是独立商城</h2>
          <p>官网用于展示 ON 商品专区、版本说明、防伪溯源、知识内容和售后指引。购买、付款、退款和订单沟通仍回到淘宝店完成。</p>
          <h2>长期经营，比喧闹更重要</h2>
          <p>我们不把补剂包装成药品，不作身材或训练结果承诺，也不使用未经确认的授权、排他或品牌身份表述。</p>
          <h2>联系理想营养</h2>
          <p>品牌合作、通用联系与公司信息沟通请发送邮件至 <a className="text-link inline-link" href={mailto(publicContactEmail)}>{publicContactEmail}</a>。</p>
          <section className={styles.companyIdentity} aria-labelledby="about-company-title">
            <SouthernLogo className={styles.companyLogo} />
            <div>
              <h2 id="about-company-title">运营主体</h2>
              <p className={styles.companyName} lang="en">{companyNameEn}</p>
              <p className={styles.companyDetails}>理想营养由 SPNC 运营。<br />{companyNameZh}</p>
            </div>
          </section>
        </article>
      </section>
    </main>
  );
}
