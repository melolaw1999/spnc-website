import Image from "next/image";
import Link from "next/link";

const links = [
  ["商品矩阵", "/products"],
  ["ON 专区", "/on"],
  ["防伪溯源", "/authenticity"],
  ["版本说明", "/versions"],
  ["售后 FAQ", "/faq"],
  ["售后登记", "/support"],
  ["关于我们", "/about"],
  ["联系我们", "/contact"],
] as const;

export function Header() {
  return <header className="nav"><div className="container navin">
    <Link href="/" className="brand brand-image" aria-label="SPNC 理想营养首页"><Image src="/assets/brand/spnc-logo-blue.png" width={1326} height={700} alt="SPNC 理想营养 Logo" priority sizes="164px" /></Link>
    <nav className="navlinks" aria-label="主导航">{links.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}</nav>
    <details className="mobile-nav"><summary>菜单</summary><nav>{links.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}</nav></details>
  </div></header>;
}
