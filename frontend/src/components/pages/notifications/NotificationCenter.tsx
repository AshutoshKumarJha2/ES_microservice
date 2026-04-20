import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
  fetchNotifications,
  markNotificationRead,
  markAllReadLocally,
  sendNotification,
} from '../../../store/slices/notificationsSlice'
import type { AppNotification } from '../../../types/events'
import { Bell, CheckAll, Send } from 'react-bootstrap-icons'
import {
  Container, Table, Button, ButtonGroup, Badge, Spinner, Alert,
  Modal, Form,
} from 'react-bootstrap'

// ── Helpers ────────────────────────────────────────────────────────────────────

type FilterKey = 'ALL' | 'UNREAD' | 'EVENT' | 'EXPENSE' | 'REGISTRATION' | 'SYSTEM'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'ALL',          label: 'All' },
  { key: 'UNREAD',       label: 'Unread' },
  { key: 'EVENT',        label: 'Events' },
  { key: 'EXPENSE',      label: 'Expenses' },
  { key: 'REGISTRATION', label: 'Registrations' },
  { key: 'SYSTEM',       label: 'System' },
]

const CATEGORIES = ['EVENT', 'REGISTRATION', 'EXPENSE', 'SYSTEM', 'VENUE', 'INVOICE', 'CONTRACT']

const BADGE_VARIANT: Record<string, string> = {
  EVENT:        'primary',
  REGISTRATION: 'success',
  EXPENSE:      'warning',
  SYSTEM:       'secondary',
  VENUE:        'danger',
  INVOICE:      'info',
  CONTRACT:     'dark',
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function applyFilter(notifications: AppNotification[], filter: FilterKey): AppNotification[] {
  if (filter === 'ALL')    return notifications
  if (filter === 'UNREAD') return notifications.filter((n) => n.status === 'UNREAD')
  return notifications.filter((n) => n.category?.toUpperCase() === filter)
}

// ── Send Modal ─────────────────────────────────────────────────────────────────

interface SendModalProps {
  show: boolean
  sending: boolean
  error: string | null
  onClose: () => void
  onSend: (payload: { userId: string; message: string; category: string }) => void
}

function SendModal({ show, sending, error, onClose, onSend }: SendModalProps) {
  const [form, setForm] = useState({ userId: '', message: '', category: 'SYSTEM' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.userId.trim() || !form.message.trim()) return
    onSend(form)
  }

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <Modal.Title className="fw-semibold fs-6" style={{ color: 'var(--text-primary)' }}>
          Send Notification
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ background: 'var(--bg-surface)' }}>
        <Form id="send-notif-form" onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="es-label">Recipient User ID</Form.Label>
            <Form.Control
              value={form.userId}
              onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
              placeholder="e.g. usr_abc123"
              required className="es-form-control rounded-3"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="es-label">Category</Form.Label>
            <Form.Select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="es-form-control rounded-3"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label className="es-label">Message</Form.Label>
            <Form.Control
              as="textarea" rows={3}
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              placeholder="Enter notification message..."
              required className="es-form-control rounded-3"
            />
          </Form.Group>
          {error && <Alert variant="danger" className="py-2 mt-3 mb-0">{error}</Alert>}
        </Form>
      </Modal.Body>
      <Modal.Footer style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <Button type="submit" form="send-notif-form" variant="primary" className="rounded-3 fw-semibold" disabled={sending}>
          {sending ? <><Spinner animation="border" size="sm" className="me-2" />Sending…</> : 'Send'}
        </Button>
        <Button variant="outline-secondary" className="rounded-3" onClick={onClose}>Cancel</Button>
      </Modal.Footer>
    </Modal>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export const NotificationCenter = () => {
  const dispatch = useAppDispatch()
  const { notifications, loading, sending, error } = useAppSelector((s) => s.notifications)
  const user    = useAppSelector((s) => s.auth.user)
  const isAdmin = user?.role === 'ADMIN'

  const [filter, setFilter]       = useState<FilterKey>('ALL')
  const [showSend, setShowSend]   = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  useEffect(() => { dispatch(fetchNotifications()) }, [dispatch])

  const visible     = applyFilter(notifications, filter)
  const unreadCount = notifications.filter((n) => n.status === 'UNREAD').length

  const handleSend = async (payload: { userId: string; message: string; category: string }) => {
    setSendError(null)
    const result = await dispatch(sendNotification(payload))
    if (sendNotification.fulfilled.match(result)) {
      setShowSend(false)
      dispatch(fetchNotifications())
    } else {
      setSendError((result.payload as string) ?? 'Failed to send notification.')
    }
  }

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>

      {/* Banner */}
      <div className="es-banner">
        <Container fluid className="px-3 px-md-4 py-3">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <h1 className="fw-bold fs-3 mb-1 d-flex align-items-center gap-2">
                <Bell size={20} /> Notifications
              </h1>
              <p className="mb-0 small text-secondary">
                {unreadCount > 0
                  ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                  : "You're all caught up"}
              </p>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              {unreadCount > 0 && (
                <Button
                  variant="outline-primary" size="sm" className="rounded-3 fw-semibold"
                  onClick={() => dispatch(markAllReadLocally())}
                >
                  <CheckAll size={16} className="me-1" /> Mark All as Read
                </Button>
              )}
              {isAdmin && (
                <Button
                  variant="primary" size="sm" className="rounded-3 fw-semibold"
                  onClick={() => setShowSend(true)}
                >
                  <Send size={14} className="me-1" /> Send Notification
                </Button>
              )}
            </div>
          </div>
        </Container>
      </div>

      {/* Content */}
      <Container fluid className="px-3 px-md-4 py-4">

        {/* Filter chips */}
        <ButtonGroup className="mb-3 flex-wrap gap-1">
          {FILTERS.map((f) => (
            <Button
              key={f.key}
              size="sm"
              variant={filter === f.key ? 'primary' : 'outline-secondary'}
              className="rounded-pill"
              style={{ fontSize: '0.78rem' }}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
              {f.key === 'UNREAD' && unreadCount > 0 && ` (${unreadCount})`}
            </Button>
          ))}
        </ButtonGroup>

        {/* Table card */}
        <div className="es-card border shadow-sm rounded-3 overflow-hidden">
          {loading ? (
            <div className="text-center py-5"><Spinner animation="border" style={{ color: 'var(--blue)' }} /></div>
          ) : error ? (
            <Alert variant="danger" className="m-3">{error}</Alert>
          ) : visible.length === 0 ? (
            <p className="text-center py-5 mb-0" style={{ color: 'var(--text-muted)' }}>
              {filter === 'UNREAD' ? 'No unread notifications.' : 'No notifications found.'}
            </p>
          ) : (
            <Table hover responsive className="mb-0" style={{ fontSize: '0.88rem' }}>
              <thead style={{ background: 'var(--bg-subtle)' }}>
                <tr>
                  <th className="fw-semibold border-0 px-4 pb-2 pt-3" style={{ width: 28, color: 'var(--text-primary)' }}></th>
                  <th className="fw-semibold border-0 pb-2 pt-3" style={{ color: 'var(--text-primary)' }}>Title / Message</th>
                  <th className="fw-semibold border-0 pb-2 pt-3" style={{ color: 'var(--text-primary)' }}>Type</th>
                  <th className="fw-semibold border-0 pb-2 pt-3" style={{ color: 'var(--text-primary)' }}>Sent To</th>
                  <th className="fw-semibold border-0 pb-2 pt-3" style={{ color: 'var(--text-primary)' }}>Time</th>
                  <th className="fw-semibold border-0 pb-2 pt-3" style={{ color: 'var(--text-primary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((n) => {
                  const cat    = n.category?.toUpperCase() ?? 'SYSTEM'
                  const isUnread = n.status === 'UNREAD'
                  return (
                    <tr
                      key={n.notificationId}
                      style={isUnread ? { background: 'color-mix(in srgb, var(--blue) 4%, transparent)' } : {}}
                    >
                      {/* Status dot */}
                      <td className="align-middle ps-4">
                        <span
                          className="d-inline-block rounded-circle"
                          style={{
                            width: 8, height: 8,
                            background: isUnread ? 'var(--blue)' : 'var(--border-color)',
                          }}
                        />
                      </td>

                      {/* Title + message */}
                      <td className="align-middle" style={{ maxWidth: 300 }}>
                        <div
                          className="fw-semibold small mb-1"
                          style={{ color: isUnread ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                        >
                          {cat.charAt(0) + cat.slice(1).toLowerCase()} Notification
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{n.message}</div>
                      </td>

                      {/* Category badge */}
                      <td className="align-middle">
                        <Badge
                          bg={BADGE_VARIANT[cat] ?? 'secondary'}
                          style={{ fontSize: '0.7rem', fontWeight: 600 }}
                        >
                          {cat}
                        </Badge>
                      </td>

                      {/* Sent to */}
                      <td className="align-middle" style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {n.userId}
                      </td>

                      {/* Timestamp */}
                      <td className="align-middle" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {formatDate(n.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="align-middle">
                        {isUnread ? (
                          <Button
                            variant="outline-primary" size="sm" className="rounded-3"
                            style={{ fontSize: '0.75rem' }}
                            onClick={() => dispatch(markNotificationRead(n.notificationId))}
                          >
                            Mark Read
                          </Button>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Read</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          )}
        </div>

      </Container>

      <SendModal
        show={showSend}
        sending={sending}
        error={sendError}
        onClose={() => { setShowSend(false); setSendError(null) }}
        onSend={handleSend}
      />

    </div>
  )
}
