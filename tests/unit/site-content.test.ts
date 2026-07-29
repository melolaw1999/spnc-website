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
      "melolaw@spnc.cn",
    ]);
    expect(enterpriseContacts.every((contact) => mailto(contact.email) === `mailto:${contact.email}`)).toBe(true);
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
});
