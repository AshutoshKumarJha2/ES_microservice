import { useEffect, useState } from 'react'
import { useAppSelector } from '../../../../store/hooks'
import { eventService } from '../../../../services/events/eventService'
import { SessionFormFields } from '../../../elements/events/SessionFormFields'
import { EventStatusBadge } from '../../../elements/events/EventStatusBadge'
import type { ScheduleResponseDto, ScheduleRequestDto } from '../../../../types/events'
import {
  Card, Row, Col, Table, Button, Form, Spinner,
} from 'react-bootstrap'

interface Props {
  eventId: string
  eventStartAt: string
}

export const OverviewTab = ({ eventId, eventStartAt }: Props) => {
  const { tickets }       = useAppSelector((s) => s.tickets)
  const { registrations } = useAppSelector((s) => s.registrations)

  const [schedules, setSchedules]           = useState<ScheduleResponseDto[]>([])
  const [schedulesLoading, setSchedulesLoading] = useState(false)
  const [showAddSession, setShowAddSession]  = useState(false)
  const [newSession, setNewSession]          = useState<Omit<ScheduleRequestDto, 'eventId'>>({
    date: '', timeSlot: '', activity: '', status: 'DRAFT',
  })
  const [sessionSaving, setSessionSaving]    = useState(false)
  const [editingSession, setEditingSession]  = useState<ScheduleResponseDto | null>(null)
  const [sessionUpdating, setSessionUpdating] = useState(false)

  const loadSchedules = () => {
    setSchedulesLoading(true)
    eventService.getSchedules(eventId)
      .then(setSchedules)
      .catch(console.error)
      .finally(() => setSchedulesLoading(false))
  }

  useEffect(() => { loadSchedules() }, [eventId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddSession = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSessionSaving(true)
    try {
      await eventService.createSchedule(eventId, { ...newSession, eventId })
      setNewSession({ date: '', timeSlot: '', activity: '', status: 'DRAFT' })
      setShowAddSession(false)
      loadSchedules()
    } catch { /* ignore */ } finally { setSessionSaving(false) }
  }

  const handleUpdateSession = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingSession) return
    setSessionUpdating(true)
    try {
      const { scheduleId, eventId: _eid, ...rest } = editingSession as ScheduleResponseDto & { eventId?: string }
      await eventService.updateSchedule(eventId, scheduleId, { ...rest, eventId })
      setEditingSession(null)
      loadSchedules()
    } catch { /* ignore */ } finally { setSessionUpdating(false) }
  }

  const handleDeleteSession = async (scheduleId: string) => {
    if (!window.confirm('Delete this session?')) return
    await eventService.deleteSchedule(scheduleId)
    loadSchedules()
  }

  return (
    <>
      {/* Quick stats */}
      <Row className="g-3 mb-3">
        {[
          { label: 'Total Tickets',  value: tickets.length },
          { label: 'Registrations', value: registrations.length },
          { label: 'Sessions',       value: schedules.length },
        ].map((s) => (
          <Col key={s.label} xs={12} sm={4}>
            <Card className="es-card border shadow-sm">
              <Card.Body className="p-3">
                <div className="small fw-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{s.label}</div>
                <div className="fw-bold" style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>{s.value}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Schedule */}
      <Card className="es-card border shadow-sm">
        <Card.Body className="p-3 p-md-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Card.Title className="mb-0 fw-semibold" style={{ color: 'var(--text-primary)' }}>Schedule</Card.Title>
            <Button
              variant={showAddSession ? 'outline-secondary' : 'primary'}
              size="sm"
              className="rounded-3"
              onClick={() => {
                if (!showAddSession) setNewSession((p) => ({ ...p, date: eventStartAt }))
                setShowAddSession((v) => !v)
              }}
            >
              {showAddSession ? 'Cancel' : '+ Add Session'}
            </Button>
          </div>

          {showAddSession && (
            <Card className="border mb-3" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-subtle)' }}>
              <Card.Body className="p-3">
                <Form onSubmit={handleAddSession}>
                  <SessionFormFields
                    values={newSession}
                    onChange={(patch) => setNewSession((p) => ({ ...p, ...patch }))}
                  />
                  <div className="text-end mt-3">
                    <Button type="submit" variant="primary" size="sm" className="rounded-3 fw-semibold" disabled={sessionSaving}>
                      {sessionSaving ? <><Spinner animation="border" size="sm" className="me-1" />Saving…</> : 'Save Session'}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          )}

          {schedulesLoading ? (
            <div className="text-center py-4"><Spinner animation="border" style={{ color: 'var(--blue)' }} /></div>
          ) : schedules.length === 0 ? (
            <p className="text-center py-3" style={{ color: 'var(--text-muted)' }}>No sessions added yet.</p>
          ) : (
            <Table hover responsive className="mb-0" style={{ fontSize: '0.88rem' }}>
              <thead style={{ background: 'var(--bg-subtle)' }}>
                <tr>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Date</th>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Time Slot</th>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Activity</th>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Status</th>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s) => {
                  if (editingSession?.scheduleId === s.scheduleId) {
                    return (
                      <tr key={s.scheduleId}>
                        <td colSpan={5} className="p-2">
                          <Card className="border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-subtle)' }}>
                            <Card.Body className="p-3">
                              <Form onSubmit={handleUpdateSession}>
                                <SessionFormFields
                                  values={editingSession}
                                  onChange={(patch) => setEditingSession((p) => p && ({ ...p, ...patch }))}
                                />
                                <div className="d-flex gap-2 justify-content-end mt-3">
                                  <Button type="button" variant="outline-secondary" size="sm" className="rounded-3"
                                    onClick={() => setEditingSession(null)}>Cancel</Button>
                                  <Button type="submit" variant="primary" size="sm" className="rounded-3 fw-semibold"
                                    disabled={sessionUpdating}>
                                    {sessionUpdating ? 'Saving…' : 'Save'}
                                  </Button>
                                </div>
                              </Form>
                            </Card.Body>
                          </Card>
                        </td>
                      </tr>
                    )
                  }
                  return (
                    <tr key={s.scheduleId}>
                      <td className="align-middle" style={{ color: 'var(--text-secondary)' }}>{s.date}</td>
                      <td className="align-middle" style={{ color: 'var(--text-secondary)' }}>{s.timeSlot}</td>
                      <td className="align-middle" style={{ color: 'var(--text-primary)' }}>{s.activity}</td>
                      <td className="align-middle"><EventStatusBadge status={s.status} variant="schedule" /></td>
                      <td className="align-middle">
                        <div className="d-flex gap-1">
                          <Button variant="outline-primary" size="sm" className="rounded-3" style={{ fontSize: '0.78rem' }}
                            onClick={() => setEditingSession(s)}>Edit</Button>
                          <Button variant="outline-danger" size="sm" className="rounded-3" style={{ fontSize: '0.78rem' }}
                            onClick={() => handleDeleteSession(s.scheduleId)}>Delete</Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </>
  )
}
