import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { logout } from '../../store/slices/authSlice'
import { clearAuthHeader } from '../../api/axiosInstance'
import { Bell, BoxArrowRight, Person } from 'react-bootstrap-icons'
import { DarkModeToggle } from '../elements/DarkModeToggle'
import {
  Navbar, Nav, Container, NavDropdown, Badge,
} from 'react-bootstrap'

const ROLE_BADGE: Record<string, string> = {
  ADMIN:           'es-badge-admin',
  ORGANIZER:       'es-badge-organizer',
  ATTENDEE:        'es-badge-attendee',
  VENDOR:          'es-badge-vendor',
  FINANCE_OFFICER: 'es-badge-finance',
  VENUE_MANAGER:   'es-badge-venue',
}

export const Header = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const unreadCount = useAppSelector((state) =>
    state.notifications.notifications.filter((n) => n.status === 'UNREAD').length
  )
  const [expanded, setExpanded] = useState(false)

  const handleLogout = () => {
    setExpanded(false)
    clearAuthHeader()
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <Navbar
      expand="lg"
      expanded={expanded}
      onToggle={setExpanded}
      className="border-bottom py-2"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border-color)',
        transition: 'background 0.3s',
      }}
    >
      <Container>
        {/* Logo */}
        <Navbar.Brand as={Link} to="/" className="es-logo me-4">
          <span className="es-event">event</span>
          <span className="es-sphere">sphere</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-nav" />

        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto" />

          {/* Right actions */}
          <div className="d-flex align-items-center gap-2 mt-2 mt-lg-0">
            <DarkModeToggle />

            {isAuthenticated && (
              <Nav.Link
                as={Link}
                to="/notifications"
                aria-label="Notifications"
                className="position-relative p-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                <Bell size={17} />
                {unreadCount > 0 && (
                  <Badge
                    bg="danger"
                    pill
                    className="position-absolute"
                    style={{ fontSize: '0.6rem', top: 2, right: 2, minWidth: 16 }}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </Nav.Link>
            )}

            {isAuthenticated ? (
              <NavDropdown
                title={
                  <span className="d-inline-flex align-items-center gap-2">
                    <span
                      className="d-inline-flex align-items-center justify-content-center rounded-circle fw-bold text-white"
                      style={{
                        width: 30, height: 30, fontSize: '0.72rem',
                        background: 'var(--blue)',
                      }}
                    >
                      {initials}
                    </span>
                    <span className="fw-medium d-none d-lg-inline" style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                      {user?.name?.split(' ')[0]}
                    </span>
                  </span>
                }
                id="user-dropdown"
                align="end"
              >
                <div className="px-3 py-2" style={{ minWidth: 200 }}>
                  <div className="fw-semibold small" style={{ color: 'var(--text-primary)' }}>{user?.name}</div>
                  <div className="small" style={{ color: 'var(--text-muted)' }}>{user?.email}</div>
                  <Badge
                    className={`mt-1 border-0 ${ROLE_BADGE[user?.role ?? ''] ?? 'es-badge-draft'}`}
                    style={{ fontSize: '0.7rem' }}
                  >
                    {user?.role}
                  </Badge>
                </div>
                <NavDropdown.Divider />
                <NavDropdown.Item
                  onClick={() => { setExpanded(false); navigate('/profile') }}
                  className="d-flex align-items-center gap-2"
                  style={{ fontSize: '0.9rem' }}
                >
                  <Person size={15} /> My Profile
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item
                  onClick={handleLogout}
                  className="d-flex align-items-center gap-2 text-danger"
                  style={{ fontSize: '0.9rem' }}
                >
                  <BoxArrowRight size={15} /> Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn btn-outline-primary btn-sm fw-semibold rounded-3 px-3"
                  onClick={() => setExpanded(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary btn-sm fw-semibold rounded-3 px-3"
                  onClick={() => setExpanded(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
