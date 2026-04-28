import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { markNotificationRead, markAllNotificationsRead } from '../../../store/slices/notificationsSlice'
import { notificationService } from '../../../services/notifications/notificationService'
import type { AppNotification } from '../../../types/events'
import { Dropdown, Badge, Spinner } from 'react-bootstrap'
import { Bell, CheckAll } from 'react-bootstrap-icons'

const BADGE_VARIANT: Record<string, string> = {
  EVENT:        'primary',
  REGISTRATION: 'success',
  EXPENSE:      'warning',
  SYSTEM:       'secondary',
  VENUE:        'danger',
  INVOICE:      'info',
  CONTRACT:     'dark',
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function isUnread(n: AppNotification): boolean {
  return n.status?.toUpperCase() === 'UNREAD'
}

export const NotificationDropdown = () => {
  const dispatch   = useAppDispatch()
  const navigate   = useNavigate()
  const user       = useAppSelector((s) => s.auth.user)
  const unreadCount = useAppSelector((s) =>
    s.notifications.notifications.filter(isUnread).length
  )

  const [show, setShow]       = useState(false)
  const [items, setItems]     = useState<AppNotification[]>([])
  const [fetching, setFetching] = useState(false)

  const fetchUnread = useCallback(async () => {
    if (!user?.userId) return
    setFetching(true)
    try {
      const data = await notificationService.getForUser(user.userId, 5, undefined, 'UNREAD')
      setItems(data)
    } finally {
      setFetching(false)
    }
  }, [user?.userId])

  const handleToggle = (nextShow: boolean) => {
    setShow(nextShow)
    if (nextShow) fetchUnread()
  }

  const handleItemClick = (n: AppNotification) => {
    if (isUnread(n)) dispatch(markNotificationRead(n.notificationId))
    setShow(false)
    navigate('/notifications')
  }

  const handleMarkAll = async () => {
    await dispatch(markAllNotificationsRead())
    setItems((prev) => prev.map((n) => ({ ...n, status: 'READ' })))
  }

  return (
    <Dropdown show={show} onToggle={handleToggle} align="end">
      <Dropdown.Toggle
        as="button"
        bsPrefix="btn"
        aria-label="Notifications"
        className="position-relative d-inline-flex align-items-center justify-content-center p-0 rounded-3 border-0 bg-transparent"
        style={{ color: 'var(--text-secondary)', width: 34, height: 34 }}
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
      </Dropdown.Toggle>

      <Dropdown.Menu
        style={{
          minWidth: 360,
          maxHeight: 460,
          overflowY: 'auto',
          background: 'var(--bg-surface)',
          borderColor: 'var(--border-color)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          padding: 0,
        }}
      >
        {/* Header */}
        <div
          className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom"
          style={{ borderColor: 'var(--border-color)', background: 'var(--bg-subtle)' }}
        >
          <span className="fw-semibold" style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
            Notifications
          </span>
          {unreadCount > 0 && (
            <Badge bg="danger" pill style={{ fontSize: '0.65rem' }}>{unreadCount} unread</Badge>
          )}
        </div>

        {/* Body */}
        {fetching ? (
          <div className="d-flex justify-content-center align-items-center py-4">
            <Spinner animation="border" size="sm" style={{ color: 'var(--blue)' }} />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-4" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            You're all caught up ✓
          </div>
        ) : (
          items.map((n) => {
            const unread = isUnread(n)
            const cat = n.category?.toUpperCase() ?? 'SYSTEM'
            return (
              <div
                key={n.notificationId}
                className="d-flex align-items-start gap-2 px-3 py-2 border-bottom"
                onClick={() => handleItemClick(n)}
                style={{
                  cursor: 'pointer',
                  borderColor: 'var(--border-color)',
                  background: unread ? 'color-mix(in srgb, var(--blue) 4%, transparent)' : 'transparent',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-subtle)' }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = unread
                    ? 'color-mix(in srgb, var(--blue) 4%, transparent)'
                    : 'transparent'
                }}
              >
                {/* Unread dot */}
                <span
                  className="d-inline-block rounded-circle flex-shrink-0 mt-1"
                  style={{
                    width: 7, height: 7,
                    background: unread ? 'var(--blue)' : 'var(--border-color)',
                    marginTop: 5,
                  }}
                />
                <div className="flex-grow-1 min-w-0">
                  <div className="d-flex align-items-center gap-1 mb-1 flex-wrap">
                    <Badge
                      bg={BADGE_VARIANT[cat] ?? 'secondary'}
                      style={{ fontSize: '0.62rem', fontWeight: 600 }}
                    >
                      {cat}
                    </Badge>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                      {relativeTime(n.createdAt)}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      color: unread ? 'var(--text-primary)' : 'var(--text-secondary)',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {n.message}
                  </div>
                </div>
              </div>
            )
          })
        )}

        {/* Footer */}
        <div
          className="d-flex align-items-center justify-content-between px-3 py-2 border-top"
          style={{ borderColor: 'var(--border-color)', background: 'var(--bg-subtle)' }}
        >
          {unreadCount > 0 ? (
            <button
              className="btn btn-link p-0 d-flex align-items-center gap-1"
              style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textDecoration: 'none' }}
              onClick={handleMarkAll}
            >
              <CheckAll size={13} /> Mark all read
            </button>
          ) : (
            <span />
          )}
          <button
            className="btn btn-link p-0"
            style={{ fontSize: '0.78rem', color: 'var(--blue)', textDecoration: 'none', fontWeight: 500 }}
            onClick={() => { setShow(false); navigate('/notifications') }}
          >
            View all →
          </button>
        </div>
      </Dropdown.Menu>
    </Dropdown>
  )
}
