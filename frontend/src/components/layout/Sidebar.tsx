import { NavLink, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { logout } from '../../store/slices/authSlice'
import { toggleSidebar } from '../../store/slices/uiSlice'
import type { UserResponseDto } from '../../types/events'
import { Button } from 'react-bootstrap'

// ── Inline SVG icons (keep as-is — no RB icon equivalent for all) ─────────────

const IconDashboard = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
  </svg>
)
const IconCalendar = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const IconPlus = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const IconChart = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
)
const IconUsers = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const IconDollar = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
)
const IconBuilding = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>
    <line x1="3" y1="9" x2="9" y2="9"/><line x1="3" y1="15" x2="9" y2="15"/>
    <line x1="15" y1="9" x2="21" y2="9"/><line x1="15" y1="15" x2="21" y2="15"/>
  </svg>
)
const IconBox = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
)
const IconTicket = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
    <line x1="9" y1="12" x2="15" y2="12"/>
  </svg>
)
const IconSearch = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const IconLogout = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)
const IconMenu = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
)

interface NavItem { label: string; path: string; icon: React.ReactNode }

const NAV_CONFIG: Record<UserResponseDto['role'], NavItem[]> = {
  ORGANIZER: [
    { label: 'Dashboard',    path: '/organizer/dashboard',     icon: <IconDashboard /> },
    { label: 'My Events',    path: '/organizer/events',        icon: <IconCalendar /> },
    { label: 'Create Event', path: '/organizer/events/create', icon: <IconPlus /> },
    { label: 'Analytics',    path: '/organizer/analytics',     icon: <IconChart /> },
  ],
  ADMIN: [
    { label: 'Dashboard',  path: '/admin/dashboard',  icon: <IconDashboard /> },
    { label: 'Users',      path: '/admin/users',      icon: <IconUsers /> },
    { label: 'Events',     path: '/admin/events',     icon: <IconCalendar /> },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: <IconChart /> },
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
    { label: 'Browse Events',    path: '/events',                 icon: <IconSearch /> },
    { label: 'My Registrations', path: '/attendee/registrations', icon: <IconTicket /> },
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

  return (
    <aside
      className={`es-sidebar ${sidebarCollapsed ? 'collapsed' : 'expanded'} d-flex flex-column`}
    >
      {/* Logo / toggle */}
      <div
        className="d-flex align-items-center gap-2 px-3 py-3 border-bottom"
        style={{ borderColor: 'var(--border-color)', minHeight: 56, flexShrink: 0 }}
      >
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="btn p-0 border-0"
          style={{ background: 'none', color: 'var(--saffron)', flexShrink: 0 }}
          aria-label="Toggle sidebar"
        >
          <IconMenu />
        </button>
        {!sidebarCollapsed && (
          <span className="es-logo" style={{ fontSize: '1.2rem' }}>
            <span className="es-event">event</span>
            <span className="es-sphere">sphere</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-grow-1 overflow-auto px-2 py-2">
        {!sidebarCollapsed && (
          <p
            className="text-uppercase fw-bold mb-2 px-2"
            style={{ fontSize: '0.65rem', letterSpacing: '0.1em', color: 'var(--text-muted)' }}
          >
            {ROLE_LABEL_MAP[role]}
          </p>
        )}
        <nav className="nav flex-column gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={sidebarCollapsed ? item.label : undefined}
              className="nav-link es-sidebar-link"
              style={({ isActive }) => ({
                background: isActive ? 'var(--blue-subtle)' : undefined,
                color: isActive ? 'var(--blue)' : 'var(--text-body)',
                fontWeight: isActive ? 600 : 500,
                borderRadius: 8,
                borderLeft: isActive ? '3px solid var(--blue)' : '3px solid transparent',
                padding: '0.5rem 0.65rem',
                paddingLeft: isActive ? 'calc(0.65rem - 3px)' : '0.65rem',
                display: 'flex',
                alignItems: 'center',
                gap: sidebarCollapsed ? 0 : '0.6rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                fontSize: '0.9rem',
              })}
            >
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User section */}
      <div
        className="border-top px-2 py-3 d-flex flex-column gap-2"
        style={{ borderColor: 'var(--border-color)', flexShrink: 0 }}
      >
        <div className="d-flex align-items-center gap-2 px-1 overflow-hidden">
          <div
            className="d-flex align-items-center justify-content-center rounded-circle fw-bold text-white flex-shrink-0"
            style={{ width: 30, height: 30, fontSize: '0.7rem', background: 'var(--blue)' }}
          >
            {initials}
          </div>
          {!sidebarCollapsed && (
            <div className="overflow-hidden">
              <div className="fw-medium text-truncate" style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                {user?.name ?? 'User'}
              </div>
              <div className="text-truncate" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {ROLE_LABEL_MAP[role]}
              </div>
            </div>
          )}
        </div>

        <Button
          variant="outline-danger"
          size="sm"
          className="d-flex align-items-center gap-2 w-100 rounded-3"
          style={{ justifyContent: sidebarCollapsed ? 'center' : 'flex-start', fontSize: '0.85rem' }}
          onClick={handleLogout}
          title={sidebarCollapsed ? 'Logout' : undefined}
        >
          <IconLogout />
          {!sidebarCollapsed && <span>Logout</span>}
        </Button>
      </div>
    </aside>
  )
}
