import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../../store/hooks'
import { updateEvent, fetchEventById } from '../../../../store/slices/eventsSlice'
import { SessionManager } from '../../../elements/events/SessionManager'
import { EventStatusBadge } from '../../../elements/events/EventStatusBadge'
import type { EventStatus } from '../../../../types/events'
import {
  Card, Row, Col, Button, Spinner, Alert,
} from 'react-bootstrap'

interface Props {
  eventId: string
  eventStartAt: string   // ISO: "2024-12-25T09:00:00"
  eventEndAt: string     // ISO: "2024-12-27T18:00:00"
}

export const OverviewTab = ({ eventId, eventStartAt, eventEndAt }: Props) => {
  const dispatch          = useAppDispatch()
  const { tickets }       = useAppSelector((s) => s.tickets)
  const { registrations } = useAppSelector((s) => s.registrations)
  const selectedEvent     = useAppSelector((s) => s.events.selectedEvent)

  const [statusLoading, setStatusLoading] = useState(false)
  const [statusError,   setStatusError]   = useState<string | null>(null)
  const [sessionCount,  setSessionCount]  = useState(0)

  const handleStatusChange = async (newStatus: EventStatus) => {
    if (!selectedEvent) return
    const confirmMsgs: Partial<Record<EventStatus, string>> = {
      CANCELLED: 'Cancel this event? This action cannot be undone.',
      COMPLETED: 'Mark this event as Completed?',
    }
    if (confirmMsgs[newStatus] && !window.confirm(confirmMsgs[newStatus])) return
    setStatusLoading(true)
    setStatusError(null)
    try {
      await dispatch(updateEvent({
        id: selectedEvent.id,
        payload: {
          name:        selectedEvent.eventName,
          organizerId: selectedEvent.organizerId,
          startDate:   selectedEvent.startAt,
          endDate:     selectedEvent.endAt,
          venueId:     selectedEvent.venueId ?? '',
          status:      newStatus,
        },
      })).unwrap()
      dispatch(fetchEventById(selectedEvent.id))
    } catch (err: unknown) {
      setStatusError((err as string) ?? 'Failed to update event status.')
    } finally {
      setStatusLoading(false)
    }
  }

  const status = selectedEvent?.status

  const statusActions = status === 'DRAFT' ? (
    <Button
      variant="outline-primary" size="sm" className="rounded-3 fw-semibold"
      onClick={() => handleStatusChange('PUBLISHED')} disabled={statusLoading}
    >
      {statusLoading ? <><Spinner animation="border" size="sm" className="me-1" />Publishing…</> : 'Publish Event'}
    </Button>
  ) : status === 'PUBLISHED' ? (
    <div className="d-flex gap-2">
      <Button
        variant="outline-secondary" size="sm" className="rounded-3 fw-semibold"
        onClick={() => handleStatusChange('COMPLETED')} disabled={statusLoading}
      >
        {statusLoading ? <Spinner animation="border" size="sm" /> : 'Mark Complete'}
      </Button>
      <Button
        variant="outline-danger" size="sm" className="rounded-3 fw-semibold"
        onClick={() => handleStatusChange('CANCELLED')} disabled={statusLoading}
      >
        {statusLoading ? <Spinner animation="border" size="sm" /> : 'Cancel Event'}
      </Button>
    </div>
  ) : (
    <span className="small" style={{ color: 'var(--text-muted)' }}>
      {status === 'COMPLETED' ? 'Event completed — no further actions.' : 'Event cancelled — no further actions.'}
    </span>
  )

  return (
    <>
      {/* Event status card */}
      {selectedEvent && (
        <Card className="es-card border shadow-sm mb-3">
          <Card.Body className="p-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-2">
              <span className="small fw-medium" style={{ color: 'var(--text-secondary)' }}>Current Status</span>
              <EventStatusBadge status={selectedEvent.status?.toLowerCase()} variant="event" />
            </div>
            <div>
              {statusActions}
              {statusError && (
                <Alert variant="danger" className="py-1 px-2 mt-2 mb-0 small">{statusError}</Alert>
              )}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Quick stats */}
      <Row className="g-3 mb-3">
        {[
          { label: 'Total Tickets',  value: tickets.length },
          { label: 'Registrations', value: registrations.length },
          { label: 'Sessions',       value: sessionCount },
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

      {/* Session manager */}
      <SessionManager
        eventId={eventId}
        eventStartAt={eventStartAt}
        eventEndAt={eventEndAt}
        onCountChange={setSessionCount}
      />
    </>
  )
}
