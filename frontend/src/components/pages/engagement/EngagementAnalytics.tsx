import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchEngagements, fetchFeedback, fetchEventSummary, fetchSchedules } from '../../../store/slices/analyticsSlice'
import { fetchEventById } from '../../../store/slices/eventsSlice'
import styles from '../../../css/engagement/EngagementAnalytics.module.css'
import { BlockSkeleton } from '../../elements/skeletons/PageSkeleton'

const ORGANIZER_ROLES = ['ORGANIZER', 'ADMIN']

const FILTER_CHIPS = ['All', 'Register', 'Check In', 'Session Join', 'Feedback']

const normaliseActivity = (activity: string) => activity.replace(/_/g, ' ').toLowerCase()

const matchesFilter = (activity: string, filter: string): boolean => {
  if (filter === 'All') return true
  const a = normaliseActivity(activity)
  const f = filter.toLowerCase()
  if (f === 'check in')    return a === 'check in' || a === 'check_in'
  if (f === 'register')    return a === 'registration' || a === 'registration confirmation'
  if (f === 'session join') return a === 'session join'
  if (f === 'feedback')    return a === 'event feedback submit'
  return a === f
}

const getDotClass = (activity: string): string => {
  const a = normaliseActivity(activity)
  if (a === 'check in' || a === 'check_in')          return styles['dot-green']
  if (a === 'registration' || a === 'registration confirmation') return styles['dot-blue']
  if (a === 'session join')                           return styles['dot-purple']
  if (a === 'event feedback submit')                  return styles['dot-orange']
  return styles['dot-default']
}

const formatTime = (ts?: string | number[]) => {
  if (!ts) return ''
  let date: Date
  // Backend may return LocalDateTime as array [y,m,d,h,min,s] or ISO string
  if (Array.isArray(ts)) {
    const [y, mo, d, h = 0, mi = 0, s = 0] = ts as number[]
    date = new Date(y, mo - 1, d, h, mi, s)   // month is 0-indexed in JS
  } else {
    // ISO string "2026-04-25T17:30:00" — replace 'T' separator but no Z (server is local time)
    date = new Date((ts as string).replace('T', ' '))
  }
  if (isNaN(date.getTime())) return ts as string
  return date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
}

const formatSessionDateTime = (date: string, timeSlot: string) => {
  try {
    const d = new Date(date)
    const dateStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    return `${dateStr} · ${timeSlot}`
  } catch {
    return `${date} · ${timeSlot}`
  }
}

const getStatusBadgeClass = (status: string): string => {
  const s = status?.toUpperCase()
  if (s === 'ACTIVE') return styles['badge-active']
  if (s === 'COMPLETED') return styles['badge-completed']
  if (s === 'TERMINATED') return styles['badge-terminated']
  return styles['badge-draft']
}

export const EngagementAnalytics = () => {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { engagements, feedback, loading, eventSummary, schedules, schedulesLoading } =
    useAppSelector((s) => s.analytics)
  const { selectedEvent } = useAppSelector((s) => s.events)
  const { user } = useAppSelector((s) => s.auth)

  const isOrganizerOrAdmin = ORGANIZER_ROLES.includes(user?.role ?? '')

  const [activeFilter, setActiveFilter] = useState('All')
  const [feedbackPage, setFeedbackPage] = useState(0)
  const FEEDBACK_PAGE_SIZE = 3

  // ── CSV Export ───────────────────────────────────────────────────────────────
  const handleExport = () => {
    const eventName = selectedEvent?.eventName ?? eventId ?? 'event'

    const engRows = [
      ['Activity', 'Attendee ID', 'Schedule ID', 'Timestamp'],
      ...engagements.map((e) => [
        e.activity,
        e.attendeeId ?? '',
        e.scheduleId ?? '',
        e.activityTimestamp ?? '',
      ]),
    ]

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
    dispatch(fetchEventSummary(eventId))
    dispatch(fetchSchedules(eventId))
  }, [eventId, dispatch, isOrganizerOrAdmin])

  // ── Stat counts ──────────────────────────────────────────────────────────────
  // Registration + check-in counts come from event-manager analytics (source of truth).
  const totalRegistrations = eventSummary?.totalRegistrations ?? 0
  const totalCheckedIn = eventSummary?.checkedIn ?? 0

  const avgRating = useMemo(() => {
    const rated = feedback.filter((f) => f.rating != null && f.rating > 0)
    if (rated.length === 0) return null
    const sum = rated.reduce((acc, f) => acc + (f.rating ?? 0), 0)
    return (sum / rated.length).toFixed(1)
  }, [feedback])

  // ── Registration funnel ─────────────────────────────────────────────────────
  const funnelStages = useMemo(() => {
    const total = eventSummary?.totalRegistrations ?? 0
    const confirmed = eventSummary?.confirmed ?? 0
    const checkedIn = eventSummary?.checkedIn ?? 0
    const pct = (n: number) => total > 0 ? Math.round((n / total) * 100) : 0
    return [
      { label: 'Registered',  count: total,     pct: 100,        color: '#3366FF' },
      { label: 'Confirmed',   count: confirmed,  pct: pct(confirmed),  color: '#16A34A' },
      { label: 'Checked In',  count: checkedIn,  pct: pct(checkedIn),  color: '#F47920' },
    ]
  }, [eventSummary])

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

  // ── Session-wise attendance ──────────────────────────────────────────────────
  // Count SESSION_JOIN engagements per scheduleId from the already-loaded engagements array.
  const sessionJoinMap = useMemo(() => {
    const map: Record<string, number> = {}
    for (const eng of engagements) {
      if (eng.scheduleId && eng.activity === 'SESSION_JOIN') {
        map[eng.scheduleId] = (map[eng.scheduleId] ?? 0) + 1
      }
    }
    return map
  }, [engagements])

  const sessionSummary = useMemo(() => {
    const totalSessions = schedules.length
    const totalSessionCheckIns = Object.values(sessionJoinMap).reduce((a, b) => a + b, 0)
    const avgAttendanceRate =
      totalRegistrations > 0 && totalSessions > 0
        ? Math.round((totalSessionCheckIns / (totalSessions * totalRegistrations)) * 100)
        : 0
    return { totalSessions, totalSessionCheckIns, avgAttendanceRate }
  }, [schedules, sessionJoinMap, totalRegistrations])

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
            <div className={styles['stat-num']}>{totalRegistrations}</div>
            <div className={styles['stat-label']}>Registrations</div>
          </div>
          <div className={`${styles['stat-card']} ${styles['stat-green']}`}>
            <div className={styles['stat-num']}>{totalCheckedIn}</div>
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
          <BlockSkeleton rows={8} />
        ) : (
          <>
            {/* ── Two-column: Registration Funnel + Rating Distribution ── */}
            <div className={styles['two-col']}>

              {/* Registration Funnel */}
              <div className={styles.card}>
                <h2 className={styles['card-title']}>Registration Funnel</h2>
                {(eventSummary?.totalRegistrations ?? 0) === 0 ? (
                  <p className={styles.empty}>No registration data yet.</p>
                ) : (
                  <div className={styles['funnel-wrap']}>
                    {funnelStages.map((stage, i) => (
                      <div key={stage.label} className={styles['funnel-stage']}>
                        <div className={styles['funnel-row']}>
                          <span className={styles['funnel-label']}>{stage.label}</span>
                          <span className={styles['funnel-count']} style={{ color: stage.color }}>
                            {stage.count.toLocaleString()}
                          </span>
                          <span className={styles['funnel-pct']}>{stage.pct}%</span>
                        </div>
                        <div className={styles['funnel-bar-bg']}>
                          <div
                            className={styles['funnel-bar-fill']}
                            style={{ width: `${stage.pct}%`, background: stage.color }}
                          />
                        </div>
                        {i < funnelStages.length - 1 && (
                          <div className={styles['funnel-drop']}>
                            ↓ {funnelStages[i + 1].pct}% progressed to {funnelStages[i + 1].label.toLowerCase()}
                          </div>
                        )}
                      </div>
                    ))}
                    <div className={styles['funnel-footer']}>
                      <span className={styles['funnel-tag-pending']}>
                        {eventSummary?.pending ?? 0} pending
                      </span>
                      <span className={styles['funnel-tag-cancelled']}>
                        {eventSummary?.cancelled ?? 0} cancelled
                      </span>
                    </div>
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
                            style={{ width: `${totalRatings ? (ratingDist[star] / totalRatings) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Attendee Comments ── */}
            {(() => {
              const commented = feedback.filter((f) => f.comments?.trim())
              if (commented.length === 0) return null
              const totalPages = Math.ceil(commented.length / FEEDBACK_PAGE_SIZE)
              const paginated = commented.slice(
                feedbackPage * FEEDBACK_PAGE_SIZE,
                feedbackPage * FEEDBACK_PAGE_SIZE + FEEDBACK_PAGE_SIZE
              )
              return (
                <div className={styles.card}>
                  <div className={styles['feedback-card-header']}>
                    <h2 className={styles['card-title']}>Attendee Comments</h2>
                    <div className={styles['feedback-nav']}>
                      <button
                        className={styles['nav-btn']}
                        onClick={() => setFeedbackPage((p) => p - 1)}
                        disabled={feedbackPage === 0}
                        aria-label="Previous"
                      >‹</button>
                      <span className={styles['nav-indicator']}>
                        {feedbackPage + 1} / {totalPages}
                      </span>
                      <button
                        className={styles['nav-btn']}
                        onClick={() => setFeedbackPage((p) => p + 1)}
                        disabled={feedbackPage >= totalPages - 1}
                        aria-label="Next"
                      >›</button>
                    </div>
                  </div>
                  <div className={styles['feedback-list']}>
                    {paginated.map((f, i) => (
                      <div key={f.feedbackId ?? i} className={styles['feedback-item']}>
                        <div className={styles['feedback-header']}>
                          <div className={styles['feedback-stars']}>
                            {[1, 2, 3, 4, 5].map((s) => (
                              <span key={s} className={s <= (f.rating ?? 0) ? styles['star-filled'] : styles['star-empty']}>
                                {s <= (f.rating ?? 0) ? '★' : '☆'}
                              </span>
                            ))}
                            <span className={styles['feedback-rating-num']}>{f.rating ?? '—'}/5</span>
                          </div>
                          <div className={styles['feedback-meta']}>
                            <span className={styles['feedback-attendee']}>
                              Attendee #{(f.attendeeId ?? '').slice(-4).toUpperCase()}
                            </span>
                            {f.createdAt && (
                              <span className={styles['feedback-date']}>{formatTime(f.createdAt)}</span>
                            )}
                          </div>
                        </div>
                        <p className={styles['feedback-comment']}>{f.comments}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}

            {/* ── Session-wise Attendance ── */}
            <div className={styles.card}>
              <h2 className={styles['card-title']}>Session-wise Attendance</h2>

              {/* Summary strip */}
              <div className={styles['session-summary-strip']}>
                <div className={styles['session-summary-item']}>
                  <span className={styles['session-summary-num']}>{sessionSummary.totalSessions}</span>
                  <span className={styles['session-summary-label']}>Total Sessions</span>
                </div>
                <div className={styles['session-summary-divider']} />
                <div className={styles['session-summary-item']}>
                  <span className={styles['session-summary-num']}>{sessionSummary.totalSessionCheckIns}</span>
                  <span className={styles['session-summary-label']}>Total Session Check-ins</span>
                </div>
                <div className={styles['session-summary-divider']} />
                <div className={styles['session-summary-item']}>
                  <span className={styles['session-summary-num']}>{sessionSummary.avgAttendanceRate}%</span>
                  <span className={styles['session-summary-label']}>Avg Attendance Rate</span>
                </div>
              </div>

              {schedulesLoading ? (
                <p className={styles.empty}>Loading sessions…</p>
              ) : schedules.length === 0 ? (
                <p className={styles.empty}>No sessions scheduled for this event.</p>
              ) : (
                <div className={styles['table-wrapper']}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Session</th>
                        <th>Date &amp; Time</th>
                        <th>Total Registered</th>
                        <th>Checked In</th>
                        <th>Attendance</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedules.map((schedule) => {
                        const checkedIn = sessionJoinMap[schedule.scheduleId] ?? 0
                        const registered = totalRegistrations
                        const pct = registered > 0 ? Math.round((checkedIn / registered) * 100) : 0
                        return (
                          <tr key={schedule.scheduleId}>
                            <td className={styles['td-activity']}>{schedule.activity}</td>
                            <td className={styles['td-datetime']}>
                              {formatSessionDateTime(schedule.date, schedule.timeSlot)}
                            </td>
                            <td className={styles['td-count']}>{registered}</td>
                            <td className={styles['td-count']}>{checkedIn}</td>
                            <td>
                              <div className={styles['session-progress-wrap']}>
                                <div className={styles['progress-bar']}>
                                  <div
                                    className={styles['progress-fill']}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className={styles['td-pct']}>{pct}%</span>
                              </div>
                            </td>
                            <td>
                              <span className={`${styles.badge} ${getStatusBadgeClass(schedule.status)}`}>
                                {schedule.status}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
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
                              {' '}by Attendee #{eng.attendeeId.slice(-4).toUpperCase()}
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
