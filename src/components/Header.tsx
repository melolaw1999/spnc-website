import Image from "next/image";
import Link from "next/link";
import styles from "./Header.module.css";

const links = [
  ["防伪溯源", "/authenticity"],
  ["版本说明", "/versions"],
  ["文章", "/articles"],
  ["黑卡会员", "/membership"],
  ["售后登记", "/support"],
  ["联系我们", "/contact"],
] as const;

export function Header() {
  return <header className="nav"><div className="container navin">
    <Link href="/" className="brand brand-image" aria-label="SPNC 理想营养首页"><Image src="/assets/brand/spnc-logo-blue.png" width={1326} height={700} alt="SPNC 理想营养 Logo" priority sizes="164px" /></Link>
    <nav className="navlinks" aria-label="主导航">
      <div className={styles.onMenu}>
        <Link className={styles.onMenuTrigger} href="/on">ON 专区 <span aria-hidden="true">⌄</span></Link>
        <div className={styles.onSubmenu} aria-label="ON 专区二级菜单">
          <Link href="/on"><small>01</small><span>ON 专区首页</span></Link>
          <Link href="/compliance"><small>02</small><span>合规与资质</span></Link>
        </div>
      </div>
      {links.map(([label, href]) => <Link className={href === "/membership" ? styles.blackMembershipLink : undefined} href={href} key={href}>{label}</Link>)}
    </nav>
    <details className="mobile-nav"><summary>菜单</summary><nav>
      <div className={styles.mobileOnMenu}><Link href="/on">ON 专区</Link><Link href="/compliance"><small>ON 专区内</small>合规与资质</Link></div>
      {links.map(([label, href]) => <Link className={href === "/membership" ? styles.blackMembershipLink : undefined} href={href} key={href}>{label}</Link>)}
    </nav></details>
  </div></header>;
}
