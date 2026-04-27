import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { logout } from '../../store/slices/authSlice'
import { clearAuthHeader } from '../../api/axiosInstance'
import { BoxArrowRight, Person } from 'react-bootstrap-icons'
import { DarkModeToggle } from '../elements/DarkModeToggle'
import { userInitials, roleBadgeClass } from '../../utils/badgeHelpers'
import { Nav, Container, NavDropdown, Badge, Navbar, Dropdown } from 'react-bootstrap'
import { NotificationDropdown } from '../elements/notifications/NotificationDropdown'

const NAV_LINK_STYLE = { fontSize: '0.9rem', color: 'var(--text-primary)' }

export const Header = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    clearAuthHeader()
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  const initials = userInitials(user?.name)

  const profileOrAuth = isAuthenticated ? (
    <NavDropdown
      title={
        <span className="d-inline-flex align-items-center gap-2">
          <span
            className="d-inline-flex align-items-center justify-content-center rounded-circle fw-bold text-white"
            style={{ width: 30, height: 30, fontSize: '0.72rem', background: 'var(--blue)' }}
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
          className={`mt-1 border-0 ${roleBadgeClass(user?.role ?? '')}`}
          style={{ fontSize: '0.7rem' }}
        >
          {user?.role}
        </Badge>
      </div>
      <NavDropdown.Divider />
      <NavDropdown.Item
        onClick={() => navigate('/profile')}
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
      <Link to="/login"    className="btn btn-outline-primary btn-sm fw-semibold rounded-3 px-3">Sign In</Link>
      <Link to="/register" className="btn btn-primary btn-sm fw-semibold rounded-3 px-3">Register</Link>
    </>
  )

  const mobileNavItems = (
    <>
      {user?.role === 'ATTENDEE' && (
        <>
          <Dropdown.Item as={Link} to="/events"                 onClick={() => setMenuOpen(false)} style={{ fontSize: '0.9rem' }}>Browse Events</Dropdown.Item>
          <Dropdown.Item as={Link} to="/attendee/registrations" onClick={() => setMenuOpen(false)} style={{ fontSize: '0.9rem' }}>My Registrations</Dropdown.Item>
        </>
      )}
      {user?.role === 'ORGANIZER' && (
        <Dropdown.Item as={Link} to="/organizer/dashboard" onClick={() => setMenuOpen(false)} style={{ fontSize: '0.9rem' }}>Dashboard</Dropdown.Item>
      )}
      {user?.role === 'ADMIN' && (
        <Dropdown.Item as={Link} to="/admin/dashboard" onClick={() => setMenuOpen(false)} style={{ fontSize: '0.9rem' }}>Dashboard</Dropdown.Item>
      )}
      {user?.role === 'FINANCE_OFFICER' && (
        <>
          <Dropdown.Item as={Link} to="/finance/expenses" onClick={() => setMenuOpen(false)} style={{ fontSize: '0.9rem' }}>Expenses</Dropdown.Item>
          <Dropdown.Item as={Link} to="/finance/payments" onClick={() => setMenuOpen(false)} style={{ fontSize: '0.9rem' }}>Payments</Dropdown.Item>
          <Dropdown.Item as={Link} to="/finance/budget"   onClick={() => setMenuOpen(false)} style={{ fontSize: '0.9rem' }}>Budget</Dropdown.Item>
        </>
      )}
    </>
  )

  return (
    <Navbar
      expand="lg"
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

        {/* Desktop: nav links */}
        <Nav className="d-none d-lg-flex me-auto">
          {user?.role === 'ATTENDEE' && (
            <>
              <Nav.Link as={Link} to="/events"                 style={NAV_LINK_STYLE}>Browse Events</Nav.Link>
              <Nav.Link as={Link} to="/attendee/registrations" style={NAV_LINK_STYLE}>My Registrations</Nav.Link>
            </>
          )}
          {user?.role === 'ORGANIZER' && (
            <Nav.Link as={Link} to="/organizer/dashboard" style={NAV_LINK_STYLE}>Dashboard</Nav.Link>
          )}
          {user?.role === 'ADMIN' && (
            <Nav.Link as={Link} to="/admin/dashboard" style={NAV_LINK_STYLE}>Dashboard</Nav.Link>
          )}
          {user?.role === 'FINANCE_OFFICER' && (
            <>
              <Nav.Link as={Link} to="/finance/expenses" style={NAV_LINK_STYLE}>Expenses</Nav.Link>
              <Nav.Link as={Link} to="/finance/payments" style={NAV_LINK_STYLE}>Payments</Nav.Link>
              <Nav.Link as={Link} to="/finance/budget"   style={NAV_LINK_STYLE}>Budget</Nav.Link>
            </>
          )}
        </Nav>

        {/* Mobile: always-visible right actions */}
        <div className="d-flex d-lg-none align-items-center gap-2 ms-auto me-2 mobile-actions">
          <DarkModeToggle />
          {isAuthenticated && <NotificationDropdown />}
          {profileOrAuth}
        </div>

        {/* Mobile: hamburger dropdown */}
        <Dropdown show={menuOpen} onToggle={setMenuOpen} align="end" className="d-lg-none">
          <Dropdown.Toggle as="button" bsPrefix="btn" className="navbar-toggler p-1">
            <span className="navbar-toggler-icon" />
          </Dropdown.Toggle>
          <Dropdown.Menu style={{ minWidth: 180, zIndex: 1050 }}>
            {mobileNavItems}
          </Dropdown.Menu>
        </Dropdown>

        {/* Desktop: right actions */}
        <div className="d-none d-lg-flex align-items-center gap-2">
          <DarkModeToggle />
          {isAuthenticated && <NotificationDropdown />}
          {profileOrAuth}
        </div>
      </Container>
    </Navbar>
  )
}
