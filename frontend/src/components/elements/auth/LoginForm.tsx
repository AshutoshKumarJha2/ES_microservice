import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { loginUser, clearAuthError, logout } from '../../../store/slices/authSlice'
import { Eye, EyeSlash } from 'react-bootstrap-icons'
import { toast, Bounce } from 'react-toastify'
import {
  Container, Row, Col, Card, Form, Button, Spinner, InputGroup,
} from 'react-bootstrap'

interface FormState {
  email: string
  password: string
}

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
    <div className="es-auth-bg d-flex align-items-center justify-content-center py-5">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={7} lg={5}>
            <Card className="es-card border shadow-sm rounded-4">
              <Card.Body className="p-4 p-md-5">
                {/* Logo */}
                <div className="mb-3">
                  <Link to="/" className="es-logo text-decoration-none">
                    <span className="es-event">event</span>
                    <span className="es-sphere">sphere</span>
                  </Link>
                </div>

                <h1 className="fw-bold fs-3 mb-1" style={{ color: 'var(--text-primary)' }}>
                  Welcome Back
                </h1>
                <p className="mb-4" style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  Sign in to your EventSphere account
                </p>

                <Form onSubmit={handleSubmit}>
                  {/* Email */}
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

                  {/* Password */}
                  <Form.Group className="mb-3">
                    <Form.Label className="es-label">Password</Form.Label>
                    <InputGroup>
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
                      <Form.Control.Feedback type="invalid">
                        Incorrect password.
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>

                  {/* Forgot password */}
                  <div className="text-end mb-3">
                    <Link
                      to="/forgot-password"
                      style={{ color: 'var(--blue)', fontSize: '0.83rem', fontWeight: 600 }}
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100 fw-semibold py-2 rounded-3"
                    disabled={loading}
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

                <p className="text-center mt-3 mb-0" style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  Don't have an account?{' '}
                  <Link to="/register" style={{ color: 'var(--blue)', fontWeight: 600 }}>
                    Create one
                  </Link>
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}
