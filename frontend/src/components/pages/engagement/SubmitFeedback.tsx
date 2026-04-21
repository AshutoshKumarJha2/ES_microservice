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
import {
  Container, Row, Col, Card, Form, Button, Spinner, Alert, ProgressBar,
} from 'react-bootstrap'
import {
  ArrowLeft, StarFill, Star, ExclamationTriangleFill, CheckCircleFill,
} from 'react-bootstrap-icons'

const ALLOWED_STATUSES = ['CONFIRMED', 'CHECKED_IN']
const MAX_COMMENT = 500

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

  const [rating, setRating]           = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment]         = useState('')

  useEffect(() => {
    if (!eventId) return
    dispatch(fetchEventById(eventId))
    dispatch(fetchFeedback({ eventId, size: 100 }))
    if (user?.role === 'ATTENDEE') {
      dispatch(fetchMyRegistration(eventId))
    }
    return () => { dispatch(clearSubmitState()) }
  }, [eventId, dispatch, user?.role])

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

  const distribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0]
    feedback.forEach((f) => { const r = f.rating ?? 0; if (r >= 1 && r <= 5) counts[r - 1]++ })
    return counts.reverse() // [5★, 4★, 3★, 2★, 1★]
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
  const isSubmitted = submitSuccess || alreadySubmitted
  const eventName = selectedEvent ? selectedEvent.eventName : eventId ?? 'Loading event…'

  // ── Shared banner ──────────────────────────────────────────────────────────
  const Banner = ({ title }: { title: string }) => (
    <div className="es-banner">
      <Container fluid className="px-3 px-md-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-link p-0 mb-2 d-flex align-items-center gap-1"
          style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem', textDecoration: 'none' }}
        >
          <ArrowLeft size={13} /> My Registrations
        </button>
        <h1 className="fw-bold fs-3 mb-1">{title}</h1>
        <p className="mb-0 small" style={{ color: 'rgba(255,255,255,0.72)' }}>{eventName}</p>
      </Container>
    </div>
  )

  // ── Access denied: wrong role ──────────────────────────────────────────────
  if (user && user.role !== 'ATTENDEE') {
    return (
      <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
        <Banner title="Submit Feedback" />
        <Container fluid className="px-3 px-md-4 py-4">
          <Card className="es-card border shadow-sm" style={{ maxWidth: 480 }}>
            <Card.Body className="p-4 text-center">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                style={{ width: 56, height: 56, background: 'var(--red-subtle)', color: 'var(--red)' }}
              >
                <ExclamationTriangleFill size={24} />
              </div>
              <h5 className="fw-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Access Denied</h5>
              <p className="small mb-3" style={{ color: 'var(--text-secondary)' }}>
                Only registered attendees can submit feedback. Your current role ({user.role.replace('_', ' ')}) does not have permission.
              </p>
              <Button variant="outline-secondary" size="sm" className="rounded-3" onClick={() => navigate(-1)}>Go Back</Button>
            </Card.Body>
          </Card>
        </Container>
      </div>
    )
  }

  // ── Loading registration check ─────────────────────────────────────────────
  if (user?.role === 'ATTENDEE' && myRegistrationLoading) {
    return (
      <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
        <Banner title="Submit Feedback" />
        <Container fluid className="px-3 px-md-4 py-5 text-center">
          <Spinner animation="border" style={{ color: 'var(--blue)' }} />
          <p className="mt-3 small" style={{ color: 'var(--text-muted)' }}>Checking your registration…</p>
        </Container>
      </div>
    )
  }

  // ── Not eligible ───────────────────────────────────────────────────────────
  if (user?.role === 'ATTENDEE' && !myRegistrationLoading && !isAllowedStatus(myRegistration?.status)) {
    const reason = !myRegistration
      ? 'You are not registered for this event.'
      : `Your registration status is "${myRegistration.status}". Only attendees with an Approved or Checked-In registration can submit feedback.`

    return (
      <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
        <Banner title="Submit Feedback" />
        <Container fluid className="px-3 px-md-4 py-4">
          <Card className="es-card border shadow-sm" style={{ maxWidth: 480 }}>
            <Card.Body className="p-4 text-center">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                style={{ width: 56, height: 56, background: 'var(--amber-subtle)', color: 'var(--amber)' }}
              >
                <ExclamationTriangleFill size={24} />
              </div>
              <h5 className="fw-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Not Eligible</h5>
              <p className="small mb-3" style={{ color: 'var(--text-secondary)' }}>{reason}</p>
              <Button variant="outline-secondary" size="sm" className="rounded-3" onClick={() => navigate(-1)}>Go Back</Button>
            </Card.Body>
          </Card>
        </Container>
      </div>
    )
  }

  // ── Main page ──────────────────────────────────────────────────────────────
  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <Banner title={isSubmitted ? 'Feedback Submitted' : 'Submit Feedback'} />

      <Container fluid className="px-3 px-md-4 py-4">
        <Row className="g-3">

          {/* ── Feedback form card ── */}
          <Col xs={12} lg={7}>
            <Card className="es-card border shadow-sm">
              <Card.Body className="p-3 p-md-4">
                <h5 className="fw-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Your Feedback</h5>

                {/* Already submitted */}
                {alreadySubmitted && !submitSuccess ? (
                  <div className="text-center py-3">
                    <div
                      className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                      style={{ width: 56, height: 56, background: 'var(--green-subtle)', color: 'var(--green)' }}
                    >
                      <CheckCircleFill size={24} />
                    </div>
                    <h6 className="fw-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Already Submitted</h6>
                    <p className="small mb-3" style={{ color: 'var(--text-secondary)' }}>
                      You have already submitted feedback for this event. Only one feedback per attendee is allowed.
                    </p>
                    <Button variant="outline-secondary" size="sm" className="rounded-3" onClick={() => navigate(-1)}>Go Back</Button>
                  </div>

                ) : submitSuccess ? (
                  <div className="text-center py-3">
                    <div
                      className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                      style={{ width: 56, height: 56, background: 'var(--green-subtle)', color: 'var(--green)' }}
                    >
                      <CheckCircleFill size={24} />
                    </div>
                    <h6 className="fw-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Feedback Submitted!</h6>
                    <p className="small mb-3" style={{ color: 'var(--text-secondary)' }}>
                      Thank you for your feedback. Your response has been recorded.
                    </p>
                    <Button variant="outline-secondary" size="sm" className="rounded-3" onClick={() => navigate(-1)}>Go Back</Button>
                  </div>

                ) : (
                  <Form onSubmit={handleSubmit}>
                    {/* Star rating */}
                    <Form.Group className="mb-4">
                      <Form.Label className="es-label">Overall Rating *</Form.Label>
                      <div
                        role="group"
                        aria-label="Rating"
                        className="d-flex align-items-center gap-2 mt-1"
                      >
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            role="radio"
                            aria-checked={rating === star}
                            aria-label={`Rate ${star} out of 5`}
                            tabIndex={0}
                            style={{ cursor: 'pointer', color: star <= displayStar ? 'var(--amber)' : 'var(--border-color)', fontSize: '1.6rem', lineHeight: 1 }}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setRating(star) } }}
                          >
                            {star <= displayStar
                              ? <StarFill size={28} />
                              : <Star size={28} />}
                          </span>
                        ))}
                        {displayStar > 0 && (
                          <span className="ms-2 fw-semibold small" style={{ color: 'var(--text-secondary)' }}>
                            {displayStar} / 5
                          </span>
                        )}
                      </div>
                    </Form.Group>

                    {/* Comment */}
                    <Form.Group className="mb-4">
                      <Form.Label className="es-label">Comment</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT))}
                        maxLength={MAX_COMMENT}
                        placeholder="Share your experience about this event…"
                        className="es-form-control rounded-3"
                      />
                      <div className="d-flex justify-content-end mt-1">
                        <span
                          className="small"
                          style={{ color: comment.length >= 480 ? 'var(--red)' : 'var(--text-muted)' }}
                        >
                          {comment.length}/{MAX_COMMENT}
                        </span>
                      </div>
                    </Form.Group>

                    {submitError && <Alert variant="danger" className="py-2 small rounded-3 mb-3">{submitError}</Alert>}

                    <div className="d-flex gap-2">
                      <Button
                        type="submit"
                        variant="primary"
                        className="fw-semibold rounded-3"
                        disabled={submitLoading || rating === 0}
                      >
                        {submitLoading
                          ? <><Spinner animation="border" size="sm" className="me-2" />Submitting…</>
                          : 'Submit Feedback'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline-secondary"
                        className="rounded-3"
                        onClick={() => navigate(-1)}
                      >
                        Cancel
                      </Button>
                    </div>
                    {rating === 0 && (
                      <p className="small mt-2 mb-0" style={{ color: 'var(--text-muted)' }}>
                        Please select a star rating to submit.
                      </p>
                    )}
                  </Form>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* ── Summary card ── */}
          <Col xs={12} lg={5}>
            <Card className="es-card border shadow-sm h-100">
              <Card.Body className="p-3 p-md-4">
                <h5 className="fw-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Event Feedback Summary</h5>

                <div className="d-flex justify-content-between align-items-baseline mb-2">
                  <span className="small fw-medium" style={{ color: 'var(--text-secondary)' }}>Average Rating</span>
                  <span className="fw-bold" style={{ color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                    {avgRating ? `${avgRating} / 5` : '— / 5'}
                  </span>
                </div>

                <ProgressBar
                  now={avgRating ? (parseFloat(avgRating) / 5) * 100 : 0}
                  className="mb-3 rounded-pill"
                  style={{ height: 8, background: 'var(--bg-subtle)' }}
                />

                <div className="d-flex align-items-center gap-2 mb-3">
                  <StarFill size={14} style={{ color: 'var(--amber)' }} />
                  <span className="small" style={{ color: 'var(--text-muted)' }}>
                    {feedback.length > 0
                      ? `Based on ${feedback.length} review${feedback.length !== 1 ? 's' : ''}`
                      : 'No reviews yet'}
                  </span>
                </div>

                {/* Per-star distribution */}
                {feedback.length > 0 && (
                  <div className="mt-1">
                    {[5, 4, 3, 2, 1].map((star, i) => {
                      const count = distribution[i]
                      const pct = Math.round((count / feedback.length) * 100)
                      return (
                        <div key={star} className="d-flex align-items-center gap-2 mb-1" style={{ fontSize: '0.78rem' }}>
                          <span style={{ width: 24, color: 'var(--text-muted)', textAlign: 'right', flexShrink: 0 }}>{star}★</span>
                          <ProgressBar
                            now={pct}
                            className="flex-grow-1 rounded-pill"
                            style={{ height: 6, background: 'var(--bg-subtle)' }}
                          />
                          <span style={{ width: 20, color: 'var(--text-muted)', flexShrink: 0 }}>{count}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

        </Row>
      </Container>
    </div>
  )
}
