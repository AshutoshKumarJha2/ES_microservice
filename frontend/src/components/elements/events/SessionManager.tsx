import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SessionFormFields, parseTimeSlot, buildTimeSlot } from './SessionFormFields'
import { EventStatusBadge } from './EventStatusBadge'
import { eventService } from '../../../services/events/eventService'
import type { ScheduleRequestDto, ScheduleStatus } from '../../../types/events'
import { Card, Form, Button, Spinner, Alert, Modal } from 'react-bootstrap'

// ── Types ────────────────────────────────────────────────────────────────────

export interface SessionRow {
  localId: number
  scheduleId?: string
  date: string
  timeSlot: string
  activity: string
  status: ScheduleStatus
}

// ── Helpers ──────────────────────────────────────────────────────────────────

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

const sortRows = (rows: SessionRow[]) =>
  [...rows].sort((a, b) => {
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
  if (start && evtStartTime && session.date === evtStartDate && start < evtStartTime)
    return `Start time cannot be before event start (${evtStartTime}).`
  if (end && evtEndTime && session.date === evtEndDate && end > evtEndTime)
    return `End time cannot be after event end (${evtEndTime}).`
  return null
}

const emptyDraft = (): Omit<ScheduleRequestDto, 'eventId'> => ({
  date: '', timeSlot: '', activity: '', status: 'DRAFT',
})

// ── GapZone ──────────────────────────────────────────────────────────────────

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
        cursor: 'pointer', userSelect: 'none',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      title="Insert session here"
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

// ── SessionManager ────────────────────────────────────────────────────────────

interface Props {
  /**
   * When provided the component operates in API mode:
   * sessions are loaded from and persisted to the backend, with cascading shifts.
   */
  eventId?: string
  /** ISO string ("2026-04-20T09:00:00") or plain date ("2026-04-20") */
  eventStartAt: string
  /** ISO string or plain date */
  eventEndAt: string
  /**
   * Create-mode only (eventId absent): externally controlled session list.
   * All mutations are reported back via onSessionsChange.
   */
  sessions?: SessionRow[]
  onSessionsChange?: (sessions: SessionRow[]) => void
  /** Called whenever the session count changes (useful for parent stats displays) */
  onCountChange?: (count: number) => void
}

export const SessionManager = ({
  eventId,
  eventStartAt,
  eventEndAt,
  sessions: externalSessions,
  onSessionsChange,
  onCountChange,
}: Props) => {
  const isApiMode = Boolean(eventId)
  const navigate = useNavigate()

  // ── Internal state (API mode) ─────────────────────────────────────────────
  const [internalSessions, setInternalSessions] = useState<SessionRow[]>([])
  const [apiLoading, setApiLoading] = useState(false)

  const loadFromApi = () => {
    if (!eventId) return
    setApiLoading(true)
    eventService.getSchedules(eventId)
      .then((list) => {
        const rows = list.map((s, i) => ({
          localId: i + 1,
          scheduleId: s.scheduleId,
          date: s.date,
          timeSlot: s.timeSlot,
          activity: s.activity,
          status: s.status,
        }))
        setInternalSessions(rows)
        onCountChange?.(rows.length)
      })
      .catch(console.error)
      .finally(() => setApiLoading(false))
  }

  useEffect(() => {
    if (isApiMode) loadFromApi()
  }, [eventId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Unified sessions accessor ─────────────────────────────────────────────
  const sessions: SessionRow[] = isApiMode ? internalSessions : (externalSessions ?? [])

  const updateSessions = (updater: SessionRow[] | ((prev: SessionRow[]) => SessionRow[])) => {
    if (isApiMode) {
      setInternalSessions((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater
        onCountChange?.(next.length)
        return next
      })
    } else {
      const prev = externalSessions ?? []
      const next = typeof updater === 'function' ? updater(prev) : updater
      onCountChange?.(next.length)
      onSessionsChange?.(next)
    }
  }

  const nextLocalId = () => Math.max(0, ...sessions.map((s) => s.localId), 0) + 1

  const sorted = sortRows(sessions)

  // ── Insert state ──────────────────────────────────────────────────────────
  const [insertAt, setInsertAt]       = useState<number | null>(null)
  const [hoveredGap, setHoveredGap]   = useState<number | null>(null)
  const [newDraft, setNewDraft]       = useState<Omit<ScheduleRequestDto, 'eventId'>>(emptyDraft())
  const [sessionSaving, setSessionSaving] = useState(false)
  const [insertError, setInsertError] = useState<string | null>(null)

  // ── Edit state ────────────────────────────────────────────────────────────
  const [editingLocalId, setEditingLocalId] = useState<number | null>(null)
  const [editDraft, setEditDraft]           = useState<Omit<ScheduleRequestDto, 'eventId'>>(emptyDraft())
  const [editError, setEditError]           = useState<string | null>(null)
  const [sessionUpdating, setSessionUpdating] = useState(false)

  // ── Delete modal state ────────────────────────────────────────────────────
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)
  const [deleteLoading, setDeleteLoading]   = useState(false)

  // ── Helpers ───────────────────────────────────────────────────────────────
  const evtStartDate = isoToDate(eventStartAt)
  const evtEndDate   = isoToDate(eventEndAt)

  const openInsert = (idx: number) => {
    const prev = idx > 0 ? sorted[idx - 1] : null
    const next = idx < sorted.length ? sorted[idx] : null
    const date      = prev?.date ?? next?.date ?? evtStartDate
    const startTime = prev ? parseTimeSlot(prev.timeSlot).end : isoToTime(eventStartAt)
    const endTime   = next ? parseTimeSlot(next.timeSlot).start : ''
    setNewDraft({ date, timeSlot: buildTimeSlot(startTime, endTime), activity: '', status: 'DRAFT' })
    setInsertError(null)
    setInsertAt(idx)
    setEditingLocalId(null)
    setEditError(null)
  }

  const closeInsert = () => { setInsertAt(null); setInsertError(null) }

  // ── Add session ───────────────────────────────────────────────────────────
  const handleAddSession = async (e: { preventDefault(): void }) => {
    e.preventDefault()

    const err = validateBounds(newDraft, eventStartAt, eventEndAt)
    if (err) { setInsertError(err); return }

    const { start: newStart, end: newEnd } = parseTimeSlot(newDraft.timeSlot)
    if (!newStart || !newEnd) { setInsertError('Please fill in both start and end times.'); return }

    const beforeGroup = sorted.slice(0, insertAt ?? sorted.length).filter((s) => s.date === newDraft.date)
    const afterGroup  = sorted.slice(insertAt ?? sorted.length).filter((s) => s.date === newDraft.date)
    const lastBefore  = beforeGroup.at(-1)
    const firstAfter  = afterGroup.at(0)

    const backShift = lastBefore
      ? Math.max(0, timeToMins(parseTimeSlot(lastBefore.timeSlot).end) - timeToMins(newStart))
      : 0
    const fwdShift  = firstAfter
      ? Math.max(0, timeToMins(newEnd) - timeToMins(parseTimeSlot(firstAfter.timeSlot).start))
      : 0

    if (backShift > 0 && beforeGroup.length > 0) {
      const firstStart = parseTimeSlot(beforeGroup[0].timeSlot).start
      const evtBound   = newDraft.date === evtStartDate ? isoToTime(eventStartAt) : '00:00'
      if (evtBound && minsToTime(timeToMins(firstStart) - backShift) < evtBound)
        return setInsertError(`Not enough room — shifting earlier sessions would go before event start (${evtBound}).`)
    }
    if (fwdShift > 0 && afterGroup.length > 0) {
      const lastEnd  = parseTimeSlot(afterGroup.at(-1)!.timeSlot).end
      const evtBound = newDraft.date === evtEndDate ? isoToTime(eventEndAt) : '23:59'
      if (evtBound && minsToTime(timeToMins(lastEnd) + fwdShift) > evtBound)
        return setInsertError(`Not enough room — shifting later sessions would exceed event end (${evtBound}).`)
    }

    setSessionSaving(true)
    try {
      if (isApiMode && eventId) {
        await eventService.createSchedule(eventId, { ...newDraft, eventId })
        for (const s of beforeGroup) {
          if (backShift === 0) break
          const { start, end } = parseTimeSlot(s.timeSlot)
          await eventService.updateSchedule(eventId, s.scheduleId!, {
            ...s, eventId,
            timeSlot: buildTimeSlot(minsToTime(timeToMins(start) - backShift), minsToTime(timeToMins(end) - backShift)),
          })
        }
        for (const s of afterGroup) {
          if (fwdShift === 0) break
          const { start, end } = parseTimeSlot(s.timeSlot)
          await eventService.updateSchedule(eventId, s.scheduleId!, {
            ...s, eventId,
            timeSlot: buildTimeSlot(minsToTime(timeToMins(start) + fwdShift), minsToTime(timeToMins(end) + fwdShift)),
          })
        }
        loadFromApi()
      } else {
        // Local mode — apply cascading shifts to the local array
        const newRow: SessionRow = { ...newDraft, localId: nextLocalId() }
        updateSessions((prev) => {
          const shifted = prev.map((s) => {
            if (beforeGroup.some((b) => b.localId === s.localId) && backShift > 0) {
              const { start, end } = parseTimeSlot(s.timeSlot)
              return { ...s, timeSlot: buildTimeSlot(minsToTime(timeToMins(start) - backShift), minsToTime(timeToMins(end) - backShift)) }
            }
            if (afterGroup.some((a) => a.localId === s.localId) && fwdShift > 0) {
              const { start, end } = parseTimeSlot(s.timeSlot)
              return { ...s, timeSlot: buildTimeSlot(minsToTime(timeToMins(start) + fwdShift), minsToTime(timeToMins(end) + fwdShift)) }
            }
            return s
          })
          // Insert at correct position (after the last beforeGroup item)
          const insertIdx = insertAt !== null
            ? prev.findIndex((s) => s.localId === sorted[insertAt]?.localId)
            : -1
          const result = [...shifted]
          result.splice(insertIdx === -1 ? result.length : insertIdx, 0, newRow)
          return result
        })
      }
      closeInsert()
    } catch { /* ignore */ } finally { setSessionSaving(false) }
  }

  // ── Edit session ──────────────────────────────────────────────────────────
  const startEdit = (row: SessionRow) => {
    setEditingLocalId(row.localId)
    setEditDraft({ date: row.date, timeSlot: row.timeSlot, activity: row.activity, status: row.status })
    setEditError(null)
    closeInsert()
  }

  const handleUpdateSession = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    if (editingLocalId === null) return

    const boundsErr = validateBounds(editDraft, eventStartAt, eventEndAt)
    if (boundsErr) { setEditError(boundsErr); return }

    const editingRow = sorted.find((s) => s.localId === editingLocalId)!
    const oldSlot    = parseTimeSlot(editingRow.timeSlot)
    const newSlot    = parseTimeSlot(editDraft.timeSlot)
    const idx        = sorted.findIndex((s) => s.localId === editingLocalId)

    const beforeGroup = sorted.slice(0, idx).filter((s) => s.date === editDraft.date)
    const afterGroup  = sorted.slice(idx + 1).filter((s) => s.date === editDraft.date)

    const backShift = oldSlot.start && newSlot.start
      ? Math.max(0, timeToMins(parseTimeSlot(beforeGroup.at(-1)?.timeSlot ?? '').end || '0') - timeToMins(newSlot.start))
      : 0
    const fwdShift  = oldSlot.end && newSlot.end
      ? Math.max(0, timeToMins(newSlot.end) - timeToMins(parseTimeSlot(afterGroup.at(0)?.timeSlot ?? '').start || '9999'))
      : 0

    if (backShift > 0 && beforeGroup.length > 0) {
      const firstStart = parseTimeSlot(beforeGroup[0].timeSlot).start
      const evtBound   = editDraft.date === evtStartDate ? isoToTime(eventStartAt) : '00:00'
      if (evtBound && minsToTime(timeToMins(firstStart) - backShift) < evtBound)
        return setEditError(`Not enough room — shifting earlier sessions would go before event start (${evtBound}).`)
    }
    if (fwdShift > 0 && afterGroup.length > 0) {
      const lastEnd  = parseTimeSlot(afterGroup.at(-1)!.timeSlot).end
      const evtBound = editDraft.date === evtEndDate ? isoToTime(eventEndAt) : '23:59'
      if (evtBound && minsToTime(timeToMins(lastEnd) + fwdShift) > evtBound)
        return setEditError(`Not enough room — shifting later sessions would exceed event end (${evtBound}).`)
    }

    setSessionUpdating(true)
    try {
      if (isApiMode && eventId && editingRow.scheduleId) {
        await eventService.updateSchedule(eventId, editingRow.scheduleId, { ...editDraft, eventId })
        for (const s of beforeGroup) {
          if (backShift === 0) break
          const { start, end } = parseTimeSlot(s.timeSlot)
          await eventService.updateSchedule(eventId, s.scheduleId!, {
            ...s, eventId,
            timeSlot: buildTimeSlot(minsToTime(timeToMins(start) - backShift), minsToTime(timeToMins(end) - backShift)),
          })
        }
        for (const s of afterGroup) {
          if (fwdShift === 0) break
          const { start, end } = parseTimeSlot(s.timeSlot)
          await eventService.updateSchedule(eventId, s.scheduleId!, {
            ...s, eventId,
            timeSlot: buildTimeSlot(minsToTime(timeToMins(start) + fwdShift), minsToTime(timeToMins(end) + fwdShift)),
          })
        }
        loadFromApi()
      } else {
        updateSessions((prev) => prev.map((s) => {
          if (s.localId === editingLocalId) return { ...s, ...editDraft }
          if (beforeGroup.some((b) => b.localId === s.localId) && backShift > 0) {
            const { start, end } = parseTimeSlot(s.timeSlot)
            return { ...s, timeSlot: buildTimeSlot(minsToTime(timeToMins(start) - backShift), minsToTime(timeToMins(end) - backShift)) }
          }
          if (afterGroup.some((a) => a.localId === s.localId) && fwdShift > 0) {
            const { start, end } = parseTimeSlot(s.timeSlot)
            return { ...s, timeSlot: buildTimeSlot(minsToTime(timeToMins(start) + fwdShift), minsToTime(timeToMins(end) + fwdShift)) }
          }
          return s
        }))
      }
      setEditingLocalId(null)
      setEditError(null)
    } catch { /* ignore */ } finally { setSessionUpdating(false) }
  }

  // ── Delete session ────────────────────────────────────────────────────────
  const handleDeleteSession = (localId: number) => setDeleteTargetId(localId)

  const confirmDelete = async () => {
    if (deleteTargetId === null) return
    const localId = deleteTargetId
    const target  = sorted.find((s) => s.localId === localId)
    const idx     = sorted.findIndex((s) => s.localId === localId)

    setDeleteLoading(true)
    try {
      if (isApiMode && eventId && target?.scheduleId) {
        await eventService.deleteSchedule(eventId, target.scheduleId)
        const { start: delStart, end: delEnd } = parseTimeSlot(target.timeSlot)
        const gapMins    = timeToMins(delEnd) - timeToMins(delStart)
        const afterGroup = sorted.slice(idx + 1).filter((s) => s.date === target.date)
        for (const s of afterGroup) {
          const { start, end } = parseTimeSlot(s.timeSlot)
          await eventService.updateSchedule(eventId, s.scheduleId!, {
            ...s, eventId,
            timeSlot: buildTimeSlot(minsToTime(timeToMins(start) - gapMins), minsToTime(timeToMins(end) - gapMins)),
          })
        }
        loadFromApi()
      } else {
        if (target) {
          const { start: delStart, end: delEnd } = parseTimeSlot(target.timeSlot)
          const gapMins    = timeToMins(delEnd) - timeToMins(delStart)
          const afterGroup = sorted.slice(idx + 1).filter((s) => s.date === target.date)
          updateSessions((prev) =>
            prev
              .filter((s) => s.localId !== localId)
              .map((s) => {
                if (afterGroup.some((a) => a.localId === s.localId) && gapMins > 0) {
                  const { start, end } = parseTimeSlot(s.timeSlot)
                  return { ...s, timeSlot: buildTimeSlot(minsToTime(timeToMins(start) - gapMins), minsToTime(timeToMins(end) - gapMins)) }
                }
                return s
              })
          )
        } else {
          updateSessions((prev) => prev.filter((s) => s.localId !== localId))
        }
      }
    } finally {
      setDeleteLoading(false)
      setDeleteTargetId(null)
    }
  }

  // ── Grid styles ───────────────────────────────────────────────────────────
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

  // ── Insert form (shared for all gap positions) ────────────────────────────
  const insertForm = (
    <Card className="border my-1" style={{ borderColor: 'var(--bs-primary)', background: 'var(--bg-subtle)' }}>
      <Card.Body className="p-3">
        <Form onSubmit={handleAddSession}>
          <SessionFormFields
            values={newDraft}
            onChange={(patch) => { setNewDraft((p) => ({ ...p, ...patch })); setInsertError(null) }}
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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Card className="es-card border shadow-sm">
      <Card.Body className="p-3 p-md-4">
        <Card.Title className="mb-3 fw-semibold" style={{ color: 'var(--text-primary)' }}>
          Schedule
        </Card.Title>

        {apiLoading ? (
          <div className="text-center py-4"><Spinner animation="border" style={{ color: 'var(--blue)' }} /></div>
        ) : sorted.length === 0 ? (
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
            {/* Column headers */}
            <div style={gridStyle}>
              {['Date', 'Time Slot', 'Activity', 'Status', 'Actions'].map((h) => (
                <div key={h} style={headerCol}>{h}</div>
              ))}
            </div>

            {/* Gap before first row */}
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
              <div key={s.localId}>
                {/* Inline edit form or read-only row */}
                {editingLocalId === s.localId ? (
                  <Card className="border my-1" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-subtle)' }}>
                    <Card.Body className="p-3">
                      <Form onSubmit={handleUpdateSession}>
                        <SessionFormFields
                          values={editDraft}
                          onChange={(patch) => { setEditDraft((p) => ({ ...p, ...patch })); setEditError(null) }}
                          minDate={evtStartDate}
                          maxDate={evtEndDate}
                        />
                        {editError && (
                          <Alert variant="danger" className="py-2 px-3 mt-2 mb-0" style={{ fontSize: '0.83rem' }}>
                            {editError}
                          </Alert>
                        )}
                        <div className="d-flex gap-2 justify-content-end mt-3">
                          <Button
                            type="button" variant="outline-secondary" size="sm" className="rounded-3"
                            onClick={() => { setEditingLocalId(null); setEditError(null) }}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit" variant="primary" size="sm" className="rounded-3 fw-semibold"
                            disabled={sessionUpdating}
                          >
                            {sessionUpdating ? 'Saving…' : 'Save'}
                          </Button>
                        </div>
                      </Form>
                    </Card.Body>
                  </Card>
                ) : (
                  <div
                    style={{ ...gridStyle, background: 'transparent' }}
                    onMouseEnter={(el) => (el.currentTarget.style.background = 'var(--bg-subtle)')}
                    onMouseLeave={(el) => (el.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ ...colBase, color: 'var(--text-secondary)' }}>{s.date}</div>
                    <div style={{ ...colBase, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{s.timeSlot}</div>
                    <div style={colBase}>
                      {isApiMode && s.scheduleId ? (
                        <button
                          onClick={() => navigate(`/organizer/events/${eventId}/sessions/${s.scheduleId}/attendance`)}
                          style={{
                            background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                            color: 'var(--text-primary)', fontWeight: 500,
                            textDecoration: 'underline', textDecorationColor: 'var(--border-color)',
                            textUnderlineOffset: '3px',
                          }}
                          title="Take attendance for this session"
                        >
                          {s.activity}
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-primary)' }}>{s.activity}</span>
                      )}
                    </div>
                    <div style={colBase}>
                      <EventStatusBadge status={s.status?.toLowerCase()} variant="schedule" />
                    </div>
                    <div style={colBase}>
                      <div className="d-flex gap-1">
                        <Button
                          variant="outline-primary" size="sm" className="rounded-3"
                          style={{ fontSize: '0.78rem' }}
                          onClick={() => startEdit(s)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline-danger" size="sm" className="rounded-3"
                          style={{ fontSize: '0.78rem' }}
                          onClick={() => handleDeleteSession(s.localId)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Gap after this row */}
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

      <Modal show={deleteTargetId !== null} onHide={() => setDeleteTargetId(null)} centered size="sm">
        <Modal.Header closeButton className="border-0 pb-1">
          <Modal.Title style={{ fontSize: '1rem' }}>Delete Session</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ fontSize: '0.9rem', paddingTop: '0.5rem' }}>
          Are you sure you want to delete?
        </Modal.Body>
        <Modal.Footer className="border-0 pt-1">
          <Button variant="outline-secondary" size="sm" onClick={() => setDeleteTargetId(null)} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={confirmDelete} disabled={deleteLoading}>
            {deleteLoading ? <><Spinner animation="border" size="sm" className="me-1" />Deleting…</> : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  )
}
