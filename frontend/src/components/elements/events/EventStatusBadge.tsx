import { Badge } from 'react-bootstrap'

type BadgeVariant = 'event' | 'registration' | 'expense' | 'schedule'

const EVENT_MAP: Record<string, string> = {
  draft:     'es-badge-draft',
  published: 'es-badge-published',
  completed: 'es-badge-completed',
  cancelled: 'es-badge-cancelled',
}

const REG_MAP: Record<string, string> = {
  PENDING:  'es-badge-pending',
  APPROVED: 'es-badge-approved',
  REJECTED: 'es-badge-rejected',
}

const EXP_MAP: Record<string, string> = {
  APPROVED:  'es-badge-approved',
  PAID:      'es-badge-paid',
  REJECTED:  'es-badge-rejected',
  SUBMITTED: 'es-badge-submitted',
}

const SCHEDULE_MAP: Record<string, string> = {
  draft:      'es-badge-draft',
  active:     'es-badge-published',
  completed:  'es-badge-completed',
  terminated: 'es-badge-cancelled',
}

const MAPS: Record<BadgeVariant, Record<string, string>> = {
  event:        EVENT_MAP,
  registration: REG_MAP,
  expense:      EXP_MAP,
  schedule:     SCHEDULE_MAP,
}

const FALLBACKS: Record<BadgeVariant, string> = {
  event:        'es-badge-draft',
  registration: 'es-badge-pending',
  expense:      'es-badge-submitted',
  schedule:     'es-badge-draft',
}

interface Props {
  status: string
  variant: BadgeVariant
  label?: string
}

export const EventStatusBadge = ({ status, variant, label }: Props) => {
  const map = MAPS[variant]
  const cls = map[status] ?? map[status?.toLowerCase()] ?? FALLBACKS[variant]
  return (
    <Badge className={`${cls} border-0`} style={{ fontSize: '0.7rem' }}>
      {label ?? status}
    </Badge>
  )
}
