import { NavLink, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { logout } from '../../store/slices/authSlice'
import { toggleSidebar } from '../../store/slices/uiSlice'
import type { UserResponseDto } from '../../types/events'
import styles from '../../css/layout/navbar/Sidebar.module.css'

// ── Inline SVG Icons ──────────────────────────────────────────────────────────

const IconDashboard = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
  </svg>
)

const IconCalendar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const IconChart = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
)

const IconUsers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

const IconDollar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
)

const IconBuilding = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>
    <line x1="3" y1="9" x2="9" y2="9"/><line x1="3" y1="15" x2="9" y2="15"/>
    <line x1="15" y1="9" x2="21" y2="9"/><line x1="15" y1="15" x2="21" y2="15"/>
  </svg>
)

const IconBox = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
)

const IconTicket = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
    <line x1="9" y1="12" x2="15" y2="12"/>
  </svg>
)

const IconLogout = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

// ── Nav config per role ───────────────────────────────────────────────────────

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
}

const NAV_CONFIG: Record<UserResponseDto['role'], NavItem[]> = {
  ORGANIZER: [
    { label: 'Dashboard',    path: '/organizer/dashboard',       icon: <IconDashboard /> },
    { label: 'My Events',    path: '/organizer/events',          icon: <IconCalendar /> },
    { label: 'Create Event', path: '/organizer/events/create',   icon: <IconPlus /> },
    { label: 'Analytics',    path: '/organizer/analytics',       icon: <IconChart /> },
  ],
  ADMIN: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: <IconDashboard /> },
    { label: 'Users',     path: '/admin/users',     icon: <IconUsers /> },
    { label: 'Events',    path: '/admin/events',    icon: <IconCalendar /> },
    { label: 'Reports',   path: '/admin/reports',   icon: <IconChart /> },
  ],
  FINANCE_OFFICER: [
    { label: 'Dashboard',         path: '/finance/dashboard', icon: <IconDashboard /> },
    { label: 'Budget & Expenses', path: '/finance/budget',    icon: <IconDollar /> },
  ],
  VENUE_MANAGER: [
    { label: 'Dashboard', path: '/venue/dashboard', icon: <IconDashboard /> },
    { label: 'Venues',    path: '/venue/venues',    icon: <IconBuilding /> },
  ],
  ATTENDEE: [
    { label: 'Browse Events',    path: '/events',                  icon: <IconSearch /> },
    { label: 'My Registrations', path: '/attendee/registrations',  icon: <IconTicket /> },
  ],
  VENDOR: [
    { label: 'Dashboard', path: '/vendor/dashboard', icon: <IconDashboard /> },
    { label: 'Services',  path: '/vendor/services',  icon: <IconBox /> },
  ],
}

const ROLE_LABEL_MAP: Record<UserResponseDto['role'], string> = {
  ORGANIZER:       'Organizer',
  ADMIN:           'Admin',
  FINANCE_OFFICER: 'Finance Officer',
  VENUE_MANAGER:   'Venue Manager',
  ATTENDEE:        'Attendee',
  VENDOR:          'Vendor',
}

// ── Component ─────────────────────────────────────────────────────────────────

export const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.auth)
  const { sidebarCollapsed } = useAppSelector((state) => state.ui)

  const role = user?.role ?? 'ORGANIZER'
  const navItems = NAV_CONFIG[role] ?? []
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)
    : '?'

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  const handleSidebarToggle = () => {
    dispatch(toggleSidebar())
  }

  return (
    <aside className={`${styles.sidebar}${sidebarCollapsed ? ` ${styles.collapsed}` : ''}`}>
      {/* Logo */}
      <div className={styles['logo-wrap']}>
        <button
          onClick={handleSidebarToggle}
          className={styles['logo-icon']}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          aria-label="Toggle sidebar"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <span className={styles['logo-text']}>
          <span className={styles['logo-event']}>event</span>
          <span className={styles['logo-sphere']}>sphere</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        <span className={styles['nav-section-label']}>
          {ROLE_LABEL_MAP[role]}
        </span>

        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `${styles['nav-item']}${isActive ? ` ${styles.active}` : ''}`
            }
            title={sidebarCollapsed ? item.label : undefined}
          >
            <span className={styles['nav-item-icon']}>{item.icon}</span>
            <span className={styles['nav-item-label']}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.divider} />

      {/* User section */}
      <div className={styles['user-section']}>
        <div className={styles['user-info']}>
          <div className={styles['user-avatar']}>{initials}</div>
          <div className={styles['user-details']}>
            <div className={styles['user-name']}>{user?.name ?? 'User'}</div>
            <div className={styles['user-role']}>{ROLE_LABEL_MAP[role]}</div>
          </div>
        </div>

        <button className={styles['logout-btn']} onClick={handleLogout}>
          <IconLogout />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
