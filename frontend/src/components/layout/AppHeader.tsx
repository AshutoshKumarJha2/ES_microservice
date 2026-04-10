import React from 'react'
import { useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { toggleTheme } from '../../store/slices/uiSlice'
import type { UserResponseDto } from '../../types/events'
import styles from '../../css/layout/header/AppHeader.module.css'

// ── Breadcrumb helper ─────────────────────────────────────────────────────────

const ROUTE_LABELS: Record<string, string> = {
  organizer:    'Organizer',
  dashboard:    'Dashboard',
  events:       'Events',
  create:       'Create Event',
  edit:         'Edit Event',
  analytics:    'Analytics',
  admin:        'Admin',
  users:        'Users',
  reports:      'Reports',
  finance:      'Finance',
  budget:       'Budget & Expenses',
  venue:        'Venue',
  venues:       'Venues',
  attendee:     'Attendee',
  registrations:'Registrations',
  feedback:     'Submit Feedback',
  vendor:       'Vendor',
  services:     'Services',
}

const buildBreadcrumb = (pathname: string) => {
  const parts = pathname.split('/').filter(Boolean)
  return parts.map((part, i) => ({
    label: ROUTE_LABELS[part] ?? (part.length > 12 ? `${part.slice(0, 8)}…` : part),
    isLast: i === parts.length - 1,
  }))
}

// ── Role chip styles ──────────────────────────────────────────────────────────

const ROLE_CHIP_CLASS: Record<UserResponseDto['role'], string> = {
  ORGANIZER:       styles.organizer,
  ADMIN:           styles.admin,
  ATTENDEE:        styles.attendee,
  FINANCE_OFFICER: styles.finance,
  VENUE_MANAGER:   styles.venue,
  VENDOR:          styles.vendor,
}

const ROLE_LABELS: Record<UserResponseDto['role'], string> = {
  ORGANIZER:       'Organizer',
  ADMIN:           'Admin',
  ATTENDEE:        'Attendee',
  FINANCE_OFFICER: 'Finance',
  VENUE_MANAGER:   'Venue Mgr',
  VENDOR:          'Vendor',
}

// ── Inline SVG Icons ──────────────────────────────────────────────────────────

const IconSun = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)

const IconMoon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)

const IconChevron = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)

const IconMenu = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
)

// ── Component ─────────────────────────────────────────────────────────────────

export const AppHeader: React.FC = () => {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const { user } = useAppSelector((state) => state.auth)
  const { theme } = useAppSelector((state) => state.ui)

  const breadcrumbs = buildBreadcrumb(location.pathname)
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)
    : '?'

  return (
    <header className={styles.header}>
      {/* Left: hamburger + breadcrumb */}
      <div className={styles.left}>
        <button
          className={styles['menu-btn']}
          aria-label="Open sidebar"
          // On mobile this can open the sidebar overlay; desktop handled by Sidebar itself
        >
          <IconMenu />
        </button>

        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && (
                <span className={styles['breadcrumb-sep']}>
                  <IconChevron />
                </span>
              )}
              <span
                className={`${styles['breadcrumb-item']}${crumb.isLast ? ` ${styles.active}` : ''}`}
              >
                {crumb.label}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right: theme toggle + user pill */}
      <div className={styles.right}>
        <button
          className={styles['theme-btn']}
          onClick={() => dispatch(toggleTheme())}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <IconMoon /> : <IconSun />}
        </button>

        {user && (
          <div className={styles['user-pill']}>
            <div className={styles['user-avatar']}>{initials}</div>
            <span className={styles['user-name']}>{user.name}</span>
            <span className={`${styles['role-chip']} ${ROLE_CHIP_CLASS[user.role]}`}>
              {ROLE_LABELS[user.role]}
            </span>
          </div>
        )}
      </div>
    </header>
  )
}
