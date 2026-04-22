import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { loginUser, clearAuthError, logout } from '../../../store/slices/authSlice'
import { Eye, EyeSlash, CalendarEventFill, TicketFill, ShieldFillCheck, BarChartFill } from 'react-bootstrap-icons'
import { toast, Bounce } from 'react-toastify'
import {
  Container, Row, Col, Form, Button, Spinner,
} from 'react-bootstrap'

interface FormState {
  email: string
  password: string
}

const BRAND_FEATURES = [
  { icon: <CalendarEventFill size={16} />, text: 'Full event lifecycle management' },
  { icon: <TicketFill size={16} />, text: 'Ticketing & attendee registration' },
  { icon: <BarChartFill size={16} />, text: 'Real-time analytics & reporting' },
  { icon: <ShieldFillCheck size={16} />, text: 'Role-based access for every team' },
]

export const LoginForm: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { loading, error } = useAppSelector((state) => state.auth)

  const [form, setForm] = useState<FormState>({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [fieldError, setFieldError] = useState<'email' | 'password' | null>(null)

  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: 'top-right', autoClose: 5000, hideProgressBar: true,
        closeOnClick: true, pauseOnHover: true, draggable: true,
        theme: 'light', transition: Bounce,
      })
      if (error === 'User not found') setFieldError('email')
      else if (error === 'Invalid password') setFieldError('password')
      dispatch(clearAuthError())
    }
  }, [error, dispatch])

  useEffect(() => {
    const prefill = (location.state as { prefill?: { email?: string; password?: string } } | null)?.prefill
    if (!prefill) return
    setForm({ email: prefill.email ?? '', password: prefill.password ?? '' })
    navigate('/login', { replace: true, state: null })
  }, [location.state, navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (fieldError === name) setFieldError(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const result = await dispatch(loginUser({ email: form.email, password: form.password }))
    if (loginUser.fulfilled.match(result)) {
      const payload = result.payload as { user: { status: string; role: string } }
      if (payload.user.status === 'SUSPENDED') {
        dispatch(logout())
        toast.error('Your account has been suspended.', {
          position: 'top-right', autoClose: 5000, hideProgressBar: true,
          closeOnClick: true, pauseOnHover: true, draggable: true,
          theme: 'light', transition: Bounce,
        })
        return
      }
      const roleRoutes: Record<string, string> = {
        ADMIN:           '/admin/dashboard',
        ORGANIZER:       '/organizer/dashboard',
        VENUE_MANAGER:   '/venue-manager/dashboard',
        FINANCE_OFFICER: '/finance/dashboard',
        VENDOR:          '/vendor/dashboard',
        ATTENDEE:        '/events',
      }
      navigate(roleRoutes[payload.user.role] ?? '/dashboard', { replace: true })
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', alignItems: 'stretch' }}>
      <Container fluid className="p-0">
        <Row className="g-0" style={{ minHeight: '100vh' }}>

          {/* ── Brand panel (left, desktop only) ── */}
          <Col lg={5} className="d-none d-lg-flex flex-column justify-content-between p-5"
            style={{ background: 'var(--gradient-hero)', position: 'relative', overflow: 'hidden' }}
          >
            {/* Grid overlay */}
            <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="login-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#login-grid)" />
              </svg>
            </div>

            <div style={{ position: 'relative' }}>
              <Link to="/" className="es-logo text-decoration-none">
                <span className="es-event" style={{ color: '#fff' }}>event</span>
                <span className="es-sphere" style={{ color: 'var(--saffron)' }}>sphere</span>
              </Link>
            </div>

            <div style={{ position: 'relative' }}>
              <h2 className="fw-bold mb-2" style={{ color: '#fff', fontSize: '1.75rem', letterSpacing: '-0.01em' }}>
                Your events.<br />Your platform.
              </h2>
              <p className="mb-5" style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.95rem', lineHeight: 1.65 }}>
                EventSphere brings every stakeholder — organizers, attendees, venues, and finance teams — into a single connected workflow.
              </p>
              <div className="d-flex flex-column gap-3">
                {BRAND_FEATURES.map((f) => (
                  <div key={f.text} className="d-flex align-items-center gap-3">
                    <div
                      className="d-flex align-items-center justify-content-center flex-shrink-0 rounded-2"
                      style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.12)', color: '#fff' }}
                    >
                      {f.icon}
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.875rem' }}>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <p style={{ position: 'relative', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>
              © {new Date().getFullYear()} EventSphere
            </p>
          </Col>

          {/* ── Form panel (right) ── */}
          <Col xs={12} lg={7} className="d-flex align-items-center justify-content-center p-4 p-md-5">
            <div style={{ width: '100%', maxWidth: 420 }}>
              {/* Mobile logo */}
              <div className="d-lg-none mb-4">
                <Link to="/" className="es-logo text-decoration-none">
                  <span className="es-event">event</span>
                  <span className="es-sphere">sphere</span>
                </Link>
              </div>

              <h1 className="fw-bold mb-1" style={{ fontSize: '1.625rem', color: 'var(--text-primary)' }}>
                Welcome back
              </h1>
              <p className="mb-4" style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                Sign in to your EventSphere account
              </p>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="es-label">Email Address</Form.Label>
                  <Form.Control
                    id="email"
                    name="email"
                    type="email"
                    placeholder="user@example.com"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                    isInvalid={fieldError === 'email'}
                    className="es-form-control rounded-3"
                  />
                  <Form.Control.Feedback type="invalid">
                    No account found with this email.
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label className="es-label">Password</Form.Label>
                  <div className="input-group">
                    <Form.Control
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={handleChange}
                      autoComplete="current-password"
                      isInvalid={fieldError === 'password'}
                      className="es-form-control rounded-3"
                      style={{ borderRight: 'none' }}
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowPassword((p) => !p)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      style={{
                        borderLeft: 'none',
                        background: 'var(--bg-input)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                    </Button>
                    {fieldError === 'password' && (
                      <div className="invalid-feedback d-block">Incorrect password.</div>
                    )}
                  </div>
                </Form.Group>

                <div className="text-end mb-4">
                  <Link
                    to="/forgot-password"
                    style={{ color: 'var(--blue)', fontSize: '0.83rem', fontWeight: 600 }}
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-100 fw-semibold border-0"
                  disabled={loading}
                  style={{
                    background: 'var(--gradient-primary)',
                    color: '#fff',
                    height: 48,
                    fontSize: '0.9375rem',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Signing In…
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </Form>

              <p className="text-center mt-4 mb-0" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: 'var(--blue)', fontWeight: 700 }}>
                  Create one
                </Link>
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}
