import { useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchEngagements, fetchFeedback } from '../../../store/slices/analyticsSlice'
import { fetchEventById } from '../../../store/slices/eventsSlice'
import styles from '../../../css/events/Analytics.module.css'

export const Analytics = () => {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { engagements, feedback, loading } = useAppSelector((s) => s.analytics)
  const { selectedEvent } = useAppSelector((s) => s.events)

  useEffect(() => {
    if (!eventId) return
    dispatch(fetchEventById(eventId))
    dispatch(fetchEngagements(eventId))
    dispatch(fetchFeedback({ eventId }))
  }, [eventId, dispatch])

  const activityBreakdown = useMemo(() => {
    const map: Record<string, number> = {}
    for (const eng of engagements) {
      map[eng.activity] = (map[eng.activity] ?? 0) + 1
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10)
  }, [engagements])

  const ratingDist = useMemo(() => {
    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    for (const f of feedback) {
      const r = f.rating ?? 0
      if (r >= 1 && r <= 5) dist[r]++
    }
    return dist
  }, [feedback])

  const totalRatings = Object.values(ratingDist).reduce((a, b) => a + b, 0)

  const avgRating =
    totalRatings > 0
      ? (
          Object.entries(ratingDist).reduce((sum, [star, count]) => sum + Number(star) * count, 0) /
          totalRatings
        ).toFixed(1)
      : '—'

  const recentActivity = useMemo(
    () => [...engagements].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? '')).slice(0, 8),
    [engagements]
  )

  const formatTime = (iso?: string) => {
    if (!iso) return ''
    return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  }

  return (
    <div className={styles.page}>
      <button
        className={styles['back-btn']}
        onClick={() => navigate(eventId ? `/organizer/events/${eventId}` : '/organizer/dashboard')}
      >
        ← Back
      </button>

      <h1 className={styles.heading}>
        Engagement Analytics
        {selectedEvent && (
          <span style={{ fontWeight: 400, color: '#64748b', fontSize: '1rem', marginLeft: '0.75rem' }}>
            — {selectedEvent.eventName}
          </span>
        )}
      </h1>
      <p className={styles.sub}>Engagement metrics, feedback ratings, and recent activity for this event.</p>

      <div className={styles['stats-grid']}>
        <div className={`${styles['stat-card']} ${styles.blue}`}>
          <div className={styles['stat-label']}>Total Engagements</div>
          <div className={styles['stat-value']}>{engagements.length}</div>
        </div>
        <div className={`${styles['stat-card']} ${styles.orange}`}>
          <div className={styles['stat-label']}>Unique Activities</div>
          <div className={styles['stat-value']}>{activityBreakdown.length}</div>
        </div>
        <div className={`${styles['stat-card']} ${styles.green}`}>
          <div className={styles['stat-label']}>Feedback Responses</div>
          <div className={styles['stat-value']}>{feedback.length}</div>
        </div>
        <div className={`${styles['stat-card']} ${styles.purple}`}>
          <div className={styles['stat-label']}>Avg. Rating</div>
          <div className={styles['stat-value']}>{avgRating}</div>
        </div>
      </div>

      {loading ? (
        <p className={styles.loading}>Loading analytics…</p>
      ) : (
        <>
          <div className={styles['grid-2']}>
            <div className={styles.panel}>
              <h3 className={styles['panel-title']}>Activity Breakdown</h3>
              {activityBreakdown.length === 0 ? (
                <p className={styles.empty}>No engagement data yet.</p>
              ) : (
                <div className={styles['table-wrapper']}>
                  <table>
                    <thead>
                      <tr>
                        <th>Activity</th>
                        <th>Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activityBreakdown.map(([activity, count]) => (
                        <tr key={activity}>
                          <td style={{ fontWeight: 500 }}>{activity.replace(/_/g, ' ')}</td>
                          <td style={{ fontWeight: 700, color: '#1d4ed8' }}>{count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className={styles.panel}>
              <h3 className={styles['panel-title']}>Rating Distribution</h3>
              {totalRatings === 0 ? (
                <p className={styles.empty}>No ratings submitted yet.</p>
              ) : (
                [5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className={styles['rating-row']}>
                    <span className={styles['rating-label']}>{star} ★</span>
                    <div className={styles['rating-bar-bg']}>
                      <div
                        className={styles['rating-bar-fill']}
                        style={{ width: `${totalRatings ? (ratingDist[star] / totalRatings) * 100 : 0}%` }}
                      />
                    </div>
                    <span className={styles['rating-count']}>{ratingDist[star]}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={styles.panel}>
            <h3 className={styles['panel-title']}>Recent Activity</h3>
            {recentActivity.length === 0 ? (
              <p className={styles.empty}>No recent activity.</p>
            ) : (
              recentActivity.map((eng) => (
                <div key={eng.engagementId ?? eng.createdAt} className={styles['activity-item']}>
                  <div className={styles['activity-dot']} />
                  <div>
                    <div className={styles['activity-text']}>
                      <strong>{eng.activity.replace(/_/g, ' ')}</strong>
                      {eng.userId && (
                        <span style={{ color: '#94a3b8', marginLeft: '0.4rem' }}>by {eng.userId.slice(0, 8)}…</span>
                      )}
                    </div>
                    <div className={styles['activity-time']}>{formatTime(eng.createdAt)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
