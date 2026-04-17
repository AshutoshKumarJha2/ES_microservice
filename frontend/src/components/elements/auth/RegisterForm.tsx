import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast, Bounce } from 'react-toastify'
import axiosInstance from '../../../api/axiosInstance'
import { Eye, EyeSlash } from 'react-bootstrap-icons'
import { z } from 'zod'
import { formSchema } from '../../../validations/authValidation'
import {
  Container, Row, Col, Card, Form, Button, Spinner, InputGroup,
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
    <div className="es-auth-bg d-flex align-items-center justify-content-center py-5">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={11} md={9} lg={7}>
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
                  Create Account
                </h1>
                <p className="mb-4" style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  Join EventSphere
                </p>

                <Form onSubmit={handleSubmit}>
                  <Row>
                    {/* Full Name */}
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

                    {/* Phone */}
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

                    {/* Email */}
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

                    {/* Password */}
                    <Col xs={12} md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label className="es-label">Password</Form.Label>
                        <InputGroup hasValidation>
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
                          <Form.Control.Feedback type="invalid">
                            {errors.password}
                          </Form.Control.Feedback>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100 fw-semibold py-2 rounded-3 mt-1"
                    disabled={loading}
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

                <p className="text-center mt-3 mb-0" style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  Already have an account?{' '}
                  <Link to="/login" style={{ color: 'var(--blue)', fontWeight: 600 }}>
                    Sign In
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
