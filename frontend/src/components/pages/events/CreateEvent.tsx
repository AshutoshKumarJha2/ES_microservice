import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { createEvent, updateEvent, fetchEventById } from '../../../store/slices/eventsSlice'
import { venueService } from '../../../services/events/venueService'
import { eventService } from '../../../services/events/eventService'
import type { EventRequestDto, ScheduleRequestDto, VenueResponseDto } from '../../../types/events'
import styles from '../../../css/events/EventsPanel.module.css'

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
  const { id } = useParams<{ id?: string }>()
  const isEdit = Boolean(id)

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
            name: event.eventName,
            organizerId: event.organizerId,
            startDate: event.startAt,
            endDate: event.endAt,
            venueId: event.venueId,
            status: event.status,
          })
          eventService.getSchedules(id).then((schedules) => {
            setSessions(
              schedules.map((s, i) => ({
                localId: i + 1,
                scheduleId: s.scheduleId,
                date: s.date,
                timeSlot: s.timeSlot,
                activity: s.activity,
                status: s.status,
              }))
            )
            setNextId(schedules.length + 1)
          })
        })
        .catch(console.error)
    }
  }, [id, isEdit, dispatch])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    <div className={styles.page}>
      {/* Banner */}
      <div className={styles.banner}>
        <div className={styles['banner-inner']}>
          <div className={styles['banner-text']}>
            <h1>{isEdit ? 'Edit Event' : 'Create New Event'}</h1>
            <p>{isEdit ? 'Update the details for your event.' : 'Fill in the details below to create your event.'}</p>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.card}>
          <form id="event-form" onSubmit={handleSubmit}>
            <p className={styles['section-heading']}>Event Details</p>
            <div className={styles['form-grid']}>
              <div className={`${styles.field} ${styles.full}`}>
                <label>Event Name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter event name"
                  required
                />
              </div>
              <div className={styles.field}>
                <label>Start Date *</label>
                <input name="startDate" type="date" value={form.startDate} onChange={handleChange} required />
              </div>
              <div className={styles.field}>
                <label>End Date *</label>
                <input
                  name="endDate"
                  type="date"
                  value={form.endDate}
                  min={form.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.field}>
                <label>Venue</label>
                <select name="venueId" value={form.venueId} onChange={handleChange}>
                  <option value="">Select a venue</option>
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} — {v.location} (cap: {v.capacity})
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label>Status</label>
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

          </form>

          <hr className={styles.divider} />

          <div className={styles['sessions-header']}>
            <p className={styles['section-heading']} style={{ margin: 0 }}>Sessions (Optional)</p>
            <button type="button" className={styles['btn-add-session']} onClick={addSession}>
              + Add Session
            </button>
          </div>

          {sessions.map((session) => (
              <div key={session.localId} className={styles['session-row']}>
                {/* Fields row */}
                <div className={styles['session-row-fields']}>
                  <div className={styles.field}>
                    <label>Date</label>
                    <input
                      type="date"
                      value={session.date}
                      onChange={(e) => handleSessionChange(session.localId, 'date', e.target.value)}
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Time Slot</label>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <input
                        type="time"
                        value={parseTimeSlot(session.timeSlot).start}
                        onChange={(e) =>
                          handleSessionChange(
                            session.localId,
                            'timeSlot',
                            buildTimeSlot(e.target.value, parseTimeSlot(session.timeSlot).end)
                          )
                        }
                        style={{ flex: 1, minWidth: 0 }}
                      />
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', flexShrink: 0 }}>to</span>
                      <input
                        type="time"
                        value={parseTimeSlot(session.timeSlot).end}
                        min={parseTimeSlot(session.timeSlot).start || undefined}
                        onChange={(e) =>
                          handleSessionChange(
                            session.localId,
                            'timeSlot',
                            buildTimeSlot(parseTimeSlot(session.timeSlot).start, e.target.value)
                          )
                        }
                        style={{ flex: 1, minWidth: 0 }}
                      />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label>Activity</label>
                    <input
                      type="text"
                      placeholder="Session title or description"
                      value={session.activity}
                      onChange={(e) => handleSessionChange(session.localId, 'activity', e.target.value)}
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Status</label>
                    <select
                      value={session.status}
                      onChange={(e) => handleSessionChange(session.localId, 'status', e.target.value)}
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="ACTIVE">Active</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="TERMINATED">Terminated</option>
                    </select>
                  </div>
                </div>

                {/* Actions row */}
                <div className={styles['session-row-actions']}>
                  {session.saveError && (
                    <span style={{ fontSize: '0.68rem', color: 'var(--red)', marginRight: 'auto' }}>
                      {session.saveError}
                    </span>
                  )}
                  {session.scheduleId && session.dirty && (
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      color: 'var(--saffron, #f59e0b)',
                      background: 'color-mix(in srgb, var(--saffron, #f59e0b) 12%, transparent)',
                      border: '1px solid color-mix(in srgb, var(--saffron, #f59e0b) 35%, transparent)',
                      borderRadius: '4px',
                      padding: '1px 6px',
                      marginRight: 'auto',
                    }}>edited</span>
                  )}
                  {isEdit && (
                    <button
                      type="button"
                      className={styles['btn-add-session']}
                      disabled={!session.dirty || session.saving}
                      onClick={() => handleSaveSession(session.localId)}
                      style={{
                        borderColor: session.dirty ? 'var(--blue)' : undefined,
                        color: session.dirty ? 'var(--blue)' : undefined,
                        opacity: !session.dirty ? 0.45 : 1,
                      }}
                    >
                      {session.saving ? '…' : '↑ Save'}
                    </button>
                  )}
                  <button
                    type="button"
                    className={styles['btn-remove']}
                    disabled={session.saving}
                    onClick={() => handleDeleteSession(session.localId)}
                  >
                    {session.saving ? '…' : '✕ Remove'}
                  </button>
                </div>
              </div>
            ))}

          {error && <p className={styles['error-msg']}>{error}</p>}

          <div className={styles['form-footer']}>
            <button type="submit" form="event-form" className={styles['btn-submit']} disabled={loading}>
              {loading ? 'Saving…' : isEdit ? 'Update Event' : 'Create Event'}
            </button>
            <button type="button" className={styles['btn-cancel-form']} onClick={() => navigate('/organizer/dashboard')}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
