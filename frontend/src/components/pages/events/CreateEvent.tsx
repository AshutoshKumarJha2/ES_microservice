import { useState, useEffect } from 'react'
import { useNavigate, useParams, NavLink } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { createEvent, updateEvent, fetchEventById } from '../../../store/slices/eventsSlice'
import { venueService } from '../../../services/events/venueService'
import { eventService } from '../../../services/events/eventService'
import type { EventRequestDto, ScheduleRequestDto, VenueResponseDto } from '../../../types/events'
import styles from '../../../css/events/EventsPanel.module.css'

interface SessionRow extends Omit<ScheduleRequestDto, 'eventId'> {
  localId: number
}

const EMPTY_SESSION: Omit<SessionRow, 'localId'> = {
  date: '',
  timeSlot: '',
  activity: '',
  status: 'draft',
}

const navLink = ({ isActive }: { isActive: boolean }) =>
  `${styles['subnav-link']}${isActive ? ` ${styles.active}` : ''}`

export const CreateEvent = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { id } = useParams<{ id?: string }>()
  const isEdit = Boolean(id)

  const { loading, error } = useAppSelector((state) => state.events)

  const [venues, setVenues]     = useState<VenueResponseDto[]>([])
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [nextId, setNextId]     = useState(1)
  const [form, setForm]         = useState<EventRequestDto>({
    name: '',
    organizerId: '',
    startDate: '',
    endDate: '',
    venueId: '',
    status: 'draft',
  })

  useEffect(() => {
    venueService.getAll().then(setVenues).catch(console.error)
    const userId = localStorage.getItem('userId') ?? ''
    setForm((prev) => ({ ...prev, organizerId: userId }))
  }, [])

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

  const removeSession = (localId: number) => {
    setSessions((prev) => prev.filter((s) => s.localId !== localId))
  }

  const handleSessionChange = (localId: number, field: keyof Omit<SessionRow, 'localId'>, value: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.localId === localId ? { ...s, [field]: value } : s))
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isEdit && id) {
        const event = await dispatch(updateEvent({ id, payload: form })).unwrap()
        for (const session of sessions) {
          await eventService.createSchedule(event.id, { ...session, eventId: event.id })
        }
      } else {
        const event = await dispatch(createEvent(form)).unwrap()
        for (const session of sessions) {
          await eventService.createSchedule(event.id, { ...session, eventId: event.id })
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

      {/* Sub-nav */}
      <div className={styles.subnav}>
        <div className={styles['subnav-inner']}>
          <NavLink to="/organizer/dashboard"     end className={navLink}>Dashboard</NavLink>
          <NavLink to="/organizer/events/create"     className={navLink}>Create Event</NavLink>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.card}>
          <form onSubmit={handleSubmit}>
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
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <hr className={styles.divider} />

            <div className={styles['sessions-header']}>
              <p className={styles['section-heading']} style={{ margin: 0 }}>Sessions (Optional)</p>
              <button type="button" className={styles['btn-add-session']} onClick={addSession}>
                + Add Session
              </button>
            </div>

            {sessions.map((session) => (
              <div key={session.localId} className={styles['session-row']}>
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
                  <input
                    type="text"
                    placeholder="09:00-10:00"
                    value={session.timeSlot}
                    onChange={(e) => handleSessionChange(session.localId, 'timeSlot', e.target.value)}
                  />
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
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="terminated">Terminated</option>
                  </select>
                </div>
                <button type="button" className={styles['btn-remove']} onClick={() => removeSession(session.localId)}>
                  ✕
                </button>
              </div>
            ))}

            {error && <p className={styles['error-msg']}>{error}</p>}

            <div className={styles['form-footer']}>
              <button type="submit" className={styles['btn-submit']} disabled={loading}>
                {loading ? 'Saving…' : isEdit ? 'Update Event' : 'Create Event'}
              </button>
              <button type="button" className={styles['btn-cancel-form']} onClick={() => navigate('/organizer/dashboard')}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
