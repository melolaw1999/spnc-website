import Image from "next/image";
import styles from "./SouthernLogo.module.css";

export function SouthernLogo({ className }: { className?: string }) {
  return (
    <span className={[styles.mark, className].filter(Boolean).join(" ")}>
      <Image
        src="/assets/brand/southern-ecommerce-logo.png"
        width={2587}
        height={1413}
        alt="Southern E-Commerce 企业标识"
        loading="lazy"
        sizes="(max-width: 560px) 320px, 360px"
      />
    </span>
  );
}
