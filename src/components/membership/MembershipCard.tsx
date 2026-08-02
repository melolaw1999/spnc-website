import styles from "@/app/membership/membership.module.css";

type MembershipCardProps = {
  compact?: boolean;
  memberName?: string;
  memberNumber?: string;
  validThrough?: string;
};

export function MembershipCard({
  compact = false,
  memberName = "SPNC MEMBER",
  memberNumber = "SPNC •••• ••••",
  validThrough = "激活后 365 天",
}: MembershipCardProps) {
  return <div className={`${styles.memberCard} ${compact ? styles.memberCardCompact : ""}`}>
    <div className={styles.cardGlow} aria-hidden="true" />
    <div className={styles.cardTop}><span>SPNC</span><b>BLACK</b></div>
    <div className={styles.cardMark} aria-hidden="true"><span>2</span><small>%</small></div>
    <div className={styles.cardBottom}>
      <div><small>MEMBER</small><strong>{memberName}</strong></div>
      <div><small>MEMBERSHIP NO.</small><strong>{memberNumber}</strong></div>
      <div><small>VALID THROUGH</small><strong>{validThrough}</strong></div>
    </div>
  </div>;
}

