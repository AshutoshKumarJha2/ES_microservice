import styles from '../../../css/finance/Finance.module.css'

const STATUS_STYLE_MAP: Record<string, string> = {
  SUBMITTED: styles.badgeYellow,
  APPROVED: styles.badgeGreen,
  REJECTED: styles.badgeRed,
  PAID: styles.badgeBlue,
  PENDING: styles.badgeYellow,
  COMPLETED: styles.badgeGreen,
  FAILED: styles.badgeRed,
  REFUNDED: styles.badgeGray,
}

export const StatusBadge = ({ status }: { status: string }) => (
  <span className={`${styles.badge} ${STATUS_STYLE_MAP[status] || styles.badgeGray}`}>
    {status}
  </span>
)
