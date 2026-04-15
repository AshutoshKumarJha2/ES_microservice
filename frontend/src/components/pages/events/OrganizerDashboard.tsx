import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchAllEvents, deleteEvent, createEvent, updateEvent } from '../../../store/slices/eventsSlice'
import { venueService } from '../../../services/events/venueService'
import type { EventResponseDto, EventRequestDto, VenueResponseDto } from '../../../types/events'
import { EventStatusBadge } from '../../elements/events/EventStatusBadge'
import styles from '../../../css/events/EventsPanel.module.css'

const EMPTY_FORM: EventRequestDto = {
  name:        '',
  organizerId: '',
  startDate:   '',
  endDate:     '',
  venueId:     '',
  status:      'DRAFT',
}

export const OrganizerDashboard = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { events, loading } = useAppSelector((state) => state.events)
  const userId = useAppSelector((state) => state.auth.user?.userId ?? '')

  const [venues, setVenues]     = useState<VenueResponseDto[]>([])
  const [editId, setEditId]     = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]         = useState<EventRequestDto>({ ...EMPTY_FORM })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError]   = useState<string | null>(null)

  useEffect(() => { dispatch(fetchAllEvents()) }, [dispatch])
  useEffect(() => { venueService.getAll().then(setVenues).catch(console.error) }, [])

  const activeEvents    = events.filter((e) => e.status === 'PUBLISHED').length
  const completedEvents = events.filter((e) => e.status === 'COMPLETED').length
  const pendingEvents   = events.filter((e) => e.status === 'DRAFT').length

  const openCreate = () => {
    setEditId(null)
    setForm({ ...EMPTY_FORM, organizerId: userId })
    setFormError(null)
    setShowModal(true)
  }

  const openEdit = (event: EventResponseDto) => {
    setEditId(event.id)
    setForm({
      name:        event.eventName,
      organizerId: event.organizerId,
      startDate:   event.startAt,
      endDate:     event.endAt,
      venueId:     event.venueId ?? '',
      status:      event.status,
    })
    setFormError(null)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setFormError(null)
  }

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
    <div className={styles.page}>
      {/* Banner */}
      <div className={styles.banner}>
        <div className={styles['banner-inner']}>
          <div className={styles['banner-text']}>
            <h1>Organizer Portal</h1>
            <p>Manage your events, tickets, registrations and budget</p>
          </div>
          <div className={styles['banner-actions']}>
            <button className={styles['btn-primary']} onClick={openCreate}>+ New Event</button>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {/* Stat Cards */}
        <div className={styles['stats-grid']}>
          <div className={`${styles['stat-card']} ${styles.blue}`}>
            <div className={styles['stat-label']}>Active Events</div>
            <div className={styles['stat-value']}>{activeEvents}</div>
          </div>
          <div className={`${styles['stat-card']} ${styles.orange}`}>
            <div className={styles['stat-label']}>Total Events</div>
            <div className={styles['stat-value']}>{events.length}</div>
          </div>
          <div className={`${styles['stat-card']} ${styles.green}`}>
            <div className={styles['stat-label']}>Completed</div>
            <div className={styles['stat-value']}>{completedEvents}</div>
          </div>
          <div className={`${styles['stat-card']} ${styles.amber}`}>
            <div className={styles['stat-label']}>Drafts</div>
            <div className={styles['stat-value']}>{pendingEvents}</div>
          </div>
        </div>

        {/* Events Table */}
        <div className={styles.card}>
          <div className={styles['card-title']}>
            My Events
            <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-muted)' }}>
              {events.length} total
            </span>
          </div>

          {loading ? (
            <p className={styles.loading}>Loading events…</p>
          ) : events.length === 0 ? (
            <p className={styles.empty}>No events found. Create your first event!</p>
          ) : (
            <div className={styles['table-wrapper']}>
              <table>
                <thead>
                  <tr>
                    <th>Event Name</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event: EventResponseDto) => (
                    <tr key={event.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/organizer/events/${event.id}`)}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{event.eventName}</td>
                      <td>{event.startAt}</td>
                      <td>{event.endAt}</td>
                      <td>
                        <EventStatusBadge status={event.status?.toLowerCase()} variant="event" />
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className={styles.actions}>
                          <button className={styles['btn-sm']} onClick={() => openEdit(event)}>Edit</button>
                          <button className={styles['btn-danger']} onClick={() => handleDelete(event.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className={styles['modal-backdrop']} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles['modal-title']}>{editId ? 'Edit Event' : 'Create New Event'}</div>
            <form onSubmit={handleSubmit}>
              <div className={styles['modal-field']}>
                <label className={styles['modal-label']}>Event Name *</label>
                <input
                  className={styles['modal-input']}
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter event name"
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className={styles['modal-field']}>
                  <label className={styles['modal-label']}>Start Date *</label>
                  <input
                    className={styles['modal-input']}
                    name="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className={styles['modal-field']}>
                  <label className={styles['modal-label']}>End Date *</label>
                  <input
                    className={styles['modal-input']}
                    name="endDate"
                    type="date"
                    value={form.endDate}
                    min={form.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className={styles['modal-field']}>
                <label className={styles['modal-label']}>Venue</label>
                <select className={styles['modal-select']} name="venueId" value={form.venueId} onChange={handleChange}>
                  <option value="">Select a venue</option>
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} — {v.location} (cap: {v.capacity})
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles['modal-field']}>
                <label className={styles['modal-label']}>Status</label>
                <select className={styles['modal-select']} name="status" value={form.status} onChange={handleChange}>
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              {formError && <p className={styles['error-msg']}>{formError}</p>}
              <div className={styles['modal-footer']}>
                <button type="submit" className={styles['modal-btn-primary']} disabled={submitting}>
                  {submitting ? 'Saving…' : editId ? 'Update Event' : 'Create Event'}
                </button>
                <button type="button" className={styles['modal-btn-cancel']} onClick={closeModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
