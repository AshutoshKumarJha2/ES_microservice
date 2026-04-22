import React from 'react'
import { useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { toggleTheme } from '../../store/slices/uiSlice'
import type { UserResponseDto } from '../../types/events'
import { Navbar, Container, Breadcrumb, Badge, Button } from 'react-bootstrap'
import { SunFill, MoonFill } from 'react-bootstrap-icons'

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

const ROLE_BADGE_CLASS: Record<UserResponseDto['role'], string> = {
  ORGANIZER:       'es-badge-organizer',
  ADMIN:           'es-badge-admin',
  ATTENDEE:        'es-badge-attendee',
  FINANCE_OFFICER: 'es-badge-finance',
  VENUE_MANAGER:   'es-badge-venue',
  VENDOR:          'es-badge-vendor',
}

const ROLE_LABELS: Record<UserResponseDto['role'], string> = {
  ORGANIZER:       'Organizer',
  ADMIN:           'Admin',
  ATTENDEE:        'Attendee',
  FINANCE_OFFICER: 'Finance',
  VENUE_MANAGER:   'Venue Mgr',
  VENDOR:          'Vendor',
}

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
    <Navbar
      className="es-app-header border-bottom px-0 py-2"
      style={{ minHeight: 56 }}
    >
      <Container fluid className="px-3 px-md-4 d-flex justify-content-between align-items-center">

        {/* Left: breadcrumb */}
        <Breadcrumb className="mb-0" listProps={{ className: 'mb-0 align-items-center' }}>
          {breadcrumbs.map((crumb, idx) => (
            <Breadcrumb.Item
              key={idx}
              active={crumb.isLast}
              style={{
                color: crumb.isLast ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: crumb.isLast ? 600 : 400,
                fontSize: '0.88rem',
              }}
            >
              {crumb.label}
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>

        {/* Right: theme toggle + user pill */}
        <div className="d-flex align-items-center gap-2">
          <Button
            variant="outline-secondary"
            size="sm"
            className="rounded-circle d-flex align-items-center justify-content-center p-0"
            style={{ width: 32, height: 32, borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
            onClick={() => dispatch(toggleTheme())}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <MoonFill size={13} /> : <SunFill size={13} />}
          </Button>

          {user && (
            <div className="d-flex align-items-center gap-2">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle fw-bold text-white"
                style={{ width: 30, height: 30, fontSize: '0.7rem', background: 'var(--blue)', flexShrink: 0 }}
              >
                {initials}
              </div>
              <span className="fw-medium d-none d-sm-inline" style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                {user.name}
              </span>
              <Badge
                className={`${ROLE_BADGE_CLASS[user.role]} border-0`}
                style={{ fontSize: '0.7rem' }}
              >
                {ROLE_LABELS[user.role]}
              </Badge>
            </div>
          )}
        </div>

      </Container>
    </Navbar>
  )
}
