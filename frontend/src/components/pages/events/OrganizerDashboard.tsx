import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchAllEvents, deleteEvent, createEvent, updateEvent } from '../../../store/slices/eventsSlice'
import { venueService } from '../../../services/events/venueService'
import type { EventResponseDto, EventRequestDto, VenueResponseDto, EventStatus } from '../../../types/events'
import { EventStatusBadge } from '../../elements/events/EventStatusBadge'
import {
  Container, Row, Col, Card, Table, Button, Modal, Form,
  Spinner, Alert, Dropdown,
} from 'react-bootstrap'
import { StatCardsSkeleton, TableRowsSkeleton } from '../../elements/skeletons/PageSkeleton'
import {
  CalendarEventFill, CalendarFill, CheckCircleFill, PencilFill,
} from 'react-bootstrap-icons'

const IconDotsV = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
  </svg>
)

const EMPTY_FORM: EventRequestDto = {
  name: '', organizerId: '', startDate: '', endDate: '', venueId: '', status: 'DRAFT',
}

export const OrganizerDashboard = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { events, loading } = useAppSelector((state) => state.events)
  const userId = useAppSelector((state) => state.auth.user?.userId ?? '')

  const [venues, setVenues]               = useState<VenueResponseDto[]>([])
  const [editId, setEditId]               = useState<string | null>(null)
  const [showModal, setShowModal]         = useState(false)
  const [form, setForm]                   = useState<EventRequestDto>({ ...EMPTY_FORM })
  const [submitting, setSubmitting]       = useState(false)
  const [formError, setFormError]         = useState<string | null>(null)
  const [fieldErrors, setFieldErrors]     = useState<{ startDate?: string; endDate?: string }>({})
  const [actionLoading, setActionLoading] = useState<string | null>(null)   // event ID being status-mutated

  const today = new Date().toISOString().split('T')[0]

  const validateDates = (startDate: string, endDate: string) => {
    const errors: { startDate?: string; endDate?: string } = {}
    if (startDate && startDate < today) errors.startDate = 'Start date cannot be in the past.'
    if (endDate && endDate <= today)    errors.endDate   = 'End date must be a future date.'
    if (startDate && endDate && endDate <= startDate) errors.endDate = 'End date must be after the start date.'
    return errors
  }

  useEffect(() => { dispatch(fetchAllEvents()) }, [dispatch])
  useEffect(() => { venueService.getAll().then(setVenues).catch(console.error) }, [])

  const activeEvents    = events.filter((e) => e.status === 'PUBLISHED').length
  const completedEvents = events.filter((e) => e.status === 'COMPLETED').length
  const pendingEvents   = events.filter((e) => e.status === 'DRAFT').length

  const STATS = [
    { label: 'Active Events', value: activeEvents,    accent: 'es-stat-card-blue',   icon: <CalendarEventFill size={18} />, iconBg: 'var(--blue-subtle)',    iconColor: 'var(--blue)'    },
    { label: 'Total Events',  value: events.length,   accent: 'es-stat-card-orange', icon: <CalendarFill size={18} />,      iconBg: 'var(--saffron-subtle)', iconColor: 'var(--saffron)' },
    { label: 'Completed',     value: completedEvents, accent: 'es-stat-card-green',  icon: <CheckCircleFill size={18} />,   iconBg: 'var(--green-subtle)',   iconColor: 'var(--green)'   },
    { label: 'Drafts',        value: pendingEvents,   accent: 'es-stat-card-amber',  icon: <PencilFill size={18} />,        iconBg: 'var(--amber-subtle)',   iconColor: 'var(--amber)'   },
  ]

  // ── Modal helpers ──────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditId(null)
    setForm({ ...EMPTY_FORM, organizerId: userId })
    setFormError(null)
    setFieldErrors({})
    setShowModal(true)
  }

  const openEdit = (event: EventResponseDto) => {
    setEditId(event.id)
    setForm({
      name: event.eventName, organizerId: event.organizerId,
      startDate: event.startAt, endDate: event.endAt,
      venueId: event.venueId ?? '', status: event.status,
    })
    setFormError(null)
    setFieldErrors({})
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setFormError(null); setFieldErrors({}) }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => {
      const next = { ...prev, [name]: value }
      if (name === 'startDate' || name === 'endDate') {
        setFieldErrors(validateDates(next.startDate, next.endDate))
      }
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const errors = validateDates(form.startDate, form.endDate)
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return }
    setSubmitting(true)
    setFormError(null)
    try {
      if (editId) {
        await dispatch(updateEvent({ id: editId, payload: form })).unwrap()
      } else {
        await dispatch(createEvent({ ...form, organizerId: userId })).unwrap()
      }
      dispatch(fetchAllEvents())
      closeModal()
    } catch (err: unknown) {
      setFormError((err as string) ?? `Failed to ${editId ? 'update' : 'create'} event.`)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Table actions ──────────────────────────────────────────────────────────

  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this event? This cannot be undone.')) return
    dispatch(deleteEvent(id))
  }

  const handleStatusChange = async (event: EventResponseDto, newStatus: EventStatus) => {
    const confirmMsgs: Partial<Record<EventStatus, string>> = {
      CANCELLED: 'Cancel this event? Attendees will be notified.',
      COMPLETED: 'Mark this event as Completed?',
    }
    if (confirmMsgs[newStatus] && !window.confirm(confirmMsgs[newStatus])) return

    setActionLoading(event.id)
    try {
      await dispatch(updateEvent({
        id: event.id,
        payload: {
          name: event.eventName,
          organizerId: event.organizerId,
          startDate: event.startAt,
          endDate: event.endAt,
          venueId: event.venueId ?? '',
          status: newStatus,
        },
      })).unwrap()
      dispatch(fetchAllEvents())
    } catch { /* error already in Redux */ } finally {
      setActionLoading(null)
    }
  }

  // ── Overflow menu per row ──────────────────────────────────────────────────

  const RowMenu = ({ event }: { event: EventResponseDto }) => {
    const busy = actionLoading === event.id
    return (
      <Dropdown onClick={(e) => e.stopPropagation()}>
        <Dropdown.Toggle
          variant="link"
          size="sm"
          bsPrefix="btn"
          className="p-1 rounded-2 border-0"
          style={{ color: 'var(--text-muted)', lineHeight: 1, fontSize: '1.1rem' }}
          disabled={busy}
        >
          {busy ? <Spinner animation="border" size="sm" /> : <IconDotsV />}
        </Dropdown.Toggle>

        <Dropdown.Menu align="end" style={{ fontSize: '0.85rem', minWidth: 160 }}>
          {/* Edit — always available */}
          <Dropdown.Item onClick={() => openEdit(event)}>Edit</Dropdown.Item>

          {/* Status transitions */}
          {event.status === 'DRAFT' && (
            <>
              <Dropdown.Divider />
              <Dropdown.Item onClick={() => handleStatusChange(event, 'PUBLISHED')}>
                Publish
              </Dropdown.Item>
            </>
          )}
          {event.status === 'PUBLISHED' && (
            <>
              <Dropdown.Divider />
              <Dropdown.Item onClick={() => handleStatusChange(event, 'COMPLETED')}>
                Mark Complete
              </Dropdown.Item>
              <Dropdown.Item
                className="text-danger"
                onClick={() => handleStatusChange(event, 'CANCELLED')}
              >
                Cancel Event
              </Dropdown.Item>
            </>
          )}

          {/* Delete — only for DRAFT or CANCELLED */}
          {(event.status === 'DRAFT' || event.status === 'CANCELLED') && (
            <>
              <Dropdown.Divider />
              <Dropdown.Item className="text-danger" onClick={() => handleDelete(event.id)}>
                Delete
              </Dropdown.Item>
            </>
          )}
        </Dropdown.Menu>
      </Dropdown>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      {/* Banner */}
      <div className="es-banner">
        <Container fluid className="px-3 px-md-4 py-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h1 className="fw-bold fs-3 mb-1">Organizer Portal</h1>
            <p className="mb-0 small" style={{ color: 'rgba(255,255,255,0.72)' }}>Manage your events, tickets, registrations and budget</p>
          </div>
          <Button variant="light" size="sm" className="fw-semibold rounded-3" onClick={openCreate}>
            + New Event
          </Button>
        </Container>
      </div>

      <Container fluid className="px-3 px-md-4 py-4">
        {/* Stat cards */}
        {loading ? <StatCardsSkeleton count={4} /> : (
          <Row className="g-3 mb-4">
            {STATS.map((s) => (
              <Col key={s.label} xs={6} lg={3}>
                <Card className={`es-card border shadow-sm h-100 ${s.accent}`}>
                  <Card.Body className="p-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="small fw-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{s.label}</div>
                        <div className="fw-bold" style={{ fontSize: '1.8rem', color: 'var(--text-primary)', lineHeight: 1.1 }}>{s.value}</div>
                      </div>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: s.iconBg, color: s.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {s.icon}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Events table */}
        <Card className="es-card border shadow-sm">
          <Card.Body className="p-3 p-md-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Card.Title className="mb-0 fw-semibold" style={{ color: 'var(--text-primary)' }}>My Events</Card.Title>
              <span className="small" style={{ color: 'var(--text-muted)' }}>{events.length} total</span>
            </div>

            {loading ? (
              <Table hover responsive className="mb-0" style={{ fontSize: '0.88rem' }}>
                <thead style={{ background: 'var(--bg-subtle)' }}>
                  <tr>
                    {['Event Name', 'Start Date', 'End Date', 'Status', ''].map((h) => (
                      <th key={h} className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <TableRowsSkeleton rows={5} cols={5} />
                </tbody>
              </Table>
            ) : events.length === 0 ? (
              <div className="text-center py-5 d-flex flex-column align-items-center gap-3">
                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--blue-subtle)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CalendarEventFill size={24} />
                </div>
                <div>
                  <div className="fw-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No events yet</div>
                  <div className="small" style={{ color: 'var(--text-muted)' }}>Create your first event to get started.</div>
                </div>
                <Button variant="primary" size="sm" className="rounded-3 fw-semibold" onClick={openCreate}>
                  + Create Event
                </Button>
              </div>
            ) : (
              <Table hover responsive className="mb-0" style={{ fontSize: '0.88rem' }}>
                <thead style={{ background: 'var(--bg-subtle)' }}>
                  <tr>
                    {['Event Name', 'Start Date', 'End Date', 'Status', ''].map((h) => (
                      <th key={h} className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {events.map((event: EventResponseDto) => (
                    <tr
                      key={event.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/organizer/events/${event.id}`)}
                    >
                      <td className="align-middle fw-semibold" style={{ color: 'var(--text-primary)' }}>{event.eventName}</td>
                      <td className="align-middle" style={{ color: 'var(--text-secondary)' }}>{event.startAt}</td>
                      <td className="align-middle" style={{ color: 'var(--text-secondary)' }}>{event.endAt}</td>
                      <td className="align-middle">
                        <EventStatusBadge status={event.status?.toLowerCase()} variant="event" />
                      </td>
                      <td className="align-middle text-end" style={{ width: 48 }} onClick={(e) => e.stopPropagation()}>
                        <RowMenu event={event} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </Container>

      {/* Create / Edit Modal */}
      <Modal show={showModal} onHide={closeModal} centered size="lg">
        <Modal.Header closeButton style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <Modal.Title className="fs-6 fw-semibold" style={{ color: 'var(--text-primary)' }}>
            {editId ? 'Edit Event' : 'Create New Event'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'var(--bg-surface)' }}>
          {formError && <Alert variant="danger" className="py-2 mb-3">{formError}</Alert>}
          <Form id="event-form" onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="es-label">Event Name *</Form.Label>
                  <Form.Control
                    name="name" value={form.name} onChange={handleChange}
                    placeholder="Enter event name" required
                    className="es-form-control rounded-3"
                  />
                  {!editId && (
                    <Form.Text style={{ color: 'var(--text-muted)' }}>
                      Event will be saved as Draft. You can publish it later.
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
              <Col xs={12} sm={6}>
                <Form.Group>
                  <Form.Label className="es-label">Start Date *</Form.Label>
                  <Form.Control
                    name="startDate" type="date" value={form.startDate}
                    min={today} onChange={handleChange} required
                    isInvalid={!!fieldErrors.startDate}
                    className="es-form-control rounded-3"
                  />
                  <Form.Control.Feedback type="invalid">{fieldErrors.startDate}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6}>
                <Form.Group>
                  <Form.Label className="es-label">End Date *</Form.Label>
                  <Form.Control
                    name="endDate" type="date" value={form.endDate}
                    min={form.startDate || today} onChange={handleChange} required
                    isInvalid={!!fieldErrors.endDate}
                    className="es-form-control rounded-3"
                  />
                  <Form.Control.Feedback type="invalid">{fieldErrors.endDate}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6}>
                <Form.Group>
                  <Form.Label className="es-label">Venue</Form.Label>
                  <Form.Select name="venueId" value={form.venueId} onChange={handleChange} className="es-form-control rounded-3">
                    <option value="">Select a venue</option>
                    {venues.map((v) => (
                      <option key={v.id} value={v.id}>{v.name} — {v.location} (cap: {v.capacity})</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* Status — edit mode only */}
              {editId && (
                <Col xs={12} sm={6}>
                  <Form.Group>
                    <Form.Label className="es-label">Status</Form.Label>
                    <Form.Select name="status" value={form.status} onChange={handleChange} className="es-form-control rounded-3">
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              )}
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <Button variant="outline-secondary" size="sm" className="rounded-3" onClick={closeModal}>Cancel</Button>
          <Button variant="primary" size="sm" className="fw-semibold rounded-3" type="submit" form="event-form" disabled={submitting}>
            {submitting ? <><Spinner animation="border" size="sm" className="me-1" />Saving…</> : editId ? 'Update Event' : 'Create Event'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
