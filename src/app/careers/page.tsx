import { pageMetadata } from "@/lib/site";
import { companyNameEn, companyNameZh } from "@/data/company";
import styles from "./page.module.css";

export const metadata = pageMetadata(
  "诚聘英才",
  "SPNC 理想营养招聘电商运营助理。湛江线下全职，专业不限，接受应届毕业生及无电商行业经验的应聘者。了解岗位与申请方式。",
  "/careers",
);

const responsibilities = [
  { title: "订单跟进", text: "核对订单信息，跟进发货、物流与售后，协调处理异常并确认结果。" },
  { title: "采购与仓库协作", text: "根据采购安排核对规格、数量、价格与交期，跟进备货、到货与入库。" },
  { title: "库存与数据维护", text: "整理采购、库存及出入库记录，核对差异，及时反馈并跟进异常。" },
  { title: "资料与事项管理", text: "整理业务文件，维护待办事项、截止时间与相关记录，确保信息完整、进度清晰。" },
];

const requirements = [
  { title: "数据处理能力", text: "能使用 Excel / WPS 完成筛选、查重、常用查找与汇总。" },
  { title: "分析与判断能力", text: "能根据数据与记录发现问题、核实原因，清楚说明判断依据与处理思路。" },
  { title: "沟通与跟进能力", text: "沟通准确、有条理，能够主动跟进事项并确认处理结果。" },
  { title: "自主学习能力", text: "能主动学习产品、工具与流程，在指导后独立处理同类任务。" },
  { title: "基础英语能力", text: "具备基础英文阅读及书面沟通能力，能理解商品、订单与物流资料，并借助工具完成简单邮件沟通。" },
];

const applicationSubject = "应聘电商运营助理－姓名－现居城市";
const applicationBody = "您好，我希望申请电商运营助理。\n\n教育背景：\n相关经历及掌握的工具：\n现居城市及可到岗时间：\n英语成绩、证书或实际使用经历（选填）：\n\n（请附上简历）";
const applicationHref = "mailto:CONTACT@SPNC.CN?subject=" + encodeURIComponent(applicationSubject) + "&body=" + encodeURIComponent(applicationBody);

export default function Careers() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.intro}>
          <p className={styles.eyebrow}>SPNC · CAREERS</p>
          <h1>加入 SPNC</h1>
          <p className={styles.companyNameEn} lang="en">{companyNameEn}</p>
          <p className={styles.introText}>
            SPNC 理想营养专注运动营养产品的电商零售。
          </p>
          <p className={styles.company}>招聘主体：{companyNameZh}</p>
        </header>

        <section className={styles.opening} aria-labelledby="role-title">
          <div className={styles.roleHeading}>
            <div>
              <p className={styles.openRole}><span aria-hidden="true" /> 正在招聘 · 1 人</p>
              <h2 id="role-title">电商运营助理</h2>
              <p className={styles.roleLead}>直接协助负责人，参与订单处理、采购跟进、仓库对接与库存管理，支持业务准确、有序开展。</p>
              <div className={styles.roleTags} aria-label="岗位概况">
                <span>广东湛江</span><span>线下全职</span><span>专业不限</span>
              </div>
            </div>
            <div className={styles.salary}>
              <p>转正后税前固定工资</p>
              <div><strong>¥5,000</strong><span> / 月</span></div>
              <a className={styles.primaryButton} href="#apply">查看投递方式 <span aria-hidden="true">↓</span></a>
            </div>
          </div>

          <div className={styles.detailsSection}>
            <div className={styles.sectionLabel}><span>01</span><h3>你会参与</h3></div>
            <div className={styles.detailGrid}>
              {responsibilities.map((item) => (
                <div className={styles.detailItem} key={item.title}><h4>{item.title}</h4><p>{item.text}</p></div>
              ))}
            </div>
          </div>

          <div className={styles.detailsSection}>
            <div className={styles.sectionLabel}><span>02</span><h3>我们期待</h3></div>
            <div className={styles.requirementsContent}>
              <p className={styles.requirementsLead}>专业不限，接受应届毕业生及无电商行业经验的应聘者。</p>
              <div className={[styles.detailGrid, styles.requirementsGrid].join(" ")}>
                {requirements.map((item) => (
                  <div className={styles.detailItem} key={item.title}><h4>{item.title}</h4><p>{item.text}</p></div>
                ))}
              </div>
              <div className={[styles.detailItem, styles.preferred].join(" ")}>
                <h4>优先考虑</h4>
                <p>有订单处理、采购跟进、仓库协作或数据整理经历；课程项目、实习与工作经历均可。</p>
              </div>
            </div>
          </div>

          <div className={[styles.detailsSection, styles.workSection].join(" ")}>
            <div className={styles.sectionLabel}><span>03</span><h3>工作与保障</h3></div>
            <div className={styles.workGrid}>
              <div className={styles.detailItem}>
                <h4>每周正常工作 40 小时 · 周日单休</h4>
                <p>国家统一放假调休按规定执行。</p>
              </div>
              <div className={styles.detailItem}>
                <h4>五险一金 · 法定休假</h4>
                <p>依法签订劳动合同、缴纳五险一金，享有法定休假。依法发生的加班工资另行计算。</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.application} id="apply" aria-labelledby="apply-title">
          <div className={styles.applicationHeading}>
            <p className={styles.eyebrow}>YOUR NEXT STEP</p>
            <h2 id="apply-title">从一份简历开始。</h2>
            <p>没有电商经验也可以。我们更关注你如何分析问题、学习和执行。</p>
            <a className={styles.email} href={applicationHref}>CONTACT@SPNC.CN <span aria-hidden="true">↗</span></a>
            <a className={styles.applyButton} href={applicationHref}>发送应聘邮件 <span aria-hidden="true">↗</span></a>
          </div>
          <div className={styles.applicationDetails}>
            <div>
              <h3>邮件主题</h3>
              <p className={styles.subject}>{applicationSubject}</p>
            </div>
            <div>
              <h3>简历请注明</h3>
              <ul>
                <li>教育背景</li>
                <li>掌握的工具及相关项目或工作经历</li>
                <li>现居城市与可到岗时间</li>
                <li>英语成绩、证书或实际使用经历（选填）</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
