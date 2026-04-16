import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { loginUser, clearAuthError, logout } from '../../../store/slices/authSlice'
import styles from '../../../css/auth/LoginForm.module.css'
import { Eye, EyeSlash } from 'react-bootstrap-icons'
import { toast, Bounce } from 'react-toastify'

interface FormState {
  email: string
  password: string
}

export const LoginForm: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loading, error } = useAppSelector((state) => state.auth)

  const [form, setForm] = useState<FormState>({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [fieldError, setFieldError] = useState<'email' | 'password' | null>(null)

  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
        transition: Bounce,
      })
      if (error === 'User not found') setFieldError('email')
      else if (error === 'Invalid password') setFieldError('password')
      dispatch(clearAuthError())
    }
  }, [error, dispatch])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (fieldError === name) setFieldError(null)
  }

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const result = await dispatch(loginUser({ email: form.email, password: form.password }))
    if (loginUser.fulfilled.match(result)) {
      // Type assertion to access user status safely
      const payload = result.payload as { user: { status: string } }
      if(payload.user.status === 'SUSPENDED'){
        dispatch(logout())
        toast.error('Your account has been suspended.', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'light',
          transition: Bounce,
        })
        return
      }
      navigate('/dashboard', { replace: true })
    }
  }

  return (
    <>
      <div className={styles['page-wrapper']}>
        <div className={styles.card}>
          {/* Logo */}
          <div className={styles.logo}>
            <span className={styles.event}>event</span>
            <span className={styles.sphere}>sphere</span>
          </div>

          <h1 className={styles.heading}>Welcome Back</h1>
          <p className={styles.subheading}>Sign in to your EventSphere account</p>

          <div className={styles.form}>
            {/* Row: Email + Password */}
            <div className={styles['form-row']}>
              <div className={`${styles.field} ${fieldError === 'email' ? styles['field--error'] : ''}`}>
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="user@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
              <div className={`${styles.field} ${fieldError === 'password' ? styles['field--error'] : ''}`}>
                <label htmlFor="password">Password</label>
                <div className={styles['input-wrapper']}>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className={styles['toggle-password']}
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeSlash size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Forgot password */}
            <div className={styles['forgot-link']}>
              <a href="/forgot-password" className={styles['forgot-link-anchor']}>
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <button
              className={styles['btn-submit']}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>

          <p className={styles['footer-text']}>
            Don't have an account?{' '}
            <a href="/register" className={styles['footer-link']}>
              Create one
            </a>
          </p>
        </div>
      </div>
    </>
  )
}
