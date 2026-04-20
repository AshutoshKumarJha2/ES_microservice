import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../../store/hooks'
import { updateEvent, fetchEventById } from '../../../../store/slices/eventsSlice'
import { eventService } from '../../../../services/events/eventService'
import { SessionFormFields, parseTimeSlot, buildTimeSlot } from '../../../elements/events/SessionFormFields'
import { EventStatusBadge } from '../../../elements/events/EventStatusBadge'
import type { ScheduleResponseDto, ScheduleRequestDto, EventStatus } from '../../../../types/events'
import {
  Card, Row, Col, Button, Form, Spinner, Alert,
} from 'react-bootstrap'

interface Props {
  eventId: string
  eventStartAt: string   // ISO: "2024-12-25T09:00:00"
  eventEndAt: string     // ISO: "2024-12-27T18:00:00"
}

const isoToDate = (iso: string) => iso.split('T')[0]
const isoToTime = (iso: string) => iso.split('T')[1]?.slice(0, 5) ?? ''

const timeToMins = (t: string) => {
  const [h = '0', m = '0'] = t.split(':')
  return parseInt(h) * 60 + parseInt(m)
}
const minsToTime = (mins: number) => {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

const sortSchedules = (list: ScheduleResponseDto[]) =>
  [...list].sort((a, b) => {
    const d = a.date.localeCompare(b.date)
    return d !== 0 ? d : parseTimeSlot(a.timeSlot).start.localeCompare(parseTimeSlot(b.timeSlot).start)
  })

function validateBounds(
  session: { date: string; timeSlot: string },
  eventStartAt: string,
  eventEndAt: string,
): string | null {
  const { start, end } = parseTimeSlot(session.timeSlot)
  const evtStartDate = isoToDate(eventStartAt)
  const evtEndDate   = isoToDate(eventEndAt)
  const evtStartTime = isoToTime(eventStartAt)
  const evtEndTime   = isoToTime(eventEndAt)

  if (session.date < evtStartDate) return 'Date cannot be before the event starts.'
  if (session.date > evtEndDate)   return 'Date cannot be after the event ends.'
  if (start && end && end <= start) return 'End time must be after start time.'
  if (start && session.date === evtStartDate && start < evtStartTime)
    return `Start time cannot be before event start (${evtStartTime}).`
  if (end && session.date === evtEndDate && end > evtEndTime)
    return `End time cannot be after event end (${evtEndTime}).`
  return null
}

// For new inserts we only need bounds + start<end.
// Clashes with neighbours are resolved by cascading shifts — validated in handleAddSession.
function validateInsert(
  session: { date: string; timeSlot: string },
  eventStartAt: string,
  eventEndAt: string,
): string | null {
  return validateBounds(session, eventStartAt, eventEndAt)
}

// Validate an edit, skipping the session itself in clash check
function validateSchedule(
  session: { date: string; timeSlot: string },
  existing: ScheduleResponseDto[],
  eventStartAt: string,
  eventEndAt: string,
  skipId?: string,
): string | null {
  const boundsErr = validateBounds(session, eventStartAt, eventEndAt)
  if (boundsErr) return boundsErr

  const { start, end } = parseTimeSlot(session.timeSlot)
  for (const s of existing.filter((x) => x.date === session.date && x.scheduleId !== skipId)) {
    const { start: a, end: b } = parseTimeSlot(s.timeSlot)
    if (start && end && a && b && start < b && a < end)
      return `Clashes with "${s.activity}" (${s.timeSlot}).`
  }
  return null
}

const emptySession = (): Omit<ScheduleRequestDto, 'eventId'> => ({
  date: '', timeSlot: '', activity: '', status: 'DRAFT',
})

// ── Gap zone ─────────────────────────────────────────────────────────────────

interface GapProps {
  boundary: boolean
  hovered: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
  onClick: () => void
}

const GapZone = ({ boundary, hovered, onMouseEnter, onMouseLeave, onClick }: GapProps) => {
  const visible = boundary || hovered
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: boundary ? '4px 0' : '2px 0',
        cursor: 'pointer',
        userSelect: 'none',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      title="Insert schedule here"
    >
      <div style={{
        flex: 1, height: 1,
        background: visible ? 'var(--bs-primary)' : (boundary ? 'var(--border-subtle)' : 'transparent'),
        transition: 'background 0.15s',
      }} />
      <div style={{
        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
        border: `1.5px ${boundary ? 'solid' : 'dashed'} ${visible ? 'var(--bs-primary)' : 'var(--text-muted)'}`,
        color: visible ? 'var(--bs-primary)' : 'var(--text-muted)',
        background: 'var(--bg-card, #fff)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.85rem', fontWeight: 600, lineHeight: 1,
        transition: 'border-color 0.15s, color 0.15s, opacity 0.15s',
        opacity: visible ? 1 : 0,
      }}>+</div>
      <div style={{
        flex: 1, height: 1,
        background: visible ? 'var(--bs-primary)' : (boundary ? 'var(--border-subtle)' : 'transparent'),
        transition: 'background 0.15s',
      }} />
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export const OverviewTab = ({ eventId, eventStartAt, eventEndAt }: Props) => {
  const dispatch        = useAppDispatch()
  const { tickets }     = useAppSelector((s) => s.tickets)
  const { registrations } = useAppSelector((s) => s.registrations)
  const selectedEvent   = useAppSelector((s) => s.events.selectedEvent)

  const [statusLoading, setStatusLoading] = useState(false)
  const [statusError,   setStatusError]   = useState<string | null>(null)

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
          name: selectedEvent.eventName,
          organizerId: selectedEvent.organizerId,
          startDate: selectedEvent.startAt,
          endDate: selectedEvent.endAt,
          venueId: selectedEvent.venueId ?? '',
          status: newStatus,
        },
      })).unwrap()
      dispatch(fetchEventById(selectedEvent.id))
    } catch (err: unknown) {
      setStatusError((err as string) ?? 'Failed to update event status.')
    } finally {
      setStatusLoading(false)
    }
  }

  const [schedules, setSchedules]               = useState<ScheduleResponseDto[]>([])
  const [schedulesLoading, setSchedulesLoading] = useState(false)

  // insertAt: which gap index is open for new-session form (null = none)
  const [insertAt, setInsertAt]           = useState<number | null>(null)
  const [hoveredGap, setHoveredGap]       = useState<number | null>(null)
  const [newSession, setNewSession]       = useState<Omit<ScheduleRequestDto, 'eventId'>>(emptySession())
  const [sessionSaving, setSessionSaving] = useState(false)
  const [insertError, setInsertError]     = useState<string | null>(null)

  const [editingSession, setEditingSession]         = useState<ScheduleResponseDto | null>(null)
  const [editOriginalTimeSlot, setEditOriginalSlot] = useState('')
  const [editError, setEditError]                   = useState<string | null>(null)
  const [sessionUpdating, setSessionUpdating]       = useState(false)

  const loadSchedules = () => {
    setSchedulesLoading(true)
    eventService.getSchedules(eventId)
      .then(setSchedules)
      .catch(console.error)
      .finally(() => setSchedulesLoading(false))
  }

  useEffect(() => { loadSchedules() }, [eventId]) // eslint-disable-line react-hooks/exhaustive-deps

  const sorted = sortSchedules(schedules)

  // Open the insert form at a given gap index, pre-filling adjacent times
  const openInsert = (idx: number) => {
    const prev = idx > 0 ? sorted[idx - 1] : null
    const next = idx < sorted.length ? sorted[idx] : null

    const date      = prev?.date ?? next?.date ?? isoToDate(eventStartAt)
    const startTime = prev ? parseTimeSlot(prev.timeSlot).end : isoToTime(eventStartAt)
    const endTime   = next ? parseTimeSlot(next.timeSlot).start : ''

    setNewSession({ ...emptySession(), date, timeSlot: buildTimeSlot(startTime, endTime) })
    setInsertError(null)
    setInsertAt(idx)
    setEditingSession(null)
  }

  const closeInsert = () => { setInsertAt(null); setInsertError(null) }

  const handleAddSession = async (e: { preventDefault(): void }) => {
    e.preventDefault()

    const err = validateInsert(newSession, eventStartAt, eventEndAt)
    if (err) { setInsertError(err); return }

    const { start: newStart, end: newEnd } = parseTimeSlot(newSession.timeSlot)
    if (!newStart || !newEnd) { setInsertError('Please fill in both start and end times.'); return }

    // Same-date sessions before and after the insertion point
    const beforeGroup = sorted
      .slice(0, insertAt ?? sorted.length)
      .filter((s) => s.date === newSession.date)
    const afterGroup = sorted
      .slice(insertAt ?? sorted.length)
      .filter((s) => s.date === newSession.date)

    // How much do we need to shift each group?
    const lastBefore = beforeGroup.at(-1)
    const firstAfter = afterGroup.at(0)

    const backShift = lastBefore
      ? Math.max(0, timeToMins(parseTimeSlot(lastBefore.timeSlot).end) - timeToMins(newStart))
      : 0
    const fwdShift = firstAfter
      ? Math.max(0, timeToMins(newEnd) - timeToMins(parseTimeSlot(firstAfter.timeSlot).start))
      : 0

    // Validate there is enough room in each direction
    if (backShift > 0 && beforeGroup.length > 0) {
      const firstStart = parseTimeSlot(beforeGroup[0].timeSlot).start
      const evtBound   = newSession.date === isoToDate(eventStartAt) ? isoToTime(eventStartAt) : '00:00'
      if (minsToTime(timeToMins(firstStart) - backShift) < evtBound)
        return setInsertError(
          `Not enough room — shifting earlier sessions would go before event start (${evtBound}).`,
        )
    }
    if (fwdShift > 0 && afterGroup.length > 0) {
      const lastEnd  = parseTimeSlot(afterGroup.at(-1)!.timeSlot).end
      const evtBound = newSession.date === isoToDate(eventEndAt) ? isoToTime(eventEndAt) : '23:59'
      if (minsToTime(timeToMins(lastEnd) + fwdShift) > evtBound)
        return setInsertError(
          `Not enough room — shifting later sessions would exceed event end (${evtBound}).`,
        )
    }

    setSessionSaving(true)
    try {
      await eventService.createSchedule(eventId, { ...newSession, eventId })

      // Shift sessions before backward (keep duration)
      for (const s of beforeGroup) {
        if (backShift === 0) break
        const { start, end } = parseTimeSlot(s.timeSlot)
        await eventService.updateSchedule(eventId, s.scheduleId, {
          ...s, eventId,
          timeSlot: buildTimeSlot(
            minsToTime(timeToMins(start) - backShift),
            minsToTime(timeToMins(end)   - backShift),
          ),
        })
      }

      // Shift sessions after forward (keep duration)
      for (const s of afterGroup) {
        if (fwdShift === 0) break
        const { start, end } = parseTimeSlot(s.timeSlot)
        await eventService.updateSchedule(eventId, s.scheduleId, {
          ...s, eventId,
          timeSlot: buildTimeSlot(
            minsToTime(timeToMins(start) + fwdShift),
            minsToTime(timeToMins(end)   + fwdShift),
          ),
        })
      }

      closeInsert()
      loadSchedules()
    } catch { /* ignore */ } finally { setSessionSaving(false) }
  }

  const handleUpdateSession = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    if (!editingSession) return

    const boundsErr = validateBounds(editingSession, eventStartAt, eventEndAt)
    if (boundsErr) { setEditError(boundsErr); return }

    const { scheduleId } = editingSession
    const oldSlot = parseTimeSlot(editOriginalTimeSlot)
    const newSlot = parseTimeSlot(editingSession.timeSlot)

    const idx = sorted.findIndex((s) => s.scheduleId === scheduleId)

    // Same-date sessions strictly before and after this one
    const beforeGroup = sorted
      .slice(0, idx)
      .filter((s) => s.date === editingSession.date)
    const afterGroup = sorted
      .slice(idx + 1)
      .filter((s) => s.date === editingSession.date)

    // Start moved earlier → sessions before need to shift backward
    // Start moved later  → no cascade needed (gap opens up)
    const backShift = oldSlot.start && newSlot.start
      ? Math.max(0, timeToMins(parseTimeSlot(beforeGroup.at(-1)?.timeSlot ?? '').end || '0') - timeToMins(newSlot.start))
      : 0

    // End moved later   → sessions after need to shift forward
    // End moved earlier → no cascade needed (gap opens up)
    const fwdShift = oldSlot.end && newSlot.end
      ? Math.max(0, timeToMins(newSlot.end) - timeToMins(parseTimeSlot(afterGroup.at(0)?.timeSlot ?? '').start || '9999'))
      : 0

    if (backShift > 0 && beforeGroup.length > 0) {
      const firstStart = parseTimeSlot(beforeGroup[0].timeSlot).start
      const evtBound   = editingSession.date === isoToDate(eventStartAt) ? isoToTime(eventStartAt) : '00:00'
      if (minsToTime(timeToMins(firstStart) - backShift) < evtBound)
        return setEditError(`Not enough room — shifting earlier sessions would go before event start (${evtBound}).`)
    }
    if (fwdShift > 0 && afterGroup.length > 0) {
      const lastEnd  = parseTimeSlot(afterGroup.at(-1)!.timeSlot).end
      const evtBound = editingSession.date === isoToDate(eventEndAt) ? isoToTime(eventEndAt) : '23:59'
      if (minsToTime(timeToMins(lastEnd) + fwdShift) > evtBound)
        return setEditError(`Not enough room — shifting later sessions would exceed event end (${evtBound}).`)
    }

    setSessionUpdating(true)
    try {
      const { eventId: _eid, ...rest } = editingSession as ScheduleResponseDto & { eventId?: string }
      await eventService.updateSchedule(eventId, scheduleId, { ...rest, eventId })

      for (const s of beforeGroup) {
        if (backShift === 0) break
        const { start, end } = parseTimeSlot(s.timeSlot)
        await eventService.updateSchedule(eventId, s.scheduleId, {
          ...s, eventId,
          timeSlot: buildTimeSlot(
            minsToTime(timeToMins(start) - backShift),
            minsToTime(timeToMins(end)   - backShift),
          ),
        })
      }

      for (const s of afterGroup) {
        if (fwdShift === 0) break
        const { start, end } = parseTimeSlot(s.timeSlot)
        await eventService.updateSchedule(eventId, s.scheduleId, {
          ...s, eventId,
          timeSlot: buildTimeSlot(
            minsToTime(timeToMins(start) + fwdShift),
            minsToTime(timeToMins(end)   + fwdShift),
          ),
        })
      }

      setEditingSession(null)
      setEditError(null)
      loadSchedules()
    } catch { /* ignore */ } finally { setSessionUpdating(false) }
  }

  const handleDeleteSession = async (scheduleId: string) => {
    if (!window.confirm('Delete this session?')) return

    const target = sorted.find((s) => s.scheduleId === scheduleId)
    const idx    = sorted.findIndex((s) => s.scheduleId === scheduleId)

    await eventService.deleteSchedule(eventId, scheduleId)

    // Shift same-date sessions that come after the deleted one backward,
    // closing the gap left by the deleted session's duration.
    if (target) {
      const { start: delStart, end: delEnd } = parseTimeSlot(target.timeSlot)
      const gapMins = timeToMins(delEnd) - timeToMins(delStart)

      const afterGroup = sorted
        .slice(idx + 1)
        .filter((s) => s.date === target.date)

      for (const s of afterGroup) {
        const { start, end } = parseTimeSlot(s.timeSlot)
        await eventService.updateSchedule(eventId, s.scheduleId, {
          ...s, eventId,
          timeSlot: buildTimeSlot(
            minsToTime(timeToMins(start) - gapMins),
            minsToTime(timeToMins(end)   - gapMins),
          ),
        })
      }
    }

    loadSchedules()
  }

  const evtStartDate = isoToDate(eventStartAt)
  const evtEndDate   = isoToDate(eventEndAt)

  // ── Insert form (shared for all gap positions) ──────────────────────────────
  const insertForm = (
    <Card className="border my-1" style={{ borderColor: 'var(--bs-primary)', background: 'var(--bg-subtle)' }}>
      <Card.Body className="p-3">
        <Form onSubmit={handleAddSession}>
          <SessionFormFields
            values={newSession}
            onChange={(patch) => { setNewSession((p) => ({ ...p, ...patch })); setInsertError(null) }}
            minDate={evtStartDate}
            maxDate={evtEndDate}
          />
          {insertError && (
            <Alert variant="danger" className="py-2 px-3 mt-2 mb-0" style={{ fontSize: '0.83rem' }}>
              {insertError}
            </Alert>
          )}
          <div className="d-flex gap-2 justify-content-end mt-3">
            <Button type="button" variant="outline-secondary" size="sm" className="rounded-3" onClick={closeInsert}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="rounded-3 fw-semibold" disabled={sessionSaving}>
              {sessionSaving ? <><Spinner animation="border" size="sm" className="me-1" />Saving…</> : 'Save Session'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  )

  // ── Single schedule row ─────────────────────────────────────────────────────
  const colBase: React.CSSProperties = {
    padding: '0.5rem 0.75rem',
    fontSize: '0.88rem',
    borderBottom: '1px solid var(--border-subtle)',
  }
  const headerCol: React.CSSProperties = {
    ...colBase,
    fontWeight: 600,
    color: 'var(--text-secondary)',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  }
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '110px 130px 1fr 100px 110px',
    alignItems: 'center',
  }

  // ── Status action helpers ────────────────────────────────────────────────
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
      {/* Event Status card */}
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
          <Card.Title className="mb-3 fw-semibold" style={{ color: 'var(--text-primary)' }}>Schedule</Card.Title>

          {schedulesLoading ? (
            <div className="text-center py-4"><Spinner animation="border" style={{ color: 'var(--blue)' }} /></div>
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
    </>
  )
}
