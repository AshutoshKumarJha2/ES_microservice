import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchAllEvents, deleteEvent } from '../../../store/slices/eventsSlice'
import type { EventResponseDto } from '../../../types/events'
import styles from '../../../css/events/OrganizerDashboard.module.css'

const statusBadgeClass = (status: string) => {
  const map: Record<string, string> = {
    draft: styles['badge-draft'],
    published: styles['badge-published'],
    completed: styles['badge-completed'],
    cancelled: styles['badge-cancelled'],
  }
  return `${styles.badge} ${map[status] ?? styles['badge-draft']}`
}

export const OrganizerDashboard = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { events, loading } = useAppSelector((state) => state.events)

  useEffect(() => {
    dispatch(fetchAllEvents())
  }, [dispatch])

  const activeEvents = events.filter((e) => e.status === 'published').length
  const pendingApprovals = events.filter((e) => e.status === 'draft').length

  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this event?')) return
    dispatch(deleteEvent(id))
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <p className={styles.logo}>
            <span className={styles.event}>Event</span>
            <span className={styles.sphere}>Sphere</span>
          </p>
          <h1 className={styles.heading}>Organizer Portal</h1>
          <p className={styles.sub}>Manage your events, tickets, registrations and budget</p>
        </div>
        <button className={styles['btn-create']} onClick={() => navigate('/organizer/events/create')}>
          + New Event
        </button>
      </div>

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
          <div className={styles['stat-value']}>{events.filter((e) => e.status === 'completed').length}</div>
        </div>
        <div className={`${styles['stat-card']} ${styles.amber}`}>
          <div className={styles['stat-label']}>Pending Approvals</div>
          <div className={styles['stat-value']}>{pendingApprovals}</div>
        </div>
      </div>

      {/* Events Table */}
      <div className={styles.section}>
        <h2 className={styles['section-title']}>My Events</h2>

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
                    <td style={{ fontWeight: 600 }}>{event.eventName}</td>
                    <td>{event.startAt}</td>
                    <td>{event.endAt}</td>
                    <td>
                      <span className={statusBadgeClass(event.status)}>{event.status}</span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={`${styles['btn-action']} ${styles['btn-view']}`}
                          onClick={() => navigate(`/organizer/events/${event.id}`)}
                        >
                          View
                        </button>
                        <button
                          className={`${styles['btn-action']} ${styles['btn-edit']}`}
                          onClick={() => navigate(`/organizer/events/${event.id}/edit`)}
                        >
                          Edit
                        </button>
                        <button
                          className={`${styles['btn-action']} ${styles['btn-analytics']}`}
                          onClick={() => navigate(`/organizer/analytics/${event.id}`)}
                        >
                          Analytics
                        </button>
                        <button
                          className={styles['btn-action']}
                          style={{ background: '#fff1f2', color: '#be123c' }}
                          onClick={() => handleDelete(event.id)}
                        >
                          Delete
                        </button>
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
  )
}
