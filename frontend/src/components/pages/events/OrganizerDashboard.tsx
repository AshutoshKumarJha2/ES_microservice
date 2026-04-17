import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchAllEvents, deleteEvent, createEvent, updateEvent } from '../../../store/slices/eventsSlice'
import { venueService } from '../../../services/events/venueService'
import type { EventResponseDto, EventRequestDto, VenueResponseDto } from '../../../types/events'
import { EventStatusBadge } from '../../elements/events/EventStatusBadge'
import {
  Container, Row, Col, Card, Table, Button, Modal, Form,
  Spinner, Alert,
} from 'react-bootstrap'

const EMPTY_FORM: EventRequestDto = {
  name: '', organizerId: '', startDate: '', endDate: '', venueId: '', status: 'DRAFT',
}

export const OrganizerDashboard = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { events, loading } = useAppSelector((state) => state.events)
  const userId = useAppSelector((state) => state.auth.user?.userId ?? '')

  const [venues, setVenues]           = useState<VenueResponseDto[]>([])
  const [editId, setEditId]           = useState<string | null>(null)
  const [showModal, setShowModal]     = useState(false)
  const [form, setForm]               = useState<EventRequestDto>({ ...EMPTY_FORM })
  const [submitting, setSubmitting]   = useState(false)
  const [formError, setFormError]     = useState<string | null>(null)

  useEffect(() => { dispatch(fetchAllEvents()) }, [dispatch])
  useEffect(() => { venueService.getAll().then(setVenues).catch(console.error) }, [])

  const activeEvents    = events.filter((e) => e.status === 'PUBLISHED').length
  const completedEvents = events.filter((e) => e.status === 'COMPLETED').length
  const pendingEvents   = events.filter((e) => e.status === 'DRAFT').length

  const STATS = [
    { label: 'Active Events', value: activeEvents,    accent: 'es-stat-card-blue' },
    { label: 'Total Events',  value: events.length,   accent: 'es-stat-card-orange' },
    { label: 'Completed',     value: completedEvents, accent: 'es-stat-card-green' },
    { label: 'Drafts',        value: pendingEvents,   accent: 'es-stat-card-amber' },
  ]

  const openCreate = () => {
    setEditId(null)
    setForm({ ...EMPTY_FORM, organizerId: userId })
    setFormError(null)
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
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setFormError(null) }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
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
    } catch {
      setFormError(`Failed to ${editId ? 'update' : 'create'} event. Please try again.`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this event?')) return
    dispatch(deleteEvent(id))
  }

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      {/* Banner */}
      <div className="es-banner text-white">
        <Container fluid className="px-3 px-md-4 py-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h1 className="fw-bold fs-3 mb-1">Organizer Portal</h1>
            <p className="mb-0 text-white-50 small">Manage your events, tickets, registrations and budget</p>
          </div>
          <Button variant="light" size="sm" className="fw-semibold rounded-3" onClick={openCreate}>
            + New Event
          </Button>
        </Container>
      </div>

      <Container fluid className="px-3 px-md-4 py-4">
        {/* Stat cards */}
        <Row className="g-3 mb-4">
          {STATS.map((s) => (
            <Col key={s.label} xs={6} lg={3}>
              <Card className={`es-card border shadow-sm h-100 ${s.accent}`}>
                <Card.Body className="p-3">
                  <div className="small fw-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{s.label}</div>
                  <div className="fw-bold" style={{ fontSize: '1.8rem', color: 'var(--text-primary)', lineHeight: 1.1 }}>{s.value}</div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Events table */}
        <Card className="es-card border shadow-sm">
          <Card.Body className="p-3 p-md-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Card.Title className="mb-0 fw-semibold" style={{ color: 'var(--text-primary)' }}>My Events</Card.Title>
              <span className="small" style={{ color: 'var(--text-muted)' }}>{events.length} total</span>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" style={{ color: 'var(--blue)' }} />
              </div>
            ) : events.length === 0 ? (
              <p className="text-center py-4" style={{ color: 'var(--text-muted)' }}>
                No events found. Create your first event!
              </p>
            ) : (
              <Table hover responsive className="mb-0" style={{ fontSize: '0.88rem' }}>
                <thead style={{ background: 'var(--bg-subtle)' }}>
                  <tr>
                    <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Event Name</th>
                    <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Start Date</th>
                    <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>End Date</th>
                    <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Status</th>
                    <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Actions</th>
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
                      <td className="align-middle" onClick={(e) => e.stopPropagation()}>
                        <div className="d-flex gap-1">
                          <Button variant="outline-primary" size="sm" className="rounded-3" style={{ fontSize: '0.78rem' }} onClick={() => openEdit(event)}>
                            Edit
                          </Button>
                          <Button variant="outline-danger" size="sm" className="rounded-3" style={{ fontSize: '0.78rem' }} onClick={() => handleDelete(event.id)}>
                            Delete
                          </Button>
                        </div>
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
                </Form.Group>
              </Col>
              <Col xs={12} sm={6}>
                <Form.Group>
                  <Form.Label className="es-label">Start Date *</Form.Label>
                  <Form.Control
                    name="startDate" type="date" value={form.startDate}
                    onChange={handleChange} required
                    className="es-form-control rounded-3"
                  />
                </Form.Group>
              </Col>
              <Col xs={12} sm={6}>
                <Form.Group>
                  <Form.Label className="es-label">End Date *</Form.Label>
                  <Form.Control
                    name="endDate" type="date" value={form.endDate}
                    min={form.startDate} onChange={handleChange} required
                    className="es-form-control rounded-3"
                  />
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
