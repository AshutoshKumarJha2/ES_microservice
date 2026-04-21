import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Row, Col, Card, Badge, Button, Spinner } from 'react-bootstrap'
import {
  CalendarCheckFill, CheckCircleFill, XCircleFill, BookmarkCheckFill, GeoAltFill,
} from 'react-bootstrap-icons'
import { toast } from 'react-toastify'
import { eventService } from '../../../services/events/eventService'
import { registrationService } from '../../../services/events/registrationService'
import { EventStatusBadge } from '../../elements/events/EventStatusBadge'
import { StatCard } from '../../elements/common/StatCard'
import { PageBanner } from '../../elements/common/PageBanner'
import { LoadingSpinner } from '../../elements/common/LoadingSpinner'
import { fmtDate } from '../../../utils/dateHelpers'
import { EVENT_LABEL, REG_STATUS_COLOR, REG_STATUS_LABEL } from '../../../constants/eventConstants'
import type { EventResponseDto, RegistrationDto } from '../../../types/events'

interface RegWithEvent {
  registration: RegistrationDto
  event: EventResponseDto
}

const ACTIVE_STATUSES = new Set(['PENDING', 'CONFIRMED', 'CHECKED_IN'])

export const AttendeeMyRegistrations = () => {
  const navigate = useNavigate()

  const [loading, setLoading]           = useState(true)
  const [items, setItems]               = useState<RegWithEvent[]>([])
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    Promise.allSettled([
      eventService.getAll(),
      registrationService.getMyRegistrations(),
    ]).then(([eventsR, regsR]) => {
      if (eventsR.status === 'rejected' || regsR.status === 'rejected') return
      const eventMap = new Map(eventsR.value.map((e) => [e.id, e]))
      const found: RegWithEvent[] = regsR.value.registrations
        .map((reg) => {
          const event = eventMap.get(reg.eventId)
          return event ? { registration: reg, event } : null
        })
        .filter((x): x is RegWithEvent => x !== null)
      setItems(found)
    }).finally(() => setLoading(false))
  }, [])

  const handleCancel = async (regWithEvent: RegWithEvent) => {
    if (!window.confirm('Cancel your registration for this event?')) return
    setCancellingId(regWithEvent.registration.registrationId)
    try {
      await registrationService.cancel(regWithEvent.registration.registrationId)
      setItems((prev) =>
        prev.map((i) =>
          i.registration.registrationId === regWithEvent.registration.registrationId
            ? { ...i, registration: { ...i.registration, status: 'CANCELLED' } }
            : i
        )
      )
      toast.info('Registration cancelled.')
    } catch {
      toast.error('Failed to cancel registration.')
    } finally {
      setCancellingId(null)
    }
  }

  const activeItems   = items.filter((i) => ACTIVE_STATUSES.has(i.registration.status))
  const trueActive    = activeItems.filter((i) => i.event.status !== 'COMPLETED')
  const truePast      = items.filter((i) => !trueActive.includes(i))
  const cancelledCount = items.filter((i) => i.registration.status === 'CANCELLED').length

  const STATS = [
    { label: 'Total',     value: items.length,        accent: 'es-stat-card-orange',
      icon: <BookmarkCheckFill size={18} />, iconBg: 'var(--saffron-subtle)', iconColor: 'var(--saffron)' },
    { label: 'Active',    value: trueActive.length,    accent: 'es-stat-card-blue',
      icon: <CalendarCheckFill size={18} />, iconBg: 'var(--blue-subtle)', iconColor: 'var(--blue)' },
    { label: 'Completed', value: truePast.length - cancelledCount, accent: 'es-stat-card-green',
      icon: <CheckCircleFill size={18} />, iconBg: 'var(--green-subtle)', iconColor: 'var(--green)' },
    { label: 'Cancelled', value: cancelledCount,       accent: 'es-stat-card-red',
      icon: <XCircleFill size={18} />, iconBg: 'var(--red-subtle)', iconColor: 'var(--red)' },
  ]

  const RegCard = ({ item, dimmed }: { item: RegWithEvent; dimmed?: boolean }) => {
    const { registration: reg, event } = item
    const isCancellable = (reg.status === 'PENDING' || reg.status === 'CONFIRMED') && event.status !== 'COMPLETED'
    return (
      <Card className={`es-card border shadow-sm h-100${dimmed ? ' opacity-75' : ''}`}>
        <Card.Body className="p-3 d-flex flex-column gap-2">
          <div className="d-flex justify-content-between align-items-start">
            <div className="fw-semibold" style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.3 }}>
              {event.eventName}
            </div>
            <EventStatusBadge status={event.status?.toLowerCase()} variant="event" label={EVENT_LABEL[event.status] ?? event.status} />
          </div>

          <div className="small" style={{ color: 'var(--text-secondary)' }}>
            {fmtDate(event.startAt)} — {fmtDate(event.endAt)}
          </div>

          {event.venue && (
            <div className="small d-flex align-items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              <GeoAltFill size={11} />
              {event.venue.name}, {event.venue.location}
            </div>
          )}

          <div className="d-flex align-items-center gap-2 flex-wrap" style={{ fontSize: '0.82rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>
              {reg.ticketType ?? 'General'}
              {reg.ticketPrice != null ? ` · ₹${reg.ticketPrice.toLocaleString()}` : ''}
            </span>
            <Badge bg={REG_STATUS_COLOR[reg.status] ?? 'secondary'} className="rounded-2">
              {REG_STATUS_LABEL[reg.status] ?? reg.status}
            </Badge>
          </div>

          <div className="d-flex gap-2 mt-auto pt-1">
            <Button
              variant="outline-primary"
              size="sm"
              className="rounded-3 flex-grow-1"
              style={{ fontSize: '0.85rem' }}
              onClick={() => navigate(`/attendee/events/${event.id}`)}
            >
              View Event
            </Button>
            {isCancellable && (
              <Button
                variant="outline-danger"
                size="sm"
                className="rounded-3"
                style={{ fontSize: '0.85rem' }}
                onClick={() => handleCancel(item)}
                disabled={cancellingId === reg.registrationId}
              >
                {cancellingId === reg.registrationId
                  ? <><Spinner animation="border" size="sm" className="me-1" />Cancelling…</>
                  : 'Cancel'}
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>
    )
  }

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <PageBanner title="My Registrations" subtitle="Track your event registrations" />

      <Container fluid className="px-3 px-md-4 py-4">
        {/* Stats */}
        <Row className="g-3 mb-4">
          {STATS.map((s) => (
            <Col key={s.label} xs={6} lg={3}>
              <StatCard {...s} loading={loading} />
            </Col>
          ))}
        </Row>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* Active section */}
            <div className="mb-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <h6 className="fw-semibold mb-0" style={{ color: 'var(--text-primary)' }}>Active</h6>
                <Badge bg="primary" className="rounded-pill">{trueActive.length}</Badge>
              </div>
              {trueActive.length === 0 ? (
                <Card className="es-card border shadow-sm">
                  <Card.Body className="text-center py-4 d-flex flex-column align-items-center gap-2">
                    <span className="small" style={{ color: 'var(--text-muted)' }}>No active registrations.</span>
                    <Button variant="primary" size="sm" className="rounded-3 fw-semibold" onClick={() => navigate('/events')}>
                      Browse Events
                    </Button>
                  </Card.Body>
                </Card>
              ) : (
                <Row className="g-3">
                  {trueActive.map((item) => (
                    <Col key={item.registration.registrationId} xs={12} md={6} lg={4}>
                      <RegCard item={item} />
                    </Col>
                  ))}
                </Row>
              )}
            </div>

            {/* Past section */}
            <div>
              <div className="d-flex align-items-center gap-2 mb-3">
                <h6 className="fw-semibold mb-0" style={{ color: 'var(--text-primary)' }}>Past & Cancelled</h6>
                <Badge bg="secondary" className="rounded-pill">{truePast.length}</Badge>
              </div>
              {truePast.length === 0 ? (
                <Card className="es-card border shadow-sm">
                  <Card.Body className="text-center py-4 small" style={{ color: 'var(--text-muted)' }}>
                    No past registrations.
                  </Card.Body>
                </Card>
              ) : (
                <Row className="g-3">
                  {truePast.map((item) => (
                    <Col key={item.registration.registrationId} xs={12} md={6} lg={4}>
                      <RegCard item={item} dimmed />
                    </Col>
                  ))}
                </Row>
              )}
            </div>
          </>
        )}
      </Container>
    </div>
  )
}
