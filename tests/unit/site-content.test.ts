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

  it("公开导航暂不显示关于我们，联系页面只保留邮箱卡片与安全提示", () => {
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
    expect(contactPage).toContain("不会索取淘宝密码");
  });

  it("公开导航提供合规与资质入口并使用 Batch 验证调取", () => {
    const header = readFileSync(path.join(process.cwd(), "src/components/Header.tsx"), "utf8");
    const page = readFileSync(path.join(process.cwd(), "src/app/compliance/page.tsx"), "utf8");
    const portal = readFileSync(path.join(process.cwd(), "src/components/CompliancePortal.tsx"), "utf8");

    expect(header).toContain('["合规与资质", "/compliance"]');
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

  it("首页 Hero 后展示跨境版金标乳清 BEST SELLER", () => {
    const homePage = readFileSync(path.join(process.cwd(), "src/app/page.tsx"), "utf8");
    expect(homePage).toContain("BEST SELLER");
    expect(homePage).toContain("/products/on-gold-standard-whey");
    expect(homePage).toContain("id=794493827958");
    expect(homePage).toContain("5 磅双重巧克力跨境版");
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
