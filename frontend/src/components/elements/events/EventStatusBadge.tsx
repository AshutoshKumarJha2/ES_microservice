import styles from '../../../css/events/EventsPanel.module.css'

type BadgeVariant = 'event' | 'registration' | 'expense' | 'schedule'

const EVENT_MAP: Record<string, string> = {
  draft:     styles['badge-draft'],
  published: styles['badge-published'],
  completed: styles['badge-completed'],
  cancelled: styles['badge-cancelled'],
}

const REG_MAP: Record<string, string> = {
  PENDING:  styles['badge-pending'],
  APPROVED: styles['badge-approved'],
  REJECTED: styles['badge-rejected'],
}

const EXP_MAP: Record<string, string> = {
  APPROVED:  styles['badge-approved'],
  PAID:      styles['badge-paid'],
  REJECTED:  styles['badge-rejected'],
  SUBMITTED: styles['badge-submitted'],
}

const SCHEDULE_MAP: Record<string, string> = {
  draft:      styles['badge-draft'],
  active:     styles['badge-published'],
  completed:  styles['badge-completed'],
  terminated: styles['badge-cancelled'],
}

const MAPS: Record<BadgeVariant, Record<string, string>> = {
  event:        EVENT_MAP,
  registration: REG_MAP,
  expense:      EXP_MAP,
  schedule:     SCHEDULE_MAP,
}

const FALLBACKS: Record<BadgeVariant, string> = {
  event:        styles['badge-draft'],
  registration: styles['badge-pending'],
  expense:      styles['badge-submitted'],
  schedule:     styles['badge-draft'],
}

interface Props {
  status: string
  variant: BadgeVariant
}

export const EventStatusBadge = ({ status, variant }: Props) => {
  const map = MAPS[variant]
  const cls = map[status] ?? map[status?.toLowerCase()] ?? FALLBACKS[variant]
  return <span className={`${styles.badge} ${cls}`}>{status}</span>
}
