import { useEffect } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchAllEvents, deleteEvent } from '../../../store/slices/eventsSlice'
import type { EventResponseDto } from '../../../types/events'
import styles from '../../../css/events/EventsPanel.module.css'

const STATUS_BADGE: Record<string, string> = {
  DRAFT:     styles['badge-draft'],
  PUBLISHED: styles['badge-published'],
  COMPLETED: styles['badge-completed'],
  CANCELLED: styles['badge-cancelled'],
}

const navLink = ({ isActive }: { isActive: boolean }) =>
  `${styles['subnav-link']}${isActive ? ` ${styles.active}` : ''}`

export const OrganizerDashboard = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { events, loading } = useAppSelector((state) => state.events)

  useEffect(() => {
    dispatch(fetchAllEvents())
  }, [dispatch])

  const activeEvents    = events.filter((e) => e.status === 'PUBLISHED').length
  const completedEvents = events.filter((e) => e.status === 'COMPLETED').length
  const pendingEvents   = events.filter((e) => e.status === 'DRAFT').length

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
            <button className={styles['btn-primary']} onClick={() => navigate('/organizer/events/create')}>
              + New Event
            </button>
          </div>
        </div>
      </div>

      {/* Sub-nav */}
      <div className={styles.subnav}>
        <div className={styles['subnav-inner']}>
          <NavLink to="/organizer/dashboard"      end className={navLink}>Dashboard</NavLink>
          <NavLink to="/organizer/events/create"  className={navLink}>Create Event</NavLink>
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
                    <tr key={event.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{event.eventName}</td>
                      <td>{event.startAt}</td>
                      <td>{event.endAt}</td>
                      <td>
                        <span className={`${styles.badge} ${STATUS_BADGE[event.status] ?? styles['badge-draft']}`}>
                          {event.status}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button className={styles['btn-sm']}     onClick={() => navigate(`/organizer/events/${event.id}`)}>View</button>
                          <button className={styles['btn-outline']} onClick={() => navigate(`/organizer/events/${event.id}/edit`)}>Edit</button>
                          <button className={styles['btn-success']} onClick={() => navigate(`/organizer/analytics/${event.id}`)}>Analytics</button>
                          <button className={styles['btn-danger']}  onClick={() => handleDelete(event.id)}>Delete</button>
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
    </div>
  )
}
