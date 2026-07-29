import { taobaoStoreUrl } from "@/lib/site";

export function TaobaoButton({ label, secondary = false }: { label: string; secondary?: boolean }) {
  return <a className={`btn${secondary ? " secondary" : ""}`} href={taobaoStoreUrl} target="_blank" rel="noopener noreferrer">{label}</a>;
}
