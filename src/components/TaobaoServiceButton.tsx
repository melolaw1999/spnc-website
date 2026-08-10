import { taobaoStoreUrl } from "@/lib/site";
import styles from "./TaobaoServiceButton.module.css";

type TaobaoServiceButtonProps = {
  className?: string;
};

export function TaobaoServiceButton({ className = "" }: TaobaoServiceButtonProps) {
  return <a
    className={`${styles.button} ${className}`.trim()}
    href={taobaoStoreUrl}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="前往理想营养淘宝店联系旺旺客服"
  >
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.2 18.2c-2.1-1.35-3.45-3.6-3.45-6.15 0-4.05 3.48-7.3 7.9-7.3s7.9 3.25 7.9 7.3-3.48 7.3-7.9 7.3c-.9 0-1.76-.14-2.55-.39l-2.95 1.1 1.05-1.86Z" />
      <path d="M9.1 10.9v2.15M14.2 10.9v2.15" />
      <path d="M9.35 7.4c.55-.82 1.33-1.28 2.3-1.28.96 0 1.75.46 2.3 1.28" />
    </svg>
    <span>旺旺客服</span>
  </a>;
}
