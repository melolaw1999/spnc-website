import { taobaoStoreUrl } from "@/lib/site";
import { TaobaoStoreLink } from "@/components/TaobaoStoreLink";

export function TaobaoButton({ label, secondary = false }: { label: string; secondary?: boolean }) {
  return <TaobaoStoreLink className={`btn${secondary ? " secondary" : ""}`} href={taobaoStoreUrl}>{label}</TaobaoStoreLink>;
}
