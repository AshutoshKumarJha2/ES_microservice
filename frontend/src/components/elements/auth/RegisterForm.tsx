import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast, Bounce } from 'react-toastify'
import axiosInstance from '../../../api/axiosInstance'
import { Eye, EyeSlash, CheckCircleFill } from 'react-bootstrap-icons'
import { z } from 'zod'
import { formSchema } from '../../../validations/authValidation'
import {
  Container, Row, Col, Form, Button, Spinner,
} from 'react-bootstrap'

type FormState = z.infer<typeof formSchema>

interface RegisterRequest {
  name: string
  email: string
  password: string
  phone: string
}

interface RegisterResponse {
  userId: string
  userName: string
  userEmail: string
  role: string
  phone: string
  status: string
  message: string
}

const BRAND_POINTS = [
  'Free to get started — no credit card required',
  'Role assigned automatically on first login',
  'Access your dashboard instantly after sign up',
  'Secure, audited, and RBAC-controlled platform',
]

export const RegisterForm: React.FC = () => {
  const [form, setForm] = useState<FormState>({ fullName: '', email: '', phone: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormState]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const result = formSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof FormState, string>> = {}
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof FormState
        fieldErrors[field] = err.message
      })
      setErrors(fieldErrors)
      setLoading(false)
      return
    }
    setErrors({})

    const payload: RegisterRequest = {
      name: form.fullName,
      email: form.email,
      password: form.password,
      phone: form.phone,
    }

    try {
      const { data } = await axiosInstance.post<RegisterResponse>(
        '/api/v1/auth-manager/auth/register',
        payload
      )
      toast.success(data.message, {
        position: 'top-right', autoClose: 5000, hideProgressBar: true,
        closeOnClick: true, pauseOnHover: true, draggable: true,
        theme: 'light', transition: Bounce,
      })
      navigate('/login', {
        replace: true,
        state: { prefill: { email: form.email, password: form.password } },
      })
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; error?: string } } }
      const message =
        axiosErr.response?.data?.message ||
        axiosErr.response?.data?.error ||
        (err instanceof Error ? err.message : 'Registration failed. Please try again.')
      toast.error(message, {
        position: 'top-right', autoClose: 5000, hideProgressBar: true,
        closeOnClick: true, pauseOnHover: true, draggable: true,
        theme: 'light', transition: Bounce,
      })
      navigate('/login', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', alignItems: 'stretch' }}>
      <Container fluid className="p-0">
        <Row className="g-0" style={{ minHeight: '100vh' }}>

          {/* ── Brand panel (left, desktop only) ── */}
          <Col lg={4} className="d-none d-lg-flex flex-column justify-content-between p-5"
            style={{ background: 'var(--gradient-hero)', position: 'relative', overflow: 'hidden' }}
          >
            <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="register-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#register-grid)" />
              </svg>
            </div>

            <div style={{ position: 'relative' }}>
              <Link to="/" className="es-logo text-decoration-none">
                <span className="es-event" style={{ color: '#fff' }}>event</span>
                <span className="es-sphere" style={{ color: 'var(--saffron)' }}>sphere</span>
              </Link>
            </div>

            <div style={{ position: 'relative' }}>
              <h2 className="fw-bold mb-2" style={{ color: '#fff', fontSize: '1.5rem', letterSpacing: '-0.01em' }}>
                Join EventSphere today
              </h2>
              <p className="mb-4" style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem', lineHeight: 1.65 }}>
                One platform for every stakeholder in your event ecosystem.
              </p>
              <div className="d-flex flex-column gap-3">
                {BRAND_POINTS.map((pt) => (
                  <div key={pt} className="d-flex align-items-start gap-2">
                    <CheckCircleFill size={15} style={{ color: '#6ee7b7', flexShrink: 0, marginTop: 2 }} />
                    <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', lineHeight: 1.5 }}>{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            <p style={{ position: 'relative', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>
              © {new Date().getFullYear()} EventSphere
            </p>
          </Col>

          {/* ── Form panel (right) ── */}
          <Col xs={12} lg={8} className="d-flex align-items-center justify-content-center p-4 p-md-5">
            <div style={{ width: '100%', maxWidth: 560 }}>
              {/* Mobile logo */}
              <div className="d-lg-none mb-4">
                <Link to="/" className="es-logo text-decoration-none">
                  <span className="es-event">event</span>
                  <span className="es-sphere">sphere</span>
                </Link>
              </div>

              <h1 className="fw-bold mb-1" style={{ fontSize: '1.625rem', color: 'var(--text-primary)' }}>
                Create your account
              </h1>
              <p className="mb-4" style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                Join EventSphere — it only takes a minute
              </p>

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col xs={12} md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label className="es-label">Full Name</Form.Label>
                      <Form.Control
                        id="fullName"
                        name="fullName"
                        type="text"
                        placeholder="John Doe"
                        value={form.fullName}
                        onChange={handleChange}
                        autoComplete="name"
                        isInvalid={!!errors.fullName}
                        className="es-form-control rounded-3"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.fullName}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col xs={12} md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label className="es-label">Phone</Form.Label>
                      <Form.Control
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={form.phone}
                        onChange={handleChange}
                        autoComplete="tel"
                        isInvalid={!!errors.phone}
                        className="es-form-control rounded-3"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.phone}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col xs={12} md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label className="es-label">Email Address</Form.Label>
                      <Form.Control
                        id="email"
                        name="email"
                        type="email"
                        placeholder="user@example.com"
                        value={form.email}
                        onChange={handleChange}
                        autoComplete="email"
                        isInvalid={!!errors.email}
                        className="es-form-control rounded-3"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.email}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col xs={12} md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label className="es-label">Password</Form.Label>
                      <div className="input-group">
                        <Form.Control
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={form.password}
                          onChange={handleChange}
                          autoComplete="new-password"
                          isInvalid={!!errors.password}
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
                        {errors.password && (
                          <div className="invalid-feedback d-block">{errors.password}</div>
                        )}
                      </div>
                    </Form.Group>
                  </Col>
                </Row>

                <Button
                  type="submit"
                  className="w-100 fw-semibold border-0 mt-2"
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
                      Creating Account…
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </Form>

              <p className="text-center mt-4 mb-0" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'var(--blue)', fontWeight: 700 }}>
                  Sign In
                </Link>
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}
