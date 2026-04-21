import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../../store/hooks'
import { updateEvent, fetchEventById } from '../../../../store/slices/eventsSlice'
import { SessionManager } from '../../../elements/events/SessionManager'
import { EventStatusBadge } from '../../../elements/events/EventStatusBadge'
import type { EventStatus } from '../../../../types/events'
import {
  Card, Row, Col, Button, Spinner, Alert,
} from 'react-bootstrap'
import { TableRowsSkeleton } from '../../../elements/skeletons/PageSkeleton'

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

<<<<<<< Updated upstream
      {/* Session manager */}
      <SessionManager
        eventId={eventId}
        eventStartAt={eventStartAt}
        eventEndAt={eventEndAt}
        onCountChange={setSessionCount}
      />
=======
      {/* Schedule */}
      <Card className="es-card border shadow-sm">
        <Card.Body className="p-3 p-md-4">
          <Card.Title className="mb-3 fw-semibold" style={{ color: 'var(--text-primary)' }}>Schedule</Card.Title>

          {schedulesLoading ? (
            <TableRowsSkeleton rows={4} cols={5} />
          ) : sorted.length === 0 ? (
            // Empty state: one centered + zone
            insertAt === 0 ? insertForm : (
              <div className="py-2">
                <GapZone
                  boundary
                  hovered={hoveredGap === 0}
                  onMouseEnter={() => setHoveredGap(0)}
                  onMouseLeave={() => setHoveredGap(null)}
                  onClick={() => openInsert(0)}
                />
                <p className="text-center mb-0 mt-1" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No sessions yet — click + to add the first one.
                </p>
              </div>
            )
          ) : (
            <div>
              {/* Column header row */}
              <div style={gridStyle}>
                {['Date', 'Time Slot', 'Activity', 'Status', 'Actions'].map((h) => (
                  <div key={h} style={headerCol}>{h}</div>
                ))}
              </div>

              {/* Gap 0 — before first schedule */}
              {insertAt === 0 ? insertForm : (
                <GapZone
                  boundary
                  hovered={hoveredGap === 0}
                  onMouseEnter={() => setHoveredGap(0)}
                  onMouseLeave={() => setHoveredGap(null)}
                  onClick={() => openInsert(0)}
                />
              )}

              {sorted.map((s, i) => (
                <div key={s.scheduleId}>
                  {/* Schedule row or inline edit form */}
                  {editingSession?.scheduleId === s.scheduleId ? (
                    <Card className="border my-1" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-subtle)' }}>
                      <Card.Body className="p-3">
                        <Form onSubmit={handleUpdateSession}>
                          <SessionFormFields
                            values={editingSession}
                            onChange={(patch) => {
                              setEditingSession((p) => p && ({ ...p, ...patch }))
                              setEditError(null)
                            }}
                            minDate={evtStartDate}
                            maxDate={evtEndDate}
                          />
                          {editError && (
                            <Alert variant="danger" className="py-2 px-3 mt-2 mb-0" style={{ fontSize: '0.83rem' }}>
                              {editError}
                            </Alert>
                          )}
                          <div className="d-flex gap-2 justify-content-end mt-3">
                            <Button type="button" variant="outline-secondary" size="sm" className="rounded-3"
                              onClick={() => { setEditingSession(null); setEditError(null) }}>Cancel</Button>
                            <Button type="submit" variant="primary" size="sm" className="rounded-3 fw-semibold"
                              disabled={sessionUpdating}>
                              {sessionUpdating ? 'Saving…' : 'Save'}
                            </Button>
                          </div>
                        </Form>
                      </Card.Body>
                    </Card>
                  ) : (
                    <div style={{ ...gridStyle, background: 'transparent' }}
                      onMouseEnter={(el) => (el.currentTarget.style.background = 'var(--bg-subtle)')}
                      onMouseLeave={(el) => (el.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ ...colBase, color: 'var(--text-secondary)' }}>{s.date}</div>
                      <div style={{ ...colBase, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{s.timeSlot}</div>
                      <div style={{ ...colBase, color: 'var(--text-primary)' }}>{s.activity}</div>
                      <div style={colBase}><EventStatusBadge status={s.status} variant="schedule" /></div>
                      <div style={colBase}>
                        <div className="d-flex gap-1">
                          <Button variant="outline-primary" size="sm" className="rounded-3" style={{ fontSize: '0.78rem' }}
                            onClick={() => {
                              setEditOriginalSlot(s.timeSlot)
                              setEditingSession(s)
                              setEditError(null)
                              closeInsert()
                            }}>Edit</Button>
                          <Button variant="outline-danger" size="sm" className="rounded-3" style={{ fontSize: '0.78rem' }}
                            onClick={() => handleDeleteSession(s.scheduleId)}>Delete</Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Gap after this schedule */}
                  {insertAt === i + 1 ? insertForm : (
                    <GapZone
                      boundary={i === sorted.length - 1}
                      hovered={hoveredGap === i + 1}
                      onMouseEnter={() => setHoveredGap(i + 1)}
                      onMouseLeave={() => setHoveredGap(null)}
                      onClick={() => openInsert(i + 1)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
>>>>>>> Stashed changes
    </>
  )
}
