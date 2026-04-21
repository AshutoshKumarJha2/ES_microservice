import { useEffect } from 'react'
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchCurrentUser, logout } from '../../store/slices/authSlice'
import { DarkModeToggle } from '../elements/DarkModeToggle'
import { Navbar, Container, Nav, NavDropdown } from 'react-bootstrap'

const ROLE_LABELS: Record<string, string> = {
  ORGANIZER: 'Organizer', ADMIN: 'Admin', ATTENDEE: 'Attendee',
  FINANCE_OFFICER: 'Finance', VENUE_MANAGER: 'Venue Mgr', VENDOR: 'Vendor',
}

const ROLE_BADGE_CLASS: Record<string, string> = {
  ORGANIZER: 'es-badge-organizer', ADMIN: 'es-badge-admin', ATTENDEE: 'es-badge-attendee',
  FINANCE_OFFICER: 'es-badge-finance', VENUE_MANAGER: 'es-badge-venue', VENDOR: 'es-badge-vendor',
}

const SUB_TABS = [
  { to: '/venue-manager/venues',           label: 'Venues'    },
  { to: '/venue-manager/venue/bookings',   label: 'Bookings'  },
  { to: '/venue-manager/venue/resources',  label: 'Resources' },
]

export const VenueLayout = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user, accessToken } = useAppSelector((s) => s.auth)

  useEffect(() => {
    if (accessToken && !user) dispatch(fetchCurrentUser())
  }, [accessToken, user, dispatch])

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>

      {/* ── Main Navbar ──────────────────────────────────────────────────────── */}
      <Navbar expand="md" className="es-app-header border-bottom py-2" style={{ minHeight: 56 }}>
        <Container fluid className="px-3 px-md-4">
          <Navbar.Brand as={Link} to="/" className="fw-bold me-4 p-0" style={{ fontSize: '1rem' }}>
            <span style={{ color: 'var(--blue)' }}>event</span>
            <span style={{ color: 'var(--saffron)' }}>sphere</span>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="venue-main-nav" />

          <Navbar.Collapse id="venue-main-nav">
            <Nav className="me-auto">
              {[
                { to: '/', label: 'Home', end: true },
                { to: '/about', label: 'About', end: false },
                { to: '/contact', label: 'Contact', end: false },
              ].map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `nav-link small${isActive ? ' fw-semibold' : ''}`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </Nav>

            <div className="d-flex align-items-center gap-2">
              <DarkModeToggle />

              {user && (
                <NavDropdown
                  title={
                    <span className="d-flex align-items-center gap-2">
                      <span
                        className="d-flex align-items-center justify-content-center rounded-circle fw-bold text-white"
                        style={{ width: 30, height: 30, fontSize: '0.7rem', background: 'var(--blue)', flexShrink: 0 }}
                      >
                        {initials}
                      </span>
                      <span className="fw-medium d-none d-sm-inline" style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                        {user.name?.split(' ')[0]}
                      </span>
                    </span>
                  }
                  id="venue-user-dropdown"
                  align="end"
                >
                  <NavDropdown.Header className="pb-1">
                    <div className="fw-semibold" style={{ color: 'var(--text-primary)' }}>{user.name}</div>
                    <div className="small" style={{ color: 'var(--text-secondary)' }}>{user.email}</div>
                    <span className={`badge border-0 mt-1 ${ROLE_BADGE_CLASS[user.role] ?? ''}`} style={{ fontSize: '0.7rem' }}>
                      {ROLE_LABELS[user.role] ?? user.role}
                    </span>
                  </NavDropdown.Header>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={() => navigate('/dashboard')}>Dashboard</NavDropdown.Item>
                  <NavDropdown.Item onClick={() => navigate('/profile')}>My Profile</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item className="text-danger" onClick={handleLogout}>Logout</NavDropdown.Item>
                </NavDropdown>
              )}
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* ── Sub-Navbar (Venue tabs) ───────────────────────────────────────────── */}
      <div className="border-bottom" style={{ background: 'var(--bg-surface)' }}>
        <Container fluid className="px-3 px-md-4">
          <div className="d-flex align-items-center gap-3 py-2 flex-wrap">
            <span className="fw-semibold small" style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              Venue Manager Portal
            </span>
            <nav className="d-flex gap-1">
              {SUB_TABS.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `nav-link px-3 py-1 rounded-2 small fw-medium ${isActive ? 'fw-semibold' : ''}`
                  }
                  style={({ isActive }) => ({
                    color: isActive ? 'var(--blue)' : 'var(--text-secondary)',
                    background: isActive ? 'var(--bg-hover)' : 'transparent',
                  })}
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
        </Container>
      </div>

      {/* ── Page Content ─────────────────────────────────────────────────────── */}
      <Outlet />
    </div>
  )
}
