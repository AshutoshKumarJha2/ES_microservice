import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
  fetchFeedback,
  submitFeedback,
  clearSubmitState,
  fetchMyRegistration,
} from '../../../store/slices/analyticsSlice'
import { fetchEventById } from '../../../store/slices/eventsSlice'
import styles from '../../../css/engagement/SubmitFeedback.module.css'

// Statuses that allow feedback submission
const ALLOWED_STATUSES = ['CHECK_IN', 'CHECKED_IN', 'APPROVED', 'CONFIRMED']

const isAllowedStatus = (status?: string) =>
  status ? ALLOWED_STATUSES.includes(status.toUpperCase()) : false

export const SubmitFeedback = () => {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { feedback, submitLoading, submitSuccess, submitError, myRegistration, myRegistrationLoading } =
    useAppSelector((s) => s.analytics)
  const { selectedEvent } = useAppSelector((s) => s.events)
  const { user } = useAppSelector((s) => s.auth)

  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')

  useEffect(() => {
    if (!eventId) return
    dispatch(fetchEventById(eventId))
    dispatch(fetchFeedback({ eventId, size: 100 }))
    if (user?.role === 'ATTENDEE') {
      dispatch(fetchMyRegistration(eventId))
    }
    return () => {
      dispatch(clearSubmitState())
    }
  }, [eventId, dispatch, user?.role])

  // ── Check if user already submitted feedback ──────────────────────────────
  const alreadySubmitted = useMemo(() => {
    if (!user?.userId) return false
    return feedback.some((f) => f.attendeeId === user.userId)
  }, [feedback, user?.userId])

  const avgRating = useMemo(() => {
    const rated = feedback.filter((f) => f.rating != null && f.rating > 0)
    if (rated.length === 0) return null
    const sum = rated.reduce((acc, f) => acc + (f.rating ?? 0), 0)
    return (sum / rated.length).toFixed(1)
  }, [feedback])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventId || rating === 0) return
    const attendeeId = user?.userId ?? ''
    const createdAt = new Date().toISOString().slice(0, 19)
    await dispatch(submitFeedback({ eventId, attendeeId, rating, comments: comment, createdAt }))
    dispatch(fetchFeedback({ eventId, size: 100 }))
  }

  const displayStar = hoverRating || rating

  // ── Access checks ──────────────────────────────────────────────────────────

  // Not an attendee
  if (user && user.role !== 'ATTENDEE') {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <button className={styles['back-link']} onClick={() => navigate(-1)}>← Go Back</button>
          <div className={`${styles.card} ${styles['access-denied']}`}>
            <div className={styles['denied-icon']}>⚠</div>
            <h3 className={styles['denied-title']}>Access Denied</h3>
            <p className={styles['denied-msg']}>
              Only registered attendees can submit feedback for this event.
              Your current role ({user.role.replace('_', ' ')}) does not have permission to give feedback.
            </p>
            <button className={styles['btn-cancel']} onClick={() => navigate(-1)}>Go Back</button>
          </div>
        </div>
      </div>
    )
  }

  // Still checking registration
  if (user?.role === 'ATTENDEE' && myRegistrationLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <p className={styles.loading}>Checking your registration…</p>
        </div>
      </div>
    )
  }

  // Not registered or wrong status
  if (user?.role === 'ATTENDEE' && !myRegistrationLoading && !isAllowedStatus(myRegistration?.status)) {
    const reason = !myRegistration
      ? 'You are not registered for this event.'
      : `Your registration status is "${myRegistration.status}". Only attendees with an Approved or Checked-In registration can submit feedback.`

    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <button className={styles['back-link']} onClick={() => navigate(-1)}>← My Registrations</button>
          <div className={`${styles.card} ${styles['access-denied']}`}>
            <div className={styles['denied-icon']}>⚠</div>
            <h3 className={styles['denied-title']}>Not Eligible to Submit Feedback</h3>
            <p className={styles['denied-msg']}>{reason}</p>
            <button className={styles['btn-cancel']} onClick={() => navigate(-1)}>Go Back</button>
          </div>
        </div>
      </div>
    )
  }

  // ── Main page ──────────────────────────────────────────────────────────────

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Back navigation */}
        <button className={styles['back-link']} onClick={() => navigate(-1)}>
          ← My Registrations
        </button>

        {/* Page header */}
        <div className={styles['page-header']}>
          <div>
            <h1 className={styles.heading}>Submit Feedback</h1>
            <p className={styles.subtitle}>
              {selectedEvent ? selectedEvent.eventName : eventId ?? 'Loading event…'}
            </p>
          </div>
        </div>

        {/* ── Feedback form card ── */}
        <div className={styles.card}>

          {/* Already submitted */}
          {alreadySubmitted && !submitSuccess ? (
            <div className={styles['already-submitted']}>
              <div className={styles['already-icon']}>✓</div>
              <h3 className={styles['already-title']}>Feedback Already Submitted</h3>
              <p className={styles['already-msg']}>
                You have already submitted feedback for this event. Only one feedback per attendee is allowed.
              </p>
              <button className={styles['btn-cancel']} onClick={() => navigate(-1)}>
                Go Back
              </button>
            </div>

          ) : submitSuccess ? (
            <div className={styles.success}>
              <div className={styles['success-icon']}>✓</div>
              <h3>Feedback Submitted!</h3>
              <p>Thank you for your feedback. Your response has been recorded.</p>
              <div className={styles['btn-group']}>
                <button className={styles['btn-cancel']} onClick={() => navigate(-1)}>
                  Go Back
                </button>
              </div>
            </div>

          ) : (
            <form onSubmit={handleSubmit}>

              {/* Overall Rating */}
              <div className={styles['form-group']}>
                <label className={styles.label}>Overall Rating</label>
                <div className={styles['stars-row']}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`${styles.star} ${
                        star <= displayStar ? styles['star-filled'] : styles['star-empty']
                      }`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      ★
                    </span>
                  ))}
                  {displayStar > 0 && (
                    <span className={styles['rating-text']}>{displayStar} / 5</span>
                  )}
                </div>
              </div>

              {/* Comment */}
              <div className={styles['form-group']}>
                <label className={styles.label}>Comment</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Share your experience about this event..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                />
              </div>

              {submitError && <p className={styles['error-msg']}>{submitError}</p>}

              <div className={styles['btn-group']}>
                <button
                  type="submit"
                  className={styles['btn-primary']}
                  disabled={submitLoading || rating === 0}
                >
                  {submitLoading ? 'Submitting…' : 'Submit Feedback'}
                </button>
                <button
                  type="button"
                  className={styles['btn-cancel']}
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </button>
              </div>

            </form>
          )}
        </div>

        {/* ── Event Feedback Summary card ── */}
        <div className={styles.card}>
          <h2 className={styles['card-title']}>Event Feedback Summary</h2>

          <div className={styles['summary-row']}>
            <span>Average Rating</span>
            <strong>{avgRating ? `${avgRating} / 5` : '— / 5'}</strong>
          </div>

          <div className={styles['progress-bar']}>
            <div
              className={styles['progress-fill']}
              style={{ width: avgRating ? `${(parseFloat(avgRating) / 5) * 100}%` : '0%' }}
            />
          </div>

          <div className={styles['review-count']}>
            {feedback.length > 0
              ? `Based on ${feedback.length} review${feedback.length !== 1 ? 's' : ''}`
              : 'No reviews yet'}
          </div>
        </div>

      </div>
    </div>
  )
}
