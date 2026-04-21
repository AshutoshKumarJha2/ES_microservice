import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Row, Col, Card, Button, Spinner, Form, Badge } from 'react-bootstrap'
import { CalendarEventFill, CalendarCheckFill, CheckCircleFill } from 'react-bootstrap-icons'
import { eventService } from '../../../services/events/eventService'
import { registrationService } from '../../../services/events/registrationService'
import { EventStatusBadge } from '../../elements/events/EventStatusBadge'
import type { EventResponseDto, RegistrationDto } from '../../../types/events'

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) }
  catch { return iso }
}

type StatusFilter = 'ALL' | 'PUBLISHED' | 'COMPLETED'

const EVENT_LABEL: Record<string, string> = {
  PUBLISHED: 'Upcoming',
  COMPLETED: 'Ended',
  CANCELLED: 'Cancelled',
}

const REG_STATUS_COLOR: Record<string, string> = {
  PENDING:    'warning',
  CONFIRMED:  'success',
  CHECKED_IN: 'primary',
  CANCELLED:  'secondary',
}

export const AttendeeEventBrowser = () => {
  const navigate = useNavigate()

  const [events, setEvents]   = useState<EventResponseDto[]>([])
  const [regMap, setRegMap]   = useState<Map<string, RegistrationDto>>(new Map())
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState<StatusFilter>('PUBLISHED')

  useEffect(() => {
    Promise.allSettled([
      eventService.getAll(),
      registrationService.getMyRegistrations(),
    ]).then(([eventsR, regsR]) => {
      if (eventsR.status === 'fulfilled') setEvents(eventsR.value)
      if (regsR.status === 'fulfilled') {
        const map = new Map<string, RegistrationDto>()
        regsR.value.registrations.forEach((r) => map.set(r.eventId, r))
        setRegMap(map)
      }
    }).finally(() => setLoading(false))
  }, [])

  const filtered = events.filter((e) => {
    const matchSearch = e.eventName.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filter === 'ALL' || e.status === filter
    return matchSearch && matchStatus
  })

  const published = events.filter((e) => e.status === 'PUBLISHED').length
  const completed = events.filter((e) => e.status === 'COMPLETED').length

  const STATS = [
    { label: 'Total Events', value: events.length, accent: 'es-stat-card-orange',
      icon: <CalendarEventFill size={18} />, iconBg: 'var(--saffron-subtle)', iconColor: 'var(--saffron)' },
    { label: 'Upcoming',     value: published,      accent: 'es-stat-card-blue',
      icon: <CalendarCheckFill size={18} />, iconBg: 'var(--blue-subtle)', iconColor: 'var(--blue)' },
    { label: 'Completed',    value: completed,      accent: 'es-stat-card-green',
      icon: <CheckCircleFill size={18} />, iconBg: 'var(--green-subtle)', iconColor: 'var(--green)' },
  ]

  const FILTERS: { label: string; value: StatusFilter }[] = [
    { label: 'All',       value: 'ALL'       },
    { label: 'Upcoming',  value: 'PUBLISHED' },
    { label: 'Completed', value: 'COMPLETED' },
  ]

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      {/* Banner */}
      <div className="es-banner">
        <Container fluid className="px-3 px-md-4 py-3">
          <h1 className="fw-bold fs-3 mb-1">Browse Events</h1>
          <p className="mb-0 small" style={{ color: 'rgba(255,255,255,0.72)' }}>Discover and register for upcoming events</p>
        </Container>
      </div>

      <Container fluid className="px-3 px-md-4 py-4">
        {/* Stats */}
        <Row className="g-3 mb-4">
          {STATS.map((s) => (
            <Col key={s.label} xs={6} lg={3}>
              <Card className={`es-card border shadow-sm h-100 ${s.accent}`}>
                <Card.Body className="p-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="small fw-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{s.label}</div>
                      <div className="fw-bold" style={{ fontSize: '1.8rem', color: 'var(--text-primary)', lineHeight: 1.1 }}>
                        {loading ? '—' : s.value}
                      </div>
                    </div>
                    <div
                      style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: s.iconBg, color: s.iconColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}
                    >
                      {s.icon}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Search & filter bar */}
        <div className="d-flex flex-wrap gap-2 align-items-center mb-4">
          <Form.Control
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events…"
            className="es-form-control rounded-3"
            style={{ maxWidth: 280 }}
          />
          <div className="d-flex gap-2">
            {FILTERS.map((f) => (
              <Button
                key={f.value}
                size="sm"
                variant={filter === f.value ? 'primary' : 'outline-secondary'}
                className="rounded-3 fw-medium"
                style={{ fontSize: '0.82rem' }}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </Button>
            ))}
          </div>
          <span className="small ms-auto" style={{ color: 'var(--text-muted)' }}>
            {filtered.length} event{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Event cards */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" style={{ color: 'var(--blue)' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-5 d-flex flex-column align-items-center gap-3">
            <div
              style={{
                width: 56, height: 56, borderRadius: 16,
                background: 'var(--blue-subtle)', color: 'var(--blue)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <CalendarEventFill size={24} />
            </div>
            <div>
              <div className="fw-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No events found</div>
              <div className="small" style={{ color: 'var(--text-muted)' }}>Try a different search or filter.</div>
            </div>
          </div>
        ) : (
          <Row className="g-3">
            {filtered.map((event) => {
              const venue = event.venue ?? null
              const reg   = regMap.get(event.id)
              return (
                <Col key={event.id} xs={12} md={6} lg={4}>
                  <Card className="es-card border shadow-sm h-100">
                    <Card.Body className="p-3 d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <Card.Title
                          className="fw-semibold mb-0 me-2"
                          style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.3 }}
                        >
                          {event.eventName}
                        </Card.Title>
                        <EventStatusBadge status={event.status?.toLowerCase()} variant="event" label={EVENT_LABEL[event.status] ?? event.status} />
                      </div>

                      <div className="small mb-1" style={{ color: 'var(--text-secondary)' }}>
                        {fmtDate(event.startAt)} — {fmtDate(event.endAt)}
                      </div>

                      {venue ? (
                        <div className="small mb-2 d-flex align-items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                          <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                          </svg>
                          {venue.name}, {venue.location}
                        </div>
                      ) : (
                        <div className="mb-2" />
                      )}

                      {reg && reg.status !== 'CANCELLED' && (
                        <div className="mb-2">
                          <Badge bg={REG_STATUS_COLOR[reg.status] ?? 'secondary'} className="rounded-2" style={{ fontSize: '0.75rem' }}>
                            {reg.status === 'CHECKED_IN' ? 'Checked In' : reg.status === 'CONFIRMED' ? 'Confirmed' : reg.status === 'PENDING' ? 'Registered' : reg.status}
                          </Badge>
                        </div>
                      )}

                      <div className="mt-auto">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="rounded-3 w-100 fw-medium"
                          style={{ fontSize: '0.82rem' }}
                          onClick={() => navigate(`/attendee/events/${event.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              )
            })}
          </Row>
        )}
      </Container>
    </div>
  )
}
