import { Badge } from 'react-bootstrap'

const STATUS_CLASS: Record<string, string> = {
  SUBMITTED: 'es-badge-submitted',
  APPROVED:  'es-badge-approved',
  REJECTED:  'es-badge-rejected',
  PAID:      'es-badge-paid',
  PENDING:   'es-badge-pending',
  COMPLETED: 'es-badge-completed',
  FAILED:    'es-badge-cancelled',
  REFUNDED:  'es-badge-draft',
}

export const StatusBadge = ({ status }: { status: string }) => (
  <Badge
    className={`${STATUS_CLASS[status] ?? 'es-badge-draft'} border-0`}
    style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}
  >
    {status}
  </Badge>
)
