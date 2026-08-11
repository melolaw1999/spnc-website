import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { enterpriseContacts, mailto } from "@/data/contacts";

const sourceFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const filePath = path.join(dir, entry);
    const stat = statSync(filePath);
    if (stat.isDirectory()) return sourceFiles(filePath);
    return /\.(ts|tsx)$/.test(filePath) ? [filePath] : [];
  });

describe("官网定位与联系信息", () => {
  it("企业邮箱均为正式 spnc.cn 邮箱并使用 mailto 链接", () => {
    expect(enterpriseContacts.map((contact) => contact.email)).toEqual([
      "contact@spnc.cn",
      "service@spnc.cn",
    ]);
    expect(enterpriseContacts.every((contact) => mailto(contact.email) === `mailto:${contact.email}`)).toBe(true);
  });

  it("全站页脚包含正式版权信息与无障碍返回顶部按钮", () => {
    const footer = readFileSync(path.join(process.cwd(), "src/components/Footer.tsx"), "utf8");
    const backToTop = readFileSync(path.join(process.cwd(), "src/components/BackToTop.tsx"), "utf8");

    expect(footer).toContain("SPNC · 理想营养");
    expect(footer).toContain("All Rights Reserved.");
    expect(footer).toContain("<BackToTop />");
    expect(backToTop).toContain('aria-label="返回页面顶部"');
    expect(backToTop).toContain("prefers-reduced-motion: reduce");
  });

  it("公开导航不再显示售后 FAQ，联系页面不显示负责人邮箱", () => {
    const publicNavigation = [
      "src/components/Header.tsx",
      "src/components/Footer.tsx",
    ].map((filePath) => readFileSync(path.join(process.cwd(), filePath), "utf8")).join("\n");
    const publicSource = sourceFiles(path.join(process.cwd(), "src"))
      .map((filePath) => readFileSync(filePath, "utf8"))
      .join("\n");

    expect(publicNavigation).not.toContain("售后 FAQ");
    expect(publicNavigation).not.toContain('href="/faq"');
    expect(publicSource).not.toContain("melolaw@spnc.cn");
  });

  it("公开导航暂不显示关于我们，联系页面保留正式邮箱、旺旺客服与安全提示", () => {
    const publicNavigation = [
      "src/components/Header.tsx",
      "src/components/Footer.tsx",
    ].map((filePath) => readFileSync(path.join(process.cwd(), filePath), "utf8")).join("\n");
    const contactPage = readFileSync(path.join(process.cwd(), "src/app/contact/page.tsx"), "utf8");

    expect(publicNavigation).not.toContain("关于我们");
    expect(publicNavigation).not.toContain('href="/about"');
    expect(contactPage).not.toContain("购买咨询");
    expect(contactPage).not.toContain("订单售后");
    expect(contactPage).not.toContain("page-title");
    expect(contactPage).toContain("enterpriseContacts.map");
    expect(contactPage).toContain("<TaobaoServiceButton />");
    expect(contactPage).toContain("不会索取淘宝密码");
  });

  it("首页精选内容进入可控制的自动轮播，联系区保持独立", () => {
    const homePage = readFileSync(path.join(process.cwd(), "src/app/page.tsx"), "utf8");
    const carousel = readFileSync(path.join(process.cwd(), "src/components/HomeCarousel.tsx"), "utf8");

    expect(homePage).toContain("<HomeCarousel");
    expect(homePage).toContain("品牌主视觉");
    expect(homePage).toContain("理想营养");
    expect(homePage).toContain("三个版本");
    expect(homePage).toContain("TEAM ON");
    expect(homePage).toContain("防伪溯源");
    expect(homePage.indexOf("</HomeCarousel>")).toBeLessThan(homePage.indexOf("home-billboard-contact"));
    expect(carousel).toContain("window.setInterval");
    expect(carousel).toContain("IntersectionObserver");
    expect(carousel).toContain("prefers-reduced-motion: reduce");
    expect(carousel).toContain("暂停自动播放");
  });

  it("首页与联系页面均提供淘宝旺旺客服入口", () => {
    const homePage = readFileSync(path.join(process.cwd(), "src/app/page.tsx"), "utf8");
    const contactPage = readFileSync(path.join(process.cwd(), "src/app/contact/page.tsx"), "utf8");
    const serviceButton = readFileSync(path.join(process.cwd(), "src/components/TaobaoServiceButton.tsx"), "utf8");
    const siteConfig = readFileSync(path.join(process.cwd(), "src/lib/site.ts"), "utf8");

    expect(homePage).toContain("<TaobaoServiceButton />");
    expect(homePage).not.toContain("日常咨询优先旺旺");
    expect(homePage).not.toContain("商品、订单与售后问题，可直接进入淘宝店联系在线客服");
    expect(contactPage).toContain("<TaobaoServiceButton />");
    expect(serviceButton).toContain("旺旺客服");
    expect(serviceButton).toContain('target="_blank"');
    expect(siteConfig).toContain("https://spnc.taobao.com");
  });

  it("合规与资质位于 ON 专区二级菜单并使用 Batch 验证调取", () => {
    const header = readFileSync(path.join(process.cwd(), "src/components/Header.tsx"), "utf8");
    const page = readFileSync(path.join(process.cwd(), "src/app/compliance/page.tsx"), "utf8");
    const portal = readFileSync(path.join(process.cwd(), "src/components/CompliancePortal.tsx"), "utf8");

    expect(header).not.toContain('["合规与资质", "/compliance"]');
    expect(header).toContain('aria-label="ON 专区二级菜单"');
    expect(header).toContain('<Link href="/compliance"');
    expect(page).toContain("一桶，一批，一份对应资料");
    expect(portal).toContain("验证 Batch 并调取");
    expect(portal).toContain("提交资料申请");
    expect(portal).toContain("1 个工作日");
  });

  it("页面源码不出现未经确认的品牌身份表述或旧占位邮箱", () => {
    const content = sourceFiles(path.join(process.cwd(), "src")).map((filePath) => readFileSync(filePath, "utf8")).join("\n");
    [
      "官方" + "旗舰店",
      "总" + "代理",
      "唯一" + "授权",
      "melolaw1999" + "@gmail.com",
      "te" + "st" + "@exa" + "mple.com",
      "exa" + "mple" + ".com",
      "fin" + "ance" + "@spnc.cn",
      "Ide" + "al" + " Performance Nutrition",
      "Ide" + "al" + " Nutrition",
      "YAVA" + " LABS",
      "YAMA" + "MOTO",
      "King" + " Caesar",
    ].forEach((forbidden) => {
      expect(content.includes(forbidden)).toBe(false);
    });
  });

  it("首页 ON 商品区只使用 TEAM ON 标识", () => {
    const homePage = readFileSync(path.join(process.cwd(), "src/app/page.tsx"), "utf8");
    expect(homePage).toContain('aria-label="TEAM ON"');
    expect(homePage).not.toContain("ON Product Library");
    expect(homePage).not.toContain("ON 商品矩阵");
  });

  it("ON 专区先展示跨境进口系列，再展示国产系列", () => {
    const onPage = readFileSync(path.join(process.cwd(), "src/app/on/page.tsx"), "utf8");

    expect(onPage).toContain("跨境进口系列");
    expect(onPage).not.toContain("其他 ON 商品");
    expect(onPage.indexOf("跨境进口系列")).toBeLessThan(onPage.indexOf("ON 国产系列"));
  });

  it("公开商品页不显示内部资料整理与素材制作注释", () => {
    const buyerFacingFiles = [
      "src/features/official-protein/OfficialProteinShowcase.tsx",
      "src/features/official-protein/content.ts",
      "src/features/gold-standard/GoldStandardShowcase.tsx",
      "src/features/gold-standard/content.ts",
      "src/app/on/page.tsx",
      "src/components/ProductCard.tsx",
      "src/app/products/[slug]/page.tsx",
      "src/data/catalog.ts",
    ].map((filePath) => readFileSync(path.join(process.cwd(), filePath), "utf8")).join("\n");

    [
      "当前仅收录",
      "官网当前收录",
      "资料状态：",
      "已核对包装正面",
      "这里仅整理",
      "资料来源未公开",
      "不会生成、重绘",
      "真实素材复制件",
      "素材核对",
      "未制作翻译",
      "本页根据",
      "本页按",
      "页面只陈列",
      "官网收录状态",
    ].forEach((forbidden) => expect(buyerFacingFiles).not.toContain(forbidden));

    const officialShowcase = readFileSync(
      path.join(process.cwd(), "src/features/official-protein/OfficialProteinShowcase.tsx"),
      "utf8",
    );
    expect(officialShowcase).not.toContain("selectedVariant.sourceStatus");
    expect(officialShowcase).not.toContain("referenceNoteZh}");
  });

  it("公开入口只保留 ON 专区，不再展示商品矩阵", () => {
    const publicEntryFiles = [
      "src/components/Header.tsx",
      "src/components/Footer.tsx",
      "src/app/page.tsx",
      "src/app/about/page.tsx",
      "src/app/not-found.tsx",
    ].map((filePath) => readFileSync(path.join(process.cwd(), filePath), "utf8")).join("\n");
    const productsPage = readFileSync(path.join(process.cwd(), "src/app/products/page.tsx"), "utf8");

    expect(publicEntryFiles).not.toContain("商品矩阵");
    expect(publicEntryFiles).not.toContain('href="/products"');
    expect(productsPage).toContain('redirect("/on")');
  });

  it("首页 Hero 后展示理想营养品牌宣言与 ON 产品阵列", () => {
    const homePage = readFileSync(path.join(process.cwd(), "src/app/page.tsx"), "utf8");
    expect(homePage).toContain("立足全球");
    expect(homePage).toContain("耕耘中国大陆");
    expect(homePage).toContain("10,000");
    expect(homePage).toContain("不可替代");
    expect(homePage).toContain('href="/on"');
    expect(homePage).toContain("id=794493827958");
    expect(homePage).toContain("double-rich-chocolate-front-transparent-v2.png");
    expect(homePage).not.toContain("长期训练");
  });

  it("首页与版本说明页一致区分三种销售版本", () => {
    const homePage = readFileSync(path.join(process.cwd(), "src/app/page.tsx"), "utf8");
    const versionsPage = readFileSync(path.join(process.cwd(), "src/app/versions/page.tsx"), "utf8");

    expect(homePage).toContain("同是 ON");
    expect(homePage).toContain("看懂三个版本");
    expect(homePage).toContain('href="/versions"');

    ["跨境进口版", "一般贸易进口版", "国产版本"].forEach((version) => {
      expect(versionsPage).toContain(version);
    });
    expect(versionsPage).toContain("三个版本");
    expect(versionsPage).toContain("均有防伪码");
    expect(versionsPage).toContain("跨境进口再扫描溯源码");
    expect(versionsPage).toContain("境内保税仓发货");
    expect(versionsPage).toContain("中国生产");
  });

  it("首页使用两种真实标签介绍防伪溯源，并移除售后登记信息栏", () => {
    const homePage = readFileSync(path.join(process.cwd(), "src/app/page.tsx"), "utf8");

    expect(homePage).toContain("两种码");
    expect(homePage).toContain("ON 防伪码");
    expect(homePage).toContain("进口商品溯源码");
    expect(homePage).toContain("on-authentication-label-transparent.png");
    expect(homePage).toContain("import-traceability-label-crop.png");
    expect(homePage).not.toContain("home-billboard-service");
    expect(homePage).not.toContain("<h2>售后登记</h2>");
  });
});
