import { pageMetadata } from "@/lib/site";
import styles from "./page.module.css";

export const metadata = pageMetadata(
  "诚聘英才",
  "SPNC 理想营养招聘电商运营执行助理。湛江线下全职，面向基础学科背景，接受无电商经验。了解岗位与申请方式。",
  "/careers",
);

const responsibilities = [
  { title: "订单与异常跟进", text: "核对订单，跟进发货、物流与售后，协调处理异常并确认结果。" },
  { title: "采购与仓库对接", text: "按已确认的采购安排，核对规格、数量、价格与交期，跟进到货入库。" },
  { title: "库存与数据核对", text: "维护台账，对照采购、库存与出入库记录，发现差异并跟进处理。" },
  { title: "文件与事项管理", text: "整理业务资料，记录待办、时限与进度，让每件事都有据可查。" },
];

const requirements = [
  { title: "基础学科背景", text: "数学、物理、化学、统计学等基础学科专业；数学、物理专业优先。" },
  { title: "逻辑与学习能力", text: "能区分事实与待核实信息，说明判断依据；愿意学习陌生业务，并在培训后独立处理同类任务。" },
  { title: "数据处理能力", text: "能用 Excel / WPS 完成筛选、查重、查找与汇总，并对照两张表找出差异。" },
  { title: "英语能力", text: "CET-4 成绩 425 分及以上；CET-6 达到 425 分者优先。能读懂基础英文商品与订单资料，并借助工具进行简单邮件沟通。" },
];

const applicationSubject = "应聘电商运营执行助理－姓名－现居城市";
const applicationBody = "您好，我希望申请电商运营执行助理。\n\n毕业院校、学历及专业：\n英语四／六级成绩：\n现居城市及可到岗时间：\n掌握的工具及相关经历：\n\n请简述一个通过分析数据、查找原因或学习新工具解决问题的例子：\n\n（请附上简历）";
const applicationHref = "mailto:CONTACT@SPNC.CN?subject=" + encodeURIComponent(applicationSubject) + "&body=" + encodeURIComponent(applicationBody);

export default function Careers() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.intro}>
          <p className={styles.eyebrow}>SPNC · CAREERS</p>
          <h1>诚聘英才</h1>
          <p className={styles.introText}>
            我们专注运动营养产品的电商零售。<br />
            期待思路清楚、做事认真的你加入。
          </p>
          <p className={styles.company}>湛江市萨瑟恩电子商务有限公司</p>
        </header>

        <section className={styles.opening} aria-labelledby="role-title">
          <div className={styles.roleHeading}>
            <div>
              <p className={styles.openRole}><span aria-hidden="true" /> 正在招聘 · 1 人</p>
              <h2 id="role-title">电商运营执行助理</h2>
              <p className={styles.roleLead}>直接协助负责人，处理订单、采购、仓库与运营资料。</p>
              <div className={styles.roleTags} aria-label="岗位概况">
                <span>广东湛江</span><span>线下全职</span><span>接受无电商经验</span>
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
            <div className={styles.detailGrid}>
              {requirements.map((item) => (
                <div className={styles.detailItem} key={item.title}><h4>{item.title}</h4><p>{item.text}</p></div>
              ))}
            </div>
          </div>

          <div className={[styles.detailsSection, styles.workSection].join(" ")}>
            <div className={styles.sectionLabel}><span>03</span><h3>工作与保障</h3></div>
            <div className={styles.workGrid}>
              <div className={styles.detailItem}>
                <h4>每周 40 小时 · 单休</h4>
                <p>周一至周五每天 7 小时，周六 5 小时，周日休息。国家统一放假调休按规定执行。</p>
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
                <li>毕业院校、学历与具体专业</li>
                <li>英语四／六级成绩</li>
                <li>现居城市与可到岗时间</li>
                <li>掌握的工具及相关项目或工作经历</li>
              </ul>
            </div>
            <div className={styles.example}>
              <h3>再分享一个小例子</h3>
              <p>请在邮件正文简述一次你通过分析数据、查找原因或学习新工具解决问题的经历。课程、实验、个人项目或工作中的例子都可以。</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
