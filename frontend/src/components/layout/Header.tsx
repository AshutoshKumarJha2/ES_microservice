import { useEffect, useRef, useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { logout } from '../../store/slices/authSlice'
import { BoxArrowRight, ChevronDown, List, Person, Speedometer2, X } from 'react-bootstrap-icons'
import styles from '../../css/layout/Header.module.css'
import { DarkModeToggle } from '../elements/DarkModeToggle'

export const Header = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleLogout = () => {
    setDropdownOpen(false)
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>

        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <span className={styles['logo-event']}>event</span>
          <span className={styles['logo-sphere']}>sphere</span>
        </Link>

        {/* Nav links */}
        <ul className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
          <li>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.active : ''}`
              }
              onClick={() => setMenuOpen(false)}
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.active : ''}`
              }
              onClick={() => setMenuOpen(false)}
            >
              About
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.active : ''}`
              }
              onClick={() => setMenuOpen(false)}
            >
              Contact
            </NavLink>
          </li>
        </ul>

        {/* Right actions */}
        <div className={styles.actions}>
          <DarkModeToggle />

          {isAuthenticated ? (
            <div className={styles['user-menu']} ref={dropdownRef}>
              {/* User chip — clickable */}
              <button
                className={styles['user-chip']}
                onClick={() => setDropdownOpen((prev) => !prev)}
                aria-expanded={dropdownOpen}
              >
                <div className={styles.avatar}>{initials}</div>
                {user?.name && (
                  <span className={styles['user-name']}>{user.name.split(' ')[0]}</span>
                )}
                <ChevronDown
                  size={12}
                  className={`${styles.chevron} ${dropdownOpen ? styles['chevron-open'] : ''}`}
                />
              </button>

              {/* Dropdown panel */}
              {dropdownOpen && (
                <div className={styles.dropdown}>
                  <div className={styles['dropdown-header']}>
                    <div className={styles['dropdown-name']}>{user?.name}</div>
                    <div className={styles['dropdown-email']}>{user?.email}</div>
                    <span className={styles['dropdown-role']}>{user?.role}</span>
                  </div>
                  <div className={styles['dropdown-divider']} />
                  <button
                    className={styles['dropdown-item']}
                    onClick={() => { setDropdownOpen(false); navigate('/dashboard') }}
                  >
                    <Speedometer2 size={15} /> Dashboard
                  </button>
                  <button
                    className={styles['dropdown-item']}
                    onClick={() => { setDropdownOpen(false); navigate('/profile') }}
                  >
                    <Person size={15} /> My Profile
                  </button>
                  <div className={styles['dropdown-divider']} />
                  <button
                    className={`${styles['dropdown-item']} ${styles['dropdown-item-danger']}`}
                    onClick={handleLogout}
                  >
                    <BoxArrowRight size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className={styles['btn-login']}>Sign In</Link>
              <Link to="/register" className={styles['btn-register']}>Register</Link>
            </>
          )}

          {/* Hamburger */}
          <button
            className={styles.hamburger}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <List size={22} />}
          </button>
        </div>

      </div>
    </nav>
  )
}
