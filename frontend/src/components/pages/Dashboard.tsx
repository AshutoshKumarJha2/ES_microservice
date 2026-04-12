import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'
import styles from '../../css/Dashboard.module.css'

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrator',
  ORGANIZER: 'Event Organizer',
  VENUE_MANAGER: 'Venue Manager',
  FINANCE_OFFICER: 'Finance Officer',
  ATTENDEE: 'Attendee',
  VENDOR: 'Vendor',
}

interface QuickAction {
  label: string
  desc: string
  path: string
  color: string
}

const getQuickActions = (role: string): QuickAction[] => {
  switch (role) {
    case 'ORGANIZER':
      return [
        { label: 'Organizer Portal', desc: 'Manage your events & tickets', path: '/organizer/dashboard', color: 'blue' },
        { label: 'Create Event', desc: 'Start planning a new event', path: '/organizer/events/create', color: 'orange' },
      ]
    case 'ADMIN':
      return [
        { label: 'Admin Panel', desc: 'System-wide administration', path: '/admin/dashboard', color: 'red' },
        { label: 'Browse Events', desc: 'View all events', path: '/', color: 'blue' },
      ]
    case 'VENUE_MANAGER':
      return [
          {label:'Venue Manager Portal',desc: 'Manage your venue & resource', path: '/venue-manager/dashboard', color: 'blue'},
        { label: 'Manage Venues',    desc: 'Add, edit and update venue listings',       path: '/venue-manager/venues',    color: 'orange' },
        { label: 'View Bookings',    desc: 'Confirm or cancel venue booking requests',  path: '/venue-manager/venue/bookings',  color: 'green' },
        { label: 'Manage Resources', desc: 'Equipment and staff resources per venue',   path: '/venue-manager/venue/resources', color: 'red' },
      ]
    default:
      return [
        { label: 'Browse Events', desc: 'Discover upcoming events', path: '/', color: 'blue' },
      ]
  }
}

export const Dashboard = () => {
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.auth)

  if (!user) return null

  const quickActions = getQuickActions(user.role)
  const initials = user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className={styles.page}>
      {/* Banner */}
      <div className={styles.banner}>
        <div className={styles['banner-inner']}>
          <div className={styles['banner-avatar']}>{initials}</div>
          <div>
            <h1 className={styles['banner-title']}>Welcome back, {user.name.split(' ')[0]}!</h1>
            <p className={styles['banner-sub']}>
              {ROLE_LABELS[user.role] ?? user.role}
              <span className={`${styles['status-dot']} ${styles[`status-${user.status.toLowerCase()}`]}`} />
              {user.status}
            </p>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {/* Account details */}
        <div className={styles.card}>
          <h2 className={styles['card-title']}>Account Details</h2>
          <div className={styles['info-grid']}>
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
              <span className={styles['role-badge']}>{ROLE_LABELS[user.role] ?? user.role}</span>
            </div>
            <div className={styles['info-row']}>
              <span className={styles['info-label']}>Status</span>
              <span className={`${styles['status-badge']} ${styles[`status-badge-${user.status.toLowerCase()}`]}`}>
                {user.status}
              </span>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        {quickActions.length > 0 && (
          <div className={styles.card}>
            <h2 className={styles['card-title']}>Quick Actions</h2>
            <div className={styles['action-grid']}>
              {quickActions.map((action) => (
                <button
                  key={action.path}
                  className={`${styles['action-card']} ${styles[`action-${action.color}`]}`}
                  onClick={() => navigate(action.path)}
                >
                  <span className={styles['action-label']}>{action.label}</span>
                  <span className={styles['action-desc']}>{action.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
