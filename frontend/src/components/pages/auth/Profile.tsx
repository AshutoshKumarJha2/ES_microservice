import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { updateProfile, clearAuthError } from '../../../store/slices/authSlice'
import type { UserRequestDto } from '../../../types/events'
import {
  Container, Row, Col, Card, Form, Button, Spinner, Badge, Alert,
} from 'react-bootstrap'

const ROLE_LABELS: Record<string, string> = {
  ADMIN:           'Administrator',
  ORGANIZER:       'Event Organizer',
  VENUE_MANAGER:   'Venue Manager',
  FINANCE_OFFICER: 'Finance Officer',
  ATTENDEE:        'Attendee',
  VENDOR:          'Vendor',
}

const ROLE_BADGE: Record<string, string> = {
  ADMIN:           'es-badge-admin',
  ORGANIZER:       'es-badge-organizer',
  ATTENDEE:        'es-badge-attendee',
  VENDOR:          'es-badge-vendor',
  FINANCE_OFFICER: 'es-badge-finance',
  VENUE_MANAGER:   'es-badge-venue',
}

const STATUS_BADGE: Record<string, string> = {
  ACTIVE:    'es-badge-active',
  INACTIVE:  'es-badge-draft',
  SUSPENDED: 'es-badge-cancelled',
}

export const Profile = () => {
  const dispatch = useAppDispatch()
  const { user, loading, error } = useAppSelector((state) => state.auth)

  const [form, setForm] = useState<UserRequestDto>({
    name: '',
    email: '',
    phone: '',
    password: '',
  })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [success, setSuccess] = useState(false)
  const [validationError, setValidationError] = useState('')

  useEffect(() => {
    if (user) {
      setForm({ name: user.name, email: user.email, phone: user.phone ?? '', password: '' })
    }
  }, [user])

  useEffect(() => {
    return () => { dispatch(clearAuthError()) }
  }, [dispatch])

  if (!user) return null

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setSuccess(false)
    setValidationError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess(false)
    setValidationError('')

    if (form.password && form.password !== confirmPassword) {
      setValidationError('Passwords do not match.')
      return
    }

    const payload: UserRequestDto = {
      name:  form.name,
      email: form.email,
      phone: form.phone,
      ...(form.password ? { password: form.password } : {}),
    }

    const result = await dispatch(updateProfile(payload))
    if (updateProfile.fulfilled.match(result)) {
      setSuccess(true)
      setForm((prev) => ({ ...prev, password: '' }))
      setConfirmPassword('')
    }
  }

  const displayError = validationError || error

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>

      {/* Banner */}
      <div className="es-banner">
        <Container fluid className="px-3 px-md-5 py-4">
          <div className="d-flex align-items-center gap-4">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle fw-bold text-white flex-shrink-0"
              style={{ width: 64, height: 64, fontSize: '1.4rem', background: 'var(--gradient-primary)' }}
            >
              {initials}
            </div>
            <div>
              <h1 className="fw-bold fs-3 mb-1">{user.name}</h1>
              <div className="d-flex align-items-center gap-2">
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {ROLE_LABELS[user.role] ?? user.role}
                </span>
                <Badge className={`border-0 ${ROLE_BADGE[user.role] ?? 'es-badge-draft'}`} style={{ fontSize: '0.7rem' }}>
                  {user.role.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Content */}
      <Container fluid className="px-3 px-md-5 py-4">
        <Row className="g-4">

          {/* Profile Overview */}
          <Col xs={12} lg={4}>
            <Card className="es-card border shadow-sm h-100">
              <Card.Body className="p-4">
                <h5 className="fw-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Profile Overview</h5>

                <div className="text-center mb-4">
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-circle fw-bold text-white mx-auto"
                    style={{ width: 72, height: 72, fontSize: '1.5rem', background: 'var(--blue)' }}
                  >
                    {initials}
                  </div>
                  <div className="fw-semibold mt-2" style={{ color: 'var(--text-primary)' }}>{user.name}</div>
                  <div className="small" style={{ color: 'var(--text-muted)' }}>{user.email}</div>
                </div>

                <div className="d-flex flex-column gap-3">
                  {[
                    { label: 'Full Name', value: user.name },
                    { label: 'Email',     value: user.email },
                    { label: 'Phone',     value: user.phone || '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="d-flex justify-content-between align-items-start border-bottom pb-2" style={{ borderColor: 'var(--border-color) !important' }}>
                      <span className="small fw-medium" style={{ color: 'var(--text-muted)' }}>{label}</span>
                      <span className="small text-end" style={{ color: 'var(--text-primary)', maxWidth: '60%', wordBreak: 'break-all' }}>{value}</span>
                    </div>
                  ))}
                  <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                    <span className="small fw-medium" style={{ color: 'var(--text-muted)' }}>Role</span>
                    <Badge className={`border-0 ${ROLE_BADGE[user.role] ?? 'es-badge-draft'}`} style={{ fontSize: '0.7rem' }}>
                      {ROLE_LABELS[user.role] ?? user.role}
                    </Badge>
                  </div>
                  <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                    <span className="small fw-medium" style={{ color: 'var(--text-muted)' }}>Status</span>
                    <Badge className={`border-0 ${STATUS_BADGE[user.status] ?? 'es-badge-draft'}`} style={{ fontSize: '0.7rem' }}>
                      {user.status}
                    </Badge>
                  </div>
                  <div className="d-flex justify-content-between align-items-start">
                    <span className="small fw-medium" style={{ color: 'var(--text-muted)' }}>User ID</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--text-secondary)', maxWidth: '60%', wordBreak: 'break-all', textAlign: 'right' }}>
                      {user.userId}
                    </span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Edit Form */}
          <Col xs={12} lg={8}>
            <Card className="es-card border shadow-sm">
              <Card.Body className="p-4">
                <h5 className="fw-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Edit Profile</h5>

                <Form onSubmit={handleSubmit}>
                  <Row className="g-3 mb-3">
                    <Col xs={12} md={6}>
                      <Form.Group>
                        <Form.Label className="es-label">Full Name</Form.Label>
                        <Form.Control
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Your full name"
                          className="rounded-3"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group>
                        <Form.Label className="es-label">Email Address</Form.Label>
                        <Form.Control
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="your@email.com"
                          className="rounded-3"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group>
                        <Form.Label className="es-label">Phone Number</Form.Label>
                        <Form.Control
                          name="phone"
                          type="tel"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="+91 00000 00000"
                          className="rounded-3"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <hr style={{ borderColor: 'var(--border-color)' }} />

                  <Row className="g-3 mb-3">
                    <Col xs={12} md={6}>
                      <Form.Group>
                        <Form.Label className="es-label">New Password</Form.Label>
                        <Form.Control
                          name="password"
                          type="password"
                          value={form.password}
                          onChange={handleChange}
                          placeholder="Leave blank to keep current"
                          autoComplete="new-password"
                          className="rounded-3"
                        />
                        <Form.Text style={{ color: 'var(--text-muted)' }}>
                          Leave blank to keep your current password.
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group>
                        <Form.Label className="es-label">Confirm New Password</Form.Label>
                        <Form.Control
                          name="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => { setConfirmPassword(e.target.value); setValidationError('') }}
                          placeholder="Re-enter new password"
                          autoComplete="new-password"
                          disabled={!form.password}
                          className="rounded-3"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {displayError && (
                    <Alert variant="danger" className="py-2 small rounded-3">{displayError}</Alert>
                  )}
                  {success && (
                    <Alert variant="success" className="py-2 small rounded-3">Profile updated successfully.</Alert>
                  )}

                  <div className="d-flex gap-2">
                    <Button type="submit" variant="primary" className="fw-semibold rounded-3 px-4" disabled={loading}>
                      {loading ? (
                        <><Spinner animation="border" size="sm" className="me-2" />Saving…</>
                      ) : 'Save Changes'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      className="fw-semibold rounded-3 px-4"
                      onClick={() => {
                        if (user) setForm({ name: user.name, email: user.email, phone: user.phone ?? '', password: '' })
                        setConfirmPassword('')
                        setSuccess(false)
                        setValidationError('')
                        dispatch(clearAuthError())
                      }}
                    >
                      Reset
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>

        </Row>
      </Container>
    </div>
  )
}
