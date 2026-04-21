import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Container, Row, Col, Card, Nav, Spinner, Alert, Button,
  Form, Table, Badge,
} from 'react-bootstrap'
import { ArrowLeft, StarFill, Star } from 'react-bootstrap-icons'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchFeedback } from '../../../store/slices/analyticsSlice'
import { toast } from 'react-toastify'
import { eventService } from '../../../services/events/eventService'
import { ticketService } from '../../../services/events/ticketService'
import { registrationService } from '../../../services/events/registrationService'
import { EventStatusBadge } from '../../elements/events/EventStatusBadge'
import { PanelHeader } from '../../elements/events/PanelHeader'
import { fmtDate } from '../../../utils/dateHelpers'
import { EVENT_LABEL, REG_STATUS_COLOR, REG_STATUS_LABEL } from '../../../constants/eventConstants'
import type {
  EventResponseDto, ScheduleResponseDto, TicketResponseDto, RegistrationDto,
} from '../../../types/events'

const REG_BADGE_COLOR: Record<string, string> = {
  PENDING:    '#f59e0b',
  CONFIRMED:  '#22c55e',
  CHECKED_IN: '#3b82f6',
  CANCELLED:  '#6b7280',
}

type Tab = 'overview' | 'schedule' | 'registration'

export const AttendeeEventDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { feedback } = useAppSelector((s) => s.analytics)

  const [tab, setTab]                   = useState<Tab>('overview')
  const [event, setEvent]               = useState<EventResponseDto | null>(null)
  const [schedules, setSchedules]       = useState<ScheduleResponseDto[]>([])
  const [tickets, setTickets]           = useState<TicketResponseDto[]>([])
  const [registration, setRegistration] = useState<RegistrationDto | null>(null)
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState<string | null>(null)

  const [selectedTicket, setSelectedTicket] = useState('')
  const [registering, setRegistering]       = useState(false)
  const [regError, setRegError]             = useState<string | null>(null)
  const [cancelling, setCancelling]         = useState(false)

  const avgRating = useMemo(() => {
    const rated = feedback.filter((f) => (f.rating ?? 0) > 0)
    if (rated.length === 0) return null
    const sum = rated.reduce((acc, f) => acc + (f.rating ?? 0), 0)
    return { score: (sum / rated.length), count: feedback.length }
  }, [feedback])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    dispatch(fetchFeedback({ eventId: id, size: 100 }))
    Promise.allSettled([
      eventService.getById(id),
      eventService.getSchedules(id),
      ticketService.getByEventId(id, 0, 50),
      registrationService.getMyRegistration(id),
    ])
      .then(([evtR, schedsR, ticketsR, regR]) => {
        if (evtR.status === 'rejected') { setError('Failed to load event details.'); return }
        const evt = evtR.value
        setEvent(evt)
        if (schedsR.status === 'fulfilled') setSchedules(schedsR.value)
        if (ticketsR.status === 'fulfilled') setTickets(ticketsR.value.tickets ?? [])
        if (regR.status === 'fulfilled')    setRegistration(regR.value)
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleRegister = async () => {
    if (!id || !selectedTicket) return
    setRegistering(true)
    setRegError(null)
    try {
      const reg = await registrationService.register(id, selectedTicket)
      setRegistration(reg)
      toast.success('Successfully registered for the event!')
    } catch {
      setRegError('Registration failed. You may already be registered or the event is not accepting registrations.')
    } finally {
      setRegistering(false)
    }
  }

  const handleCancel = async () => {
    if (!registration) return
    if (!window.confirm('Cancel your registration for this event?')) return
    setCancelling(true)
    try {
      await registrationService.cancel(registration.registrationId)
      setRegistration((prev) => prev ? { ...prev, status: 'CANCELLED' } : prev)
      toast.info('Registration cancelled.')
    } catch {
      toast.error('Failed to cancel registration.')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }} className="d-flex align-items-center justify-content-center">
        <Spinner animation="border" style={{ color: 'var(--blue)' }} />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }} className="p-4">
        <Alert variant="danger">{error ?? 'Event not found.'}</Alert>
        <Button variant="outline-secondary" size="sm" onClick={() => navigate('/events')}>← Back to Events</Button>
      </div>
    )
  }

  const canRegister   = event.status === 'PUBLISHED' && !registration
  const canCancel     = registration && (registration.status === 'PENDING' || registration.status === 'CONFIRMED')
  const canFeedback   = registration?.status === 'CONFIRMED' || registration?.status === 'CHECKED_IN'
  const activeTickets = tickets.filter((t) => t.status === 'ACTIVE')

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      {/* Banner */}
      <div className="es-banner">
        <Container fluid className="px-3 px-md-4 py-3">
          <button
            onClick={() => navigate('/events')}
            className="btn btn-link p-0 mb-2 d-flex align-items-center gap-1"
            style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem', textDecoration: 'none' }}
          >
            <ArrowLeft size={13} /> Browse Events
          </button>
          <div className="d-flex flex-wrap align-items-center gap-3">
            <div>
              <h1 className="fw-bold fs-3 mb-1">{event.eventName}</h1>
              <p className="mb-0 small" style={{ color: 'rgba(255,255,255,0.72)' }}>
                {fmtDate(event.startAt)} — {fmtDate(event.endAt)}
              </p>
            </div>
            <EventStatusBadge status={event.status?.toLowerCase()} variant="event" label={EVENT_LABEL[event.status] ?? event.status} />
            {registration && (
              <span
                className="rounded-2 px-2 py-1 fw-semibold"
                style={{
                  fontSize: '0.75rem',
                  background: REG_BADGE_COLOR[registration.status] ?? '#6b7280',
                  color: '#fff',
                }}
              >
                {REG_STATUS_LABEL[registration.status] ?? registration.status}
              </span>
            )}
          </div>
        </Container>
      </div>

      {/* Tab navigation */}
      <div
        className="border-bottom"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)', transition: 'background 0.3s' }}
      >
        <Container fluid className="px-3 px-md-4">
          <Nav>
            {([
              { key: 'overview',     label: 'Overview'        },
              { key: 'schedule',     label: 'Schedule'        },
              { key: 'registration', label: 'My Registration' },
            ] as { key: Tab; label: string }[]).map(({ key, label }) => (
              <Nav.Link
                key={key}
                onClick={() => setTab(key)}
                style={{
                  color:         tab === key ? 'var(--blue)' : 'var(--text-secondary)',
                  fontWeight:    tab === key ? 600 : 400,
                  borderBottom:  tab === key ? '2px solid var(--blue)' : '2px solid transparent',
                  paddingBottom: '0.6rem',
                  paddingTop:    '0.6rem',
                  fontSize:      '0.9rem',
                  cursor:        'pointer',
                  marginRight:   '0.25rem',
                }}
              >
                {label}
              </Nav.Link>
            ))}
          </Nav>
        </Container>
      </div>

      <Container fluid className="px-3 px-md-4 py-4">

        {/* ── Overview tab ───────────────────────────────────────────────── */}
        {tab === 'overview' && (
          <Row className="g-3">
            <Col xs={12} lg={6}>
              <Card className="es-card border shadow-sm h-100">
                <Card.Body className="p-3 p-md-4">
                  <PanelHeader title="Event Details" />
                  <dl className="mb-0" style={{ fontSize: '0.88rem' }}>
                    <Row as="div" className="g-2">
                      <Col xs={5} className="fw-medium" style={{ color: 'var(--text-secondary)' }}>Name</Col>
                      <Col xs={7} style={{ color: 'var(--text-primary)' }}>{event.eventName}</Col>
                      <Col xs={5} className="fw-medium" style={{ color: 'var(--text-secondary)' }}>Start Date</Col>
                      <Col xs={7} style={{ color: 'var(--text-primary)' }}>{fmtDate(event.startAt)}</Col>
                      <Col xs={5} className="fw-medium" style={{ color: 'var(--text-secondary)' }}>End Date</Col>
                      <Col xs={7} style={{ color: 'var(--text-primary)' }}>{fmtDate(event.endAt)}</Col>
                      <Col xs={5} className="fw-medium" style={{ color: 'var(--text-secondary)' }}>Status</Col>
                      <Col xs={7}><EventStatusBadge status={event.status?.toLowerCase()} variant="event" label={EVENT_LABEL[event.status] ?? event.status} /></Col>
                      {event.organizer && (
                        <>
                          <Col xs={5} className="fw-medium" style={{ color: 'var(--text-secondary)' }}>Organizer</Col>
                          <Col xs={7} style={{ color: 'var(--text-primary)' }}>
                            {event.organizer.name}
                            <span className="ms-1 small" style={{ color: 'var(--text-muted)' }}>({event.organizer.email})</span>
                          </Col>
                        </>
                      )}
                    </Row>
                  </dl>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={12} lg={6}>
              <Card className="es-card border shadow-sm h-100">
                <Card.Body className="p-3 p-md-4">
                  <PanelHeader title="Venue" />
                  {event.venue ? (
                    <dl className="mb-0" style={{ fontSize: '0.88rem' }}>
                      <Row as="div" className="g-2">
                        <Col xs={5} className="fw-medium" style={{ color: 'var(--text-secondary)' }}>Name</Col>
                        <Col xs={7} style={{ color: 'var(--text-primary)' }}>{event.venue!.name}</Col>
                        <Col xs={5} className="fw-medium" style={{ color: 'var(--text-secondary)' }}>Location</Col>
                        <Col xs={7} style={{ color: 'var(--text-primary)' }}>{event.venue!.location}</Col>
                        <Col xs={5} className="fw-medium" style={{ color: 'var(--text-secondary)' }}>Capacity</Col>
                        <Col xs={7} style={{ color: 'var(--text-primary)' }}>{event.venue!.capacity.toLocaleString()} seats</Col>
                        <Col xs={5} className="fw-medium" style={{ color: 'var(--text-secondary)' }}>Availability</Col>
                        <Col xs={7} style={{ color: 'var(--text-primary)' }}>{event.venue!.availabilityStatus}</Col>
                      </Row>
                    </dl>
                  ) : (
                    <p className="mb-0 small" style={{ color: 'var(--text-muted)' }}>No venue assigned to this event.</p>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {avgRating && (
              <Col xs={12}>
                <Card className="es-card border shadow-sm">
                  <Card.Body className="p-3 p-md-4 d-flex flex-wrap align-items-center gap-3">
                    <div>
                      <div className="small fw-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Community Rating</div>
                      <div className="d-flex align-items-center gap-2">
                        <div className="d-flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} style={{ color: star <= Math.round(avgRating.score) ? 'var(--amber)' : 'var(--border-color)' }}>
                              {star <= Math.round(avgRating.score) ? <StarFill size={16} /> : <Star size={16} />}
                            </span>
                          ))}
                        </div>
                        <span className="fw-bold" style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>
                          {avgRating.score.toFixed(1)}
                        </span>
                        <span className="small" style={{ color: 'var(--text-muted)' }}>
                          · {avgRating.count} review{avgRating.count !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    {canFeedback && (
                      <Link to={`/attendee/feedback/${event.id}`} className="ms-auto">
                        <Button variant="outline-primary" size="sm" className="rounded-3 fw-medium" style={{ fontSize: '0.82rem' }}>
                          Submit Feedback
                        </Button>
                      </Link>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            )}
          </Row>
        )}

        {/* ── Schedule tab ───────────────────────────────────────────────── */}
        {tab === 'schedule' && (
          <Card className="es-card border shadow-sm">
            <Card.Body className="p-3 p-md-4">
              <PanelHeader title="Event Schedule">
                <span className="small" style={{ color: 'var(--text-muted)' }}>{schedules.length} session{schedules.length !== 1 ? 's' : ''}</span>
              </PanelHeader>

              {schedules.length === 0 ? (
                <p className="text-center py-4 mb-0 small" style={{ color: 'var(--text-muted)' }}>
                  No sessions scheduled yet.
                </p>
              ) : (
                <Table hover responsive className="mb-0" style={{ fontSize: '0.88rem' }}>
                  <thead style={{ background: 'var(--bg-subtle)' }}>
                    <tr>
                      {['Date', 'Time Slot', 'Activity', 'Status'].map((h) => (
                        <th key={h} className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map((s) => (
                      <tr key={s.scheduleId}>
                        <td className="align-middle" style={{ color: 'var(--text-secondary)' }}>{fmtDate(s.date)}</td>
                        <td className="align-middle" style={{ color: 'var(--text-secondary)' }}>{s.timeSlot}</td>
                        <td className="align-middle fw-medium" style={{ color: 'var(--text-primary)' }}>{s.activity}</td>
                        <td className="align-middle">
                          <EventStatusBadge status={s.status?.toLowerCase()} variant="schedule" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        )}

        {/* ── My Registration tab ────────────────────────────────────────── */}
        {tab === 'registration' && (
          <Row className="g-3">
            <Col xs={12} lg={7}>
              <Card className="es-card border shadow-sm">
                <Card.Body className="p-3 p-md-4">
                  <PanelHeader title="My Registration" />

                  {registration && registration.status !== 'CANCELLED' ? (
                    <>
                      <dl className="mb-3" style={{ fontSize: '0.88rem' }}>
                        <Row as="div" className="g-2">
                          <Col xs={5} className="fw-medium" style={{ color: 'var(--text-secondary)' }}>Registration ID</Col>
                          <Col xs={7} style={{ color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                            {registration.registrationId}
                          </Col>
                          <Col xs={5} className="fw-medium" style={{ color: 'var(--text-secondary)' }}>Ticket Type</Col>
                          <Col xs={7} style={{ color: 'var(--text-primary)' }}>{registration.ticketType ?? '—'}</Col>
                          <Col xs={5} className="fw-medium" style={{ color: 'var(--text-secondary)' }}>Ticket Price</Col>
                          <Col xs={7} style={{ color: 'var(--text-primary)' }}>
                            {registration.ticketPrice != null ? `₹ ${registration.ticketPrice.toLocaleString()}` : '—'}
                          </Col>
                          <Col xs={5} className="fw-medium" style={{ color: 'var(--text-secondary)' }}>Status</Col>
                          <Col xs={7}>
                            <Badge bg={REG_STATUS_COLOR[registration.status] ?? 'secondary'} className="rounded-2">
                              {registration.status}
                            </Badge>
                          </Col>
                        </Row>
                      </dl>

                      {canCancel && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="rounded-3"
                          onClick={handleCancel}
                          disabled={cancelling}
                        >
                          {cancelling ? <><Spinner animation="border" size="sm" className="me-1" />Cancelling…</> : 'Cancel Registration'}
                        </Button>
                      )}
                    </>
                  ) : registration?.status === 'CANCELLED' ? (
                    <Alert variant="secondary" className="py-2 mb-0 small">
                      Your registration was cancelled.
                    </Alert>
                  ) : canRegister ? (
                    <>
                      {regError && <Alert variant="danger" className="py-2 mb-3 small">{regError}</Alert>}
                      <Form.Group className="mb-3">
                        <Form.Label className="es-label">Select Ticket *</Form.Label>
                        {activeTickets.length === 0 ? (
                          <p className="small mb-0" style={{ color: 'var(--text-muted)' }}>No tickets available for this event.</p>
                        ) : (
                          <Form.Select
                            value={selectedTicket}
                            onChange={(e) => setSelectedTicket(e.target.value)}
                            className="es-form-control rounded-3"
                          >
                            <option value="">Choose a ticket…</option>
                            {activeTickets.map((t) => (
                              <option key={t.ticketId} value={t.ticketId}>
                                {t.type ?? 'General'} — ₹{t.price?.toLocaleString() ?? '0'}
                              </option>
                            ))}
                          </Form.Select>
                        )}
                      </Form.Group>
                      <Button
                        variant="primary"
                        size="sm"
                        className="fw-semibold rounded-3"
                        onClick={handleRegister}
                        disabled={!selectedTicket || registering || activeTickets.length === 0}
                      >
                        {registering ? <><Spinner animation="border" size="sm" className="me-1" />Registering…</> : 'Register Now'}
                      </Button>
                    </>
                  ) : (
                    <Alert variant="warning" className="py-2 mb-0 small">
                      {event.status === 'DRAFT' && 'This event is not open for registration yet.'}
                      {event.status === 'COMPLETED' && 'This event has ended.'}
                      {event.status === 'CANCELLED' && 'This event has been cancelled.'}
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            </Col>

          </Row>
        )}
      </Container>
    </div>
  )
}
