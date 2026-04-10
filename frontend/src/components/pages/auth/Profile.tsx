import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { updateProfile, clearAuthError } from '../../../store/slices/authSlice'
import type { UserRequestDto } from '../../../types/events'
import styles from '../../../css/profile/Profile.module.css'

const ROLE_LABELS: Record<string, string> = {
  ADMIN:           'Administrator',
  ORGANIZER:       'Event Organizer',
  VENUE_MANAGER:   'Venue Manager',
  FINANCE_OFFICER: 'Finance Officer',
  ATTENDEE:        'Attendee',
  VENDOR:          'Vendor',
}

const ROLE_BADGE: Record<string, string> = {
  ADMIN:           styles['badge-admin'],
  ORGANIZER:       styles['badge-organizer'],
  ATTENDEE:        styles['badge-attendee'],
  VENDOR:          styles['badge-vendor'],
  FINANCE_OFFICER: styles['badge-finance'],
  VENUE_MANAGER:   styles['badge-venue'],
}

const STATUS_BADGE: Record<string, string> = {
  ACTIVE:    styles['badge-active'],
  INACTIVE:  styles['badge-inactive'],
  SUSPENDED: styles['badge-suspended'],
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

  // Populate form from current user
  useEffect(() => {
    if (user) {
      setForm({ name: user.name, email: user.email, phone: user.phone ?? '', password: '' })
    }
  }, [user])

  // Clear redux error when leaving
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
    <div className={styles.page}>
      {/* Banner */}
      <div className={styles.banner}>
        <div className={styles['banner-inner']}>
          <div className={styles['banner-avatar']}>{initials}</div>
          <div className={styles['banner-text']}>
            <h1>{user.name}</h1>
            <p>
              {ROLE_LABELS[user.role] ?? user.role}
              <span className={styles['role-chip']}>{user.role.replace('_', ' ')}</span>
            </p>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles['two-col']}>

          {/* ── Left: Profile overview ───────────────────────────────────────── */}
          <div className={styles.card}>
            <div className={styles['card-title']}>Profile Overview</div>

            <div className={styles['avatar-lg']}>{initials}</div>

            <div className={styles['info-list']}>
              <div className={styles['info-row']}>
                <span className={styles['info-label']}>Full Name</span>
                <span className={styles['info-value']}>{user.name}</span>
              </div>
              <div className={styles['info-row']}>
                <span className={styles['info-label']}>Email</span>
                <span className={styles['info-value']}>{user.email}</span>
              </div>
              <div className={styles['info-row']}>
                <span className={styles['info-label']}>Phone</span>
                <span className={styles['info-value']}>{user.phone || '—'}</span>
              </div>
              <div className={styles['info-row']}>
                <span className={styles['info-label']}>Role</span>
                <span className={`${styles.badge} ${ROLE_BADGE[user.role] ?? ''}`}>
                  {ROLE_LABELS[user.role] ?? user.role}
                </span>
              </div>
              <div className={styles['info-row']}>
                <span className={styles['info-label']}>Status</span>
                <span className={`${styles.badge} ${STATUS_BADGE[user.status] ?? styles['badge-inactive']}`}>
                  {user.status}
                </span>
              </div>
              <div className={styles['info-row']}>
                <span className={styles['info-label']}>User ID</span>
                <span className={styles['info-value']} style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>
                  {user.userId}
                </span>
              </div>
            </div>
          </div>

          {/* ── Right: Edit form ─────────────────────────────────────────────── */}
          <div className={styles.card}>
            <div className={styles['card-title']}>Edit Profile</div>

            <form onSubmit={handleSubmit} className={styles['form-grid']}>
              <div className={styles.field}>
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 00000 00000"
                />
              </div>

              <hr className={styles.divider} />

              <div className={styles.field}>
                <label htmlFor="password">New Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Leave blank to keep current password"
                  autoComplete="new-password"
                />
                <span className={styles['field-hint']}>Leave blank to keep your current password.</span>
              </div>

              <div className={styles.field}>
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setValidationError('') }}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                  disabled={!form.password}
                />
              </div>

              {displayError && <p className={styles['error-msg']}>{displayError}</p>}
              {success     && <p className={styles['success-msg']}>Profile updated successfully.</p>}

              <div className={styles['form-footer']}>
                <button type="submit" className={styles['btn-primary']} disabled={loading}>
                  {loading ? 'Saving…' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  className={styles['btn-outline']}
                  onClick={() => {
                    if (user) setForm({ name: user.name, email: user.email, phone: user.phone ?? '', password: '' })
                    setConfirmPassword('')
                    setSuccess(false)
                    setValidationError('')
                    dispatch(clearAuthError())
                  }}
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}
