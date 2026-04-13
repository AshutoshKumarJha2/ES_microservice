import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchEngagements, fetchFeedback } from '../../../store/slices/analyticsSlice'
import { fetchEventById } from '../../../store/slices/eventsSlice'
import { fetchRegistrationsByEvent } from '../../../store/slices/registrationsSlice'
import styles from '../../../css/engagement/EngagementAnalytics.module.css'

const ORGANIZER_ROLES = ['ORGANIZER', 'ADMIN']

const FILTER_CHIPS = ['All', 'View', 'Register', 'Check In', 'Rate', 'Comment']

const normaliseActivity = (activity: string) => activity.replace(/_/g, ' ').toLowerCase()

const matchesFilter = (activity: string, filter: string): boolean => {
  if (filter === 'All') return true
  const a = normaliseActivity(activity)
  const f = filter.toLowerCase()
  if (f === 'check in') return a === 'check in' || a === 'checkin' || a === 'check_in'
  if (f === 'register') return a === 'register' || a === 'registration'
  return a === f
}

const getDotClass = (activity: string): string => {
  const a = normaliseActivity(activity)
  if (a === 'check in' || a === 'checkin' || a === 'rate') return styles['dot-green']
  if (a === 'view' || a === 'register' || a === 'registration') return styles['dot-blue']
  return styles['dot-default']
}

const formatTime = (ts?: string) => {
  if (!ts) return ''
  // Backend returns LocalDateTime — append 'Z' if no timezone info so the browser parses it correctly
  const iso = ts.includes('Z') || ts.includes('+') ? ts : ts + 'Z'
  return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
}

export const EngagementAnalytics = () => {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { engagements, feedback, loading } = useAppSelector((s) => s.analytics)
  const { selectedEvent } = useAppSelector((s) => s.events)
  const { registrations } = useAppSelector((s) => s.registrations)
  const { user } = useAppSelector((s) => s.auth)

  const isOrganizerOrAdmin = ORGANIZER_ROLES.includes(user?.role ?? '')

  const [activeFilter, setActiveFilter] = useState('All')

  // ── CSV Export ───────────────────────────────────────────────────────────────
  const handleExport = () => {
    const eventName = selectedEvent?.eventName ?? eventId ?? 'event'

    // Engagements sheet
    const engRows = [
      ['Activity', 'Attendee ID', 'Timestamp'],
      ...engagements.map((e) => [
        e.activity,
        e.attendeeId ?? '',
        e.activityTimestamp ?? '',
      ]),
    ]

    // Feedback sheet appended after a blank line
    const fbRows = [
      [],
      ['--- Feedback ---'],
      ['Rating', 'Comment', 'User ID', 'Timestamp'],
      ...feedback.map((f) => [
        String(f.rating ?? ''),
        `"${(f.comments ?? '').replace(/"/g, '""')}"`,
        f.attendeeId ?? '',
        f.createdAt ?? '',
      ]),
    ]

    const csv = [...engRows, ...fbRows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `engagement-${eventName.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    if (!eventId || !isOrganizerOrAdmin) return
    dispatch(fetchEventById(eventId))
    dispatch(fetchEngagements(eventId))
    dispatch(fetchFeedback({ eventId, size: 100 }))
    // Registrations & check-ins: event-manager is source of truth for registration status.
    // Page is organizer/admin only so this endpoint is always authorised here.
    dispatch(fetchRegistrationsByEvent({ eventId, size: 100 }))
  }, [eventId, dispatch, isOrganizerOrAdmin])

  // ── Stat counts ──────────────────────────────────────────────────────────────
  // Registrations & check-ins come from event-manager (source of truth for status).
  // Total engagements & activity feed come from engagement-manager.
  const stats = useMemo(() => {
    const registers = registrations.filter((r) =>
      ['APPROVED', 'CONFIRMED', 'CHECK_IN', 'CHECKED_IN'].includes(r.status?.toUpperCase() ?? '')
    ).length
    const checkins = registrations.filter((r) =>
      ['CHECK_IN', 'CHECKED_IN'].includes(r.status?.toUpperCase() ?? '')
    ).length
    return { registers, checkins }
  }, [registrations])

  const avgRating = useMemo(() => {
    const rated = feedback.filter((f) => f.rating != null && f.rating > 0)
    if (rated.length === 0) return null
    const sum = rated.reduce((acc, f) => acc + (f.rating ?? 0), 0)
    return (sum / rated.length).toFixed(1)
  }, [feedback])

  // ── Activity breakdown table ─────────────────────────────────────────────────
  const activityBreakdown = useMemo(() => {
    const map: Record<string, number> = {}
    for (const eng of engagements) {
      const key = eng.activity.replace(/_/g, ' ')
      map[key] = (map[key] ?? 0) + 1
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [engagements])

  const maxCount = activityBreakdown[0]?.[1] ?? 1

  // ── Rating distribution ──────────────────────────────────────────────────────
  const ratingDist = useMemo(() => {
    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    for (const f of feedback) {
      const r = f.rating ?? 0
      if (r >= 1 && r <= 5) dist[r]++
    }
    return dist
  }, [feedback])

  const totalRatings = Object.values(ratingDist).reduce((a, b) => a + b, 0)

  // ── Recent activity feed (filtered) ─────────────────────────────────────────
  const recentActivity = useMemo(() => {
    return [...engagements]
      .sort((a, b) => (b.activityTimestamp ?? '').localeCompare(a.activityTimestamp ?? ''))
      .filter((e) => matchesFilter(e.activity, activeFilter))
      .slice(0, 10)
  }, [engagements, activeFilter])

  // ── Access guard (after all hooks) ───────────────────────────────────────────
  if (!isOrganizerOrAdmin) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles['access-denied']}>
            <div className={styles['denied-icon']}>🚫</div>
            <h2 className={styles['denied-title']}>Access Denied</h2>
            <p className={styles['denied-msg']}>
              This page is only accessible to event organisers and administrators.
            </p>
            <button
              className={styles['btn-export']}
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Back navigation */}
        <button
          className={styles['back-link']}
          onClick={() => navigate(eventId ? `/organizer/events/${eventId}` : '/organizer/dashboard')}
        >
          ← Event Detail
        </button>

        {/* Page header */}
        <div className={styles['page-header']}>
          <div>
            <h1 className={styles.heading}>Engagement Analytics</h1>
            <p className={styles.subtitle}>Attendee activity tracked by engagement-manager</p>
          </div>
          <div className={styles['header-actions']}>
            <div className={styles['event-select']}>
              {selectedEvent ? selectedEvent.eventName : 'Loading…'} ▾
            </div>
            <button className={styles['btn-export']} onClick={handleExport}>
              Export
            </button>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className={styles['stats-grid']}>
          <div className={`${styles['stat-card']} ${styles['stat-blue']}`}>
            <div className={styles['stat-num']}>{engagements.length}</div>
            <div className={styles['stat-label']}>Total Engagements</div>
          </div>
          <div className={`${styles['stat-card']} ${styles['stat-orange']}`}>
            <div className={styles['stat-num']}>{stats.registers}</div>
            <div className={styles['stat-label']}>Registrations</div>
          </div>
          <div className={`${styles['stat-card']} ${styles['stat-green']}`}>
            <div className={styles['stat-num']}>{stats.checkins}</div>
            <div className={styles['stat-label']}>Check-ins</div>
          </div>
          <div className={`${styles['stat-card']} ${styles['stat-purple']}`}>
            <div className={styles['stat-num']}>
              {avgRating ?? '—'}
              {avgRating && <span className={styles['stat-suffix']}> / 5</span>}
            </div>
            <div className={styles['stat-label']}>Avg. Rating</div>
          </div>
        </div>

        {loading ? (
          <p className={styles.loading}>Loading analytics…</p>
        ) : (
          <>
            {/* ── Two-column: Activity Breakdown + Rating Distribution ── */}
            <div className={styles['two-col']}>

              {/* Activity Breakdown */}
              <div className={styles.card}>
                <h2 className={styles['card-title']}>Activity Breakdown</h2>
                {activityBreakdown.length === 0 ? (
                  <p className={styles.empty}>No engagement data yet.</p>
                ) : (
                  <div className={styles['table-wrapper']}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Activity Type</th>
                          <th>Count</th>
                          <th>Share</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {activityBreakdown.map(([activity, count]) => {
                          const pct = Math.round((count / maxCount) * 100)
                          const share = Math.round((count / engagements.length) * 100)
                          return (
                            <tr key={activity}>
                              <td className={styles['td-activity']}>{activity}</td>
                              <td className={styles['td-count']}>{count.toLocaleString()}</td>
                              <td>
                                <div className={styles['progress-bar']}>
                                  <div
                                    className={styles['progress-fill']}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </td>
                              <td className={styles['td-pct']}>{share}%</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Rating Distribution */}
              <div className={styles.card}>
                <h2 className={styles['card-title']}>Rating Distribution</h2>
                {totalRatings === 0 ? (
                  <p className={styles.empty}>No ratings yet.</p>
                ) : (
                  <div className={styles['rating-dist']}>
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className={styles['rating-row']}>
                        <div className={styles['rating-row-header']}>
                          <span className={styles['rating-label']}>
                            {'★'.repeat(star)}{'☆'.repeat(5 - star)} ({star})
                          </span>
                          <span className={styles['rating-count']}>{ratingDist[star]} reviews</span>
                        </div>
                        <div className={styles['progress-bar']}>
                          <div
                            className={styles['progress-fill']}
                            style={{
                              width: `${totalRatings ? (ratingDist[star] / totalRatings) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Recent Activity Feed ── */}
            <div className={styles.card}>
              <h2 className={styles['card-title']}>Recent Activity Feed</h2>

              {/* Filter chips */}
              <div className={styles['filter-row']}>
                {FILTER_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    className={`${styles['filter-chip']} ${activeFilter === chip ? styles['chip-active'] : ''}`}
                    onClick={() => setActiveFilter(chip)}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Timeline */}
              {recentActivity.length === 0 ? (
                <p className={styles.empty}>No activity found.</p>
              ) : (
                <ul className={styles.timeline}>
                  {recentActivity.map((eng) => (
                    <li key={eng.engagementId ?? `${eng.attendeeId}-${eng.activityTimestamp}`} className={styles['timeline-item']}>
                      <div className={`${styles.dot} ${getDotClass(eng.activity)}`} />
                      <div className={styles['timeline-body']}>
                        <div className={styles['timeline-text']}>
                          <strong>{eng.activity.replace(/_/g, ' ')}</strong>
                          {eng.attendeeId && (
                            <span className={styles['timeline-user']}>
                              {' '}by {eng.attendeeId.slice(0, 8)}…
                            </span>
                          )}
                        </div>
                        <div className={styles['timeline-time']}>{formatTime(eng.activityTimestamp)}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  )
}
