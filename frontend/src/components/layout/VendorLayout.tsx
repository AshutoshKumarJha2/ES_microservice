import { useEffect, useRef, useState } from 'react'
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchCurrentUser, logout } from '../../store/slices/authSlice'
import { DarkModeToggle } from '../elements/DarkModeToggle'
import styles from '../../css/vendor/Vendor.module.css'

/* ── Inline SVG Icons ──────────────────────────────────────────────────────── */

const IconChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)

const IconLogout = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

const IconPerson = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

const IconDashboard = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
  </svg>
)

const IconList = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
)

const IconX = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const ROLE_LABELS: Record<string, string> = {
  ORGANIZER: 'Organizer', ADMIN: 'Admin', ATTENDEE: 'Attendee',
  FINANCE_OFFICER: 'Finance', VENUE_MANAGER: 'Venue Mgr', VENDOR: 'Vendor',
}

/* ── Component ─────────────────────────────────────────────────────────────── */

export const VendorLayout = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user, accessToken } = useAppSelector((s) => s.auth)

  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (accessToken && !user) dispatch(fetchCurrentUser())
  }, [accessToken, user, dispatch])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  const handleLogout = () => {
    setDropdownOpen(false)
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  return (
    <div className={styles.portalWrapper}>
      {/* ── Main Navbar ─────────────────────────────────────────────────────── */}
      <nav className={styles.navbar}>
        <div className={styles.navbarInner}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoEvent}>event</span>
            <span className={styles.logoSphere}>sphere</span>
          </Link>

          <ul className={`${styles.navLinks} ${menuOpen ? styles.navLinksOpen : ''}`}>
            <li>
              <NavLink to="/" end className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`} onClick={() => setMenuOpen(false)}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`} onClick={() => setMenuOpen(false)}>
                About
              </NavLink>
            </li>
            <li>
              <NavLink to="/contact" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`} onClick={() => setMenuOpen(false)}>
                Contact
              </NavLink>
            </li>
          </ul>

          <div className={styles.navActions}>
            <DarkModeToggle />

            {user && (
              <div className={styles.userMenu} ref={dropdownRef}>
                <button
                  className={styles.userChip}
                  onClick={() => setDropdownOpen((p) => !p)}
                  aria-expanded={dropdownOpen}
                >
                  <div className={styles.userChipAvatar}>{initials}</div>
                  <span className={styles.userChipName}>{user.name?.split(' ')[0]}</span>
                  <span className={`${styles.userChipChevron} ${dropdownOpen ? styles.userChipChevronOpen : ''}`}>
                    <IconChevronDown />
                  </span>
                </button>

                {dropdownOpen && (
                  <div className={styles.dropdown}>
                    <div className={styles.dropdownHeader}>
                      <div className={styles.dropdownName}>{user.name}</div>
                      <div className={styles.dropdownEmail}>{user.email}</div>
                      <span className={styles.dropdownRole}>{ROLE_LABELS[user.role] ?? user.role}</span>
                    </div>
                    <div className={styles.dropdownDivider} />
                    <button className={styles.dropdownItem} onClick={() => { setDropdownOpen(false); navigate('/dashboard') }}>
                      <IconDashboard /> Dashboard
                    </button>
                    <button className={styles.dropdownItem} onClick={() => { setDropdownOpen(false); navigate('/profile') }}>
                      <IconPerson /> My Profile
                    </button>
                    <div className={styles.dropdownDivider} />
                    <button className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`} onClick={handleLogout}>
                      <IconLogout /> Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            <button className={styles.hamburger} onClick={() => setMenuOpen((p) => !p)} aria-label="Toggle menu">
              {menuOpen ? <IconX /> : <IconList />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Sub-Navbar (Vendor tabs) ───────────────────────────────────────── */}
      <div className={styles.subNavbar}>
        <div className={styles.subNavbarInner}>
          <span className={styles.subNavbarLabel}>Vendor Portal</span>
          <nav className={styles.subNavTabs}>
            <NavLink to="/vendor/dashboard" className={({ isActive }) => `${styles.subNavTab} ${isActive ? styles.subNavTabActive : ''}`}>
              Dashboard
            </NavLink>
            <NavLink to="/vendor/profile" className={({ isActive }) => `${styles.subNavTab} ${isActive ? styles.subNavTabActive : ''}`}>
              My Profile
            </NavLink>
            <NavLink to="/vendor/contracts" className={({ isActive }) => `${styles.subNavTab} ${isActive ? styles.subNavTabActive : ''}`}>
              Contracts
            </NavLink>
            <NavLink to="/vendor/deliveries" className={({ isActive }) => `${styles.subNavTab} ${isActive ? styles.subNavTabActive : ''}`}>
              Deliveries
            </NavLink>
            <NavLink to="/vendor/invoices" className={({ isActive }) => `${styles.subNavTab} ${isActive ? styles.subNavTabActive : ''}`}>
              Invoices
            </NavLink>
          </nav>
        </div>
      </div>

      {/* ── Page Content ───────────────────────────────────────────────────── */}
      <div className={styles.main}>
        <div className={styles.pageContent}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
