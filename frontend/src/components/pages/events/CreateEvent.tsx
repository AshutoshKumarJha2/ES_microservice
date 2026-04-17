import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { createEvent, updateEvent, fetchEventById } from '../../../store/slices/eventsSlice'
import { venueService } from '../../../services/events/venueService'
import { eventService } from '../../../services/events/eventService'
import type { EventRequestDto, ScheduleRequestDto, VenueResponseDto } from '../../../types/events'
import {
  Container, Row, Col, Card, Form, Button, Spinner, Alert, Badge,
} from 'react-bootstrap'

interface SessionRow extends Omit<ScheduleRequestDto, 'eventId'> {
  localId: number
  scheduleId?: string
  dirty?: boolean
  saving?: boolean
  saveError?: string
}

const EMPTY_SESSION: Omit<SessionRow, 'localId'> = {
  date: '',
  timeSlot: '',
  activity: '',
  status: 'DRAFT',
}

const parseTimeSlot = (slot: string) => {
  const [start = '', end = ''] = slot.split('-')
  return { start, end }
}

const buildTimeSlot = (start: string, end: string) => `${start}-${end}`

export const CreateEvent = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { id }  = useParams<{ id?: string }>()
  const isEdit  = Boolean(id)

  const { loading, error } = useAppSelector((state) => state.events)
  const userId = useAppSelector((state) => state.auth.user?.userId ?? '')

  const [venues, setVenues]     = useState<VenueResponseDto[]>([])
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [nextId, setNextId]     = useState(1)
  const [form, setForm]         = useState<EventRequestDto>({
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

  useEffect(() => {
    if (userId) setForm((prev) => ({ ...prev, organizerId: userId }))
  }, [userId])

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
          eventService.getSchedules(id).then((schedules) => {
            setSessions(
              schedules.map((s, i) => ({
                localId:    i + 1,
                scheduleId: s.scheduleId,
                date:       s.date,
                timeSlot:   s.timeSlot,
                activity:   s.activity,
                status:     s.status,
              }))
            )
            setNextId(schedules.length + 1)
          })
        })
        .catch(console.error)
    }
  }, [id, isEdit, dispatch])

  const handleChange = (e: React.ChangeEvent<HTMLElement & { name: string; value: string }>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const addSession = () => {
    setSessions((prev) => [...prev, { ...EMPTY_SESSION, localId: nextId }])
    setNextId((n) => n + 1)
  }

  const handleSessionChange = (localId: number, field: keyof Omit<SessionRow, 'localId'>, value: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.localId === localId ? { ...s, [field]: value, dirty: true } : s))
    )
  }

  const handleSaveSession = async (localId: number) => {
    const session = sessions.find((s) => s.localId === localId)
    if (!session || !id) return
    const { scheduleId, localId: _lid, dirty: _d, saving: _s, saveError: _e, ...rest } = session
    setSessions((prev) => prev.map((s) => s.localId === localId ? { ...s, saving: true, saveError: undefined } : s))
    try {
      if (scheduleId) {
        await eventService.updateSchedule(id, scheduleId, { ...rest, eventId: id })
        setSessions((prev) => prev.map((s) => s.localId === localId ? { ...s, saving: false, dirty: false } : s))
      } else {
        const created = await eventService.createSchedule(id, { ...rest, eventId: id })
        setSessions((prev) => prev.map((s) => s.localId === localId ? { ...s, saving: false, dirty: false, scheduleId: created.scheduleId } : s))
      }
    } catch {
      setSessions((prev) => prev.map((s) => s.localId === localId ? { ...s, saving: false, saveError: 'Failed to save' } : s))
    }
  }

  const handleDeleteSession = async (localId: number) => {
    const session = sessions.find((s) => s.localId === localId)
    if (!session) return
    if (session.scheduleId) {
      setSessions((prev) => prev.map((s) => s.localId === localId ? { ...s, saving: true, saveError: undefined } : s))
      try {
        await eventService.deleteSchedule(session.scheduleId)
      } catch {
        setSessions((prev) => prev.map((s) => s.localId === localId ? { ...s, saving: false, saveError: 'Failed to delete' } : s))
        return
      }
    }
    setSessions((prev) => prev.filter((s) => s.localId !== localId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isEdit && id) {
        await dispatch(updateEvent({ id, payload: form })).unwrap()
        for (const session of sessions) {
          const { scheduleId, localId: _localId, dirty, saving: _s, saveError: _e, ...rest } = session
          if (!scheduleId) {
            await eventService.createSchedule(id, { ...rest, eventId: id })
          }
        }
      } else {
        const event = await dispatch(createEvent(form)).unwrap()
        for (const session of sessions) {
          const { scheduleId: _sid, localId: _localId, dirty: _d, saving: _s, saveError: _e, ...rest } = session
          await eventService.createSchedule(event.id, { ...rest, eventId: event.id })
        }
      }
      navigate('/organizer/dashboard')
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
                <Col xs={12} sm={6}>
                  <Form.Group>
                    <Form.Label className="es-label">Start Date *</Form.Label>
                    <Form.Control
                      type="date" name="startDate" value={form.startDate}
                      onChange={handleChange} required className="es-form-control rounded-3"
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Group>
                    <Form.Label className="es-label">End Date *</Form.Label>
                    <Form.Control
                      type="date" name="endDate" value={form.endDate}
                      min={form.startDate} onChange={handleChange}
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

        {/* Sessions */}
        <Card className="es-card border shadow-sm mb-3">
          <Card.Body className="p-3 p-md-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <Card.Title className="fw-semibold mb-0" style={{ color: 'var(--text-primary)' }}>
                Sessions
                <span className="ms-2 small fw-normal" style={{ color: 'var(--text-muted)' }}>(Optional)</span>
              </Card.Title>
              <Button variant="outline-primary" size="sm" className="rounded-3" onClick={addSession}>
                + Add Session
              </Button>
            </div>

            {sessions.length === 0 ? (
              <p className="small mb-0 text-center py-3" style={{ color: 'var(--text-muted)' }}>
                No sessions added yet. Click "+ Add Session" to get started.
              </p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {sessions.map((session) => (
                  <div
                    key={session.localId}
                    className="rounded-3 p-3"
                    style={{ background: 'var(--bg-page)', border: '1px solid var(--border-subtle)' }}
                  >
                    <Row className="g-3 mb-2">
                      <Col xs={12} sm={6} md={3}>
                        <Form.Group>
                          <Form.Label className="es-label">Date</Form.Label>
                          <Form.Control
                            type="date" value={session.date}
                            onChange={(e) => handleSessionChange(session.localId, 'date', e.target.value)}
                            className="es-form-control rounded-3"
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={12} sm={6} md={3}>
                        <Form.Group>
                          <Form.Label className="es-label">Time Slot</Form.Label>
                          <div className="d-flex align-items-center gap-1">
                            <Form.Control
                              type="time"
                              value={parseTimeSlot(session.timeSlot).start}
                              onChange={(e) =>
                                handleSessionChange(session.localId, 'timeSlot',
                                  buildTimeSlot(e.target.value, parseTimeSlot(session.timeSlot).end))
                              }
                              className="es-form-control rounded-3"
                            />
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', flexShrink: 0 }}>–</span>
                            <Form.Control
                              type="time"
                              value={parseTimeSlot(session.timeSlot).end}
                              min={parseTimeSlot(session.timeSlot).start || undefined}
                              onChange={(e) =>
                                handleSessionChange(session.localId, 'timeSlot',
                                  buildTimeSlot(parseTimeSlot(session.timeSlot).start, e.target.value))
                              }
                              className="es-form-control rounded-3"
                            />
                          </div>
                        </Form.Group>
                      </Col>
                      <Col xs={12} sm={6} md={4}>
                        <Form.Group>
                          <Form.Label className="es-label">Activity</Form.Label>
                          <Form.Control
                            type="text" placeholder="Session title or description"
                            value={session.activity}
                            onChange={(e) => handleSessionChange(session.localId, 'activity', e.target.value)}
                            className="es-form-control rounded-3"
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={12} sm={6} md={2}>
                        <Form.Group>
                          <Form.Label className="es-label">Status</Form.Label>
                          <Form.Select
                            value={session.status}
                            onChange={(e) => handleSessionChange(session.localId, 'status', e.target.value)}
                            className="es-form-control rounded-3"
                          >
                            <option value="DRAFT">Draft</option>
                            <option value="ACTIVE">Active</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="TERMINATED">Terminated</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* Session actions row */}
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      {session.saveError && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--red)' }}>{session.saveError}</span>
                      )}
                      {session.scheduleId && session.dirty && (
                        <Badge
                          style={{ background: 'color-mix(in srgb, var(--saffron) 15%, transparent)', color: 'var(--saffron)', fontSize: '0.68rem', fontWeight: 600, border: '1px solid color-mix(in srgb, var(--saffron) 35%, transparent)' }}
                          className="border-0"
                        >
                          edited
                        </Badge>
                      )}
                      <div className="ms-auto d-flex gap-2">
                        {isEdit && (
                          <Button
                            type="button" variant="outline-primary" size="sm" className="rounded-3"
                            style={{ fontSize: '0.78rem' }}
                            disabled={!session.dirty || session.saving}
                            onClick={() => handleSaveSession(session.localId)}
                          >
                            {session.saving ? <Spinner animation="border" size="sm" /> : '↑ Save'}
                          </Button>
                        )}
                        <Button
                          type="button" variant="outline-danger" size="sm" className="rounded-3"
                          style={{ fontSize: '0.78rem' }}
                          disabled={session.saving}
                          onClick={() => handleDeleteSession(session.localId)}
                        >
                          {session.saving ? <Spinner animation="border" size="sm" /> : '✕ Remove'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>

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
            onClick={() => navigate('/organizer/dashboard')}
          >
            Cancel
          </Button>
        </div>

      </Container>
    </div>
  )
}
