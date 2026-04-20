import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { createEvent, updateEvent, fetchEventById } from '../../../store/slices/eventsSlice'
import { fetchUsers } from '../../../store/slices/adminSlice'
import { venueService } from '../../../services/events/venueService'
import { eventService } from '../../../services/events/eventService'
import { SessionManager } from '../../elements/events/SessionManager'
import type { SessionRow } from '../../elements/events/SessionManager'
import type { EventRequestDto, VenueResponseDto, UserResponseDto } from '../../../types/events'
import {
  Container, Row, Col, Card, Form, Button, Spinner, Alert,
} from 'react-bootstrap'

export const CreateEvent = () => {
  const navigate  = useNavigate()
  const location  = useLocation()
  const dispatch  = useAppDispatch()
  const { id }    = useParams<{ id?: string }>()
  const isEdit    = Boolean(id)

  const { loading, error } = useAppSelector((state) => state.events)
  const userId     = useAppSelector((state) => state.auth.user?.userId ?? '')
  const isAdmin    = useAppSelector((state) => state.auth.user?.role === 'ADMIN')
  const allUsers   = useAppSelector((state) => state.admin.allUsers)
  const organizers = (allUsers as UserResponseDto[]).filter(
    (u) => u.role === 'ORGANIZER' && u.status === 'ACTIVE'
  )
  const returnPath = location.pathname.startsWith('/admin') ? '/admin/events' : '/organizer/dashboard'

  const [venues, setVenues]                   = useState<VenueResponseDto[]>([])
  const [organizerSearch, setOrganizerSearch] = useState('')
  const [pickerOpen, setPickerOpen]           = useState(false)

  // Sessions — controlled only in create mode; edit mode delegates to SessionManager
  const [sessions, setSessions]         = useState<SessionRow[]>([])
  // ISO timestamps used by SessionManager for bounds validation in edit mode
  const [eventStartAt, setEventStartAt] = useState('')
  const [eventEndAt, setEventEndAt]     = useState('')

  const [form, setForm] = useState<EventRequestDto>({
    name: '',
    organizerId: '',
    startDate: '',
    endDate: '',
    venueId: '',
    status: 'DRAFT',
  })

  useEffect(() => {
    venueService.getAll().then(setVenues).catch(console.error)
  }, [])

  // Non-admin users are always the organizer; admins pick from the dropdown
  useEffect(() => {
    if (!isAdmin && userId) setForm((prev) => ({ ...prev, organizerId: userId }))
  }, [userId, isAdmin])

  // Pre-load organizer list when admin opens the form
  useEffect(() => {
    if (isAdmin) dispatch(fetchUsers())
  }, [isAdmin, dispatch])

  useEffect(() => {
    if (isEdit && id) {
      dispatch(fetchEventById(id))
        .unwrap()
        .then((event) => {
          setForm({
            name:        event.eventName,
            organizerId: event.organizerId,
            startDate:   event.startAt,
            endDate:     event.endAt,
            venueId:     event.venueId,
            status:      event.status,
          })
          // Store ISO timestamps for SessionManager bounds validation
          setEventStartAt(event.startAt)
          setEventEndAt(event.endAt)
        })
        .catch(console.error)
    }
  }, [id, isEdit, dispatch])

  const handleChange = (e: React.ChangeEvent<HTMLElement & { name: string; value: string }>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isEdit && id) {
        // Sessions in edit mode are saved immediately by SessionManager — just update event details
        await dispatch(updateEvent({ id, payload: form })).unwrap()
      } else {
        // Create mode — create event then batch-save all locally accumulated sessions
        const event = await dispatch(createEvent(form)).unwrap()
        for (const session of sessions) {
          const { localId: _lid, scheduleId: _sid, ...rest } = session
          await eventService.createSchedule(event.id, { ...rest, eventId: event.id })
        }
      }
      navigate(returnPath)
    } catch {
      // error shown from redux state
    }
  }

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>

      {/* Banner */}
      <div className="es-banner text-white">
        <Container fluid className="px-3 px-md-4 py-3">
          <h1 className="fw-bold fs-3 mb-1">{isEdit ? 'Edit Event' : 'Create New Event'}</h1>
          <p className="mb-0 small" style={{ color: 'rgba(255,255,255,0.75)' }}>
            {isEdit ? 'Update the details for your event.' : 'Fill in the details below to create your event.'}
          </p>
        </Container>
      </div>

      <Container fluid className="px-3 px-md-4 py-4">

        {/* Event Details */}
        <Card className="es-card border shadow-sm mb-3">
          <Card.Body className="p-3 p-md-4">
            <Card.Title className="fw-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Event Details</Card.Title>

            <Form id="event-form" onSubmit={handleSubmit}>
              <Row className="g-3">
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label className="es-label">Event Name *</Form.Label>
                    <Form.Control
                      name="name" value={form.name} onChange={handleChange}
                      placeholder="Enter event name" required className="es-form-control rounded-3"
                    />
                  </Form.Group>
                </Col>

                {/* Admin-only: searchable organizer picker */}
                {isAdmin && (() => {
                  const selectedOrganizer = organizers.find((o) => o.userId === form.organizerId)
                  const filteredOrganizers = organizers.filter((o) => {
                    const q = organizerSearch.toLowerCase()
                    return !q || o.name.toLowerCase().includes(q) || o.email.toLowerCase().includes(q)
                  })
                  return (
                    <Col xs={12} sm={6}>
                      <Form.Group>
                        <Form.Label className="es-label">Assign Organizer *</Form.Label>
                        <div className="position-relative">
                          <Form.Control
                            placeholder="Search by name or email…"
                            value={organizerSearch !== '' ? organizerSearch : (selectedOrganizer ? `${selectedOrganizer.name} (${selectedOrganizer.email})` : '')}
                            onFocus={() => { setOrganizerSearch(''); setPickerOpen(true) }}
                            onChange={(e) => { setOrganizerSearch(e.target.value); setPickerOpen(true) }}
                            onBlur={() => setTimeout(() => setPickerOpen(false), 150)}
                            className="es-form-control rounded-3"
                          />
                          {/* Hidden sentinel to trigger native required validation if no organizer is selected */}
                          {!form.organizerId && (
                            <input type="text" style={{ opacity: 0, height: 0, position: 'absolute' }} required />
                          )}
                          {pickerOpen && (
                            <div
                              className="position-absolute w-100 border rounded-3 shadow-sm"
                              style={{ background: 'var(--bg-surface)', zIndex: 10, maxHeight: 220, overflowY: 'auto', top: '100%' }}
                            >
                              {filteredOrganizers.length === 0 ? (
                                <div className="px-3 py-2 small" style={{ color: 'var(--text-muted)' }}>No organizers found</div>
                              ) : filteredOrganizers.map((o) => (
                                <div
                                  key={o.userId}
                                  className="px-3 py-2"
                                  style={{ cursor: 'pointer', fontSize: '0.88rem', color: 'var(--text-primary)' }}
                                  onMouseDown={() => {
                                    setForm((prev) => ({ ...prev, organizerId: o.userId }))
                                    setOrganizerSearch('')
                                    setPickerOpen(false)
                                  }}
                                >
                                  <span className="fw-semibold">{o.name}</span>
                                  <span className="ms-2" style={{ color: 'var(--text-muted)' }}>{o.email}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </Form.Group>
                    </Col>
                  )
                })()}

                <Col xs={12} sm={6}>
                  <Form.Group>
                    <Form.Label className="es-label">Start Date *</Form.Label>
                    <Form.Control
                      type="date" name="startDate" value={form.startDate?.split('T')[0] ?? ''}
                      onChange={handleChange} required className="es-form-control rounded-3"
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Group>
                    <Form.Label className="es-label">End Date *</Form.Label>
                    <Form.Control
                      type="date" name="endDate" value={form.endDate?.split('T')[0] ?? ''}
                      min={form.startDate?.split('T')[0]} onChange={handleChange}
                      required className="es-form-control rounded-3"
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Group>
                    <Form.Label className="es-label">Venue</Form.Label>
                    <Form.Select
                      name="venueId" value={form.venueId}
                      onChange={handleChange}
                      className="es-form-control rounded-3"
                    >
                      <option value="">Select a venue</option>
                      {venues.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} — {v.location} (cap: {v.capacity})
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Group>
                    <Form.Label className="es-label">Status</Form.Label>
                    <Form.Select
                      name="status" value={form.status}
                      onChange={handleChange}
                      className="es-form-control rounded-3"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>

        {/* Sessions — API-backed in edit mode, locally controlled in create mode */}
        {isEdit ? (
          // Edit mode: SessionManager owns sessions and syncs to API immediately
          eventStartAt && (
            <div className="mb-3">
              <SessionManager
                eventId={id}
                eventStartAt={eventStartAt}
                eventEndAt={eventEndAt}
              />
            </div>
          )
        ) : (
          // Create mode: sessions accumulated locally, saved on submit
          <div className="mb-3">
            <SessionManager
              eventStartAt={form.startDate}
              eventEndAt={form.endDate}
              sessions={sessions}
              onSessionsChange={setSessions}
            />
          </div>
        )}

        {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

        {/* Footer actions */}
        <div className="d-flex gap-2">
          <Button
            type="submit" form="event-form" variant="primary"
            className="fw-semibold rounded-3" disabled={loading}
          >
            {loading
              ? <><Spinner animation="border" size="sm" className="me-2" />Saving…</>
              : isEdit ? 'Update Event' : 'Create Event'
            }
          </Button>
          <Button
            type="button" variant="outline-secondary" className="rounded-3"
            onClick={() => navigate(returnPath)}
          >
            Cancel
          </Button>
        </div>

      </Container>
    </div>
  )
}
