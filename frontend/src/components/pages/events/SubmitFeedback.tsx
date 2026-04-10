import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
  fetchFeedback,
  submitFeedback,
  clearSubmitState,
} from '../../../store/slices/analyticsSlice'
import { fetchEventById } from '../../../store/slices/eventsSlice'
import styles from '../../../css/events/SubmitFeedback.module.css'

export const SubmitFeedback = () => {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { feedback, submitLoading, submitSuccess, submitError } = useAppSelector(
    (s) => s.analytics
  )
  const { selectedEvent } = useAppSelector((s) => s.events)
  const { user } = useAppSelector((s) => s.auth)

  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')

  useEffect(() => {
    if (!eventId) return
    dispatch(fetchEventById(eventId))
    dispatch(fetchFeedback({ eventId, size: 100 }))
    return () => {
      dispatch(clearSubmitState())
    }
  }, [eventId, dispatch])

  const avgRating = useMemo(() => {
    const rated = feedback.filter((f) => f.rating != null && f.rating > 0)
    if (rated.length === 0) return null
    const sum = rated.reduce((acc, f) => acc + (f.rating ?? 0), 0)
    return (sum / rated.length).toFixed(1)
  }, [feedback])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventId || rating === 0) return
    const userId = user?.userId ?? ''
    await dispatch(submitFeedback({ eventId, userId, rating, comment }))
    dispatch(fetchFeedback({ eventId, size: 100 }))
  }

  const handleSubmitAnother = () => {
    dispatch(clearSubmitState())
    setRating(0)
    setHoverRating(0)
    setComment('')
  }

  const displayStar = hoverRating || rating

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
              {selectedEvent ? selectedEvent.eventName : 'Loading event…'}
            </p>
          </div>
        </div>

        {/* ── Feedback form card ── */}
        <div className={styles.card}>
          {submitSuccess ? (
            <div className={styles.success}>
              <div className={styles['success-icon']}>✓</div>
              <h3>Feedback Submitted!</h3>
              <p>Thank you for your feedback. Your response has been recorded.</p>
              <div className={styles['btn-group']}>
                <button className={styles['btn-primary']} onClick={handleSubmitAnother}>
                  Submit Another
                </button>
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
