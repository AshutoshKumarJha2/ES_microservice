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
import styles from '../../../css/notifications/Notifications.module.css'

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

function badgeClass(category: string): string {
  const map: Record<string, string> = {
    EVENT:        styles['badge-event'],
    REGISTRATION: styles['badge-registration'],
    EXPENSE:      styles['badge-expense'],
    SYSTEM:       styles['badge-system'],
    VENUE:        styles['badge-venue'],
    INVOICE:      styles['badge-invoice'],
    CONTRACT:     styles['badge-contract'],
  }
  return map[category?.toUpperCase()] ?? styles['badge-default']
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
  sending: boolean
  error: string | null
  onClose: () => void
  onSend: (payload: { userId: string; message: string; category: string }) => void
}

function SendModal({ sending, error, onClose, onSend }: SendModalProps) {
  const [form, setForm] = useState({ userId: '', message: '', category: 'SYSTEM' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.userId.trim() || !form.message.trim()) return
    onSend(form)
  }

  return (
    <div className={styles['modal-backdrop']} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className={styles.modal}>
        <div className={styles['modal-title']}>Send Notification</div>

        <form onSubmit={handleSubmit}>
          <div className={styles['modal-grid']}>
            <div className={`${styles['modal-field']} ${styles.full}`}>
              <label className={styles['modal-label']}>Recipient User ID</label>
              <input
                className={styles['modal-input']}
                value={form.userId}
                onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
                placeholder="e.g. usr_abc123"
                required
              />
            </div>

            <div className={`${styles['modal-field']} ${styles.full}`}>
              <label className={styles['modal-label']}>Category</label>
              <select
                className={styles['modal-select']}
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </div>

            <div className={`${styles['modal-field']} ${styles.full}`}>
              <label className={styles['modal-label']}>Message</label>
              <textarea
                className={styles['modal-textarea']}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="Enter notification message..."
                required
              />
            </div>
          </div>

          {error && <div className={styles['error-msg']}>{error}</div>}

          <div className={styles['modal-footer']}>
            <button type="submit" className={styles['modal-btn-primary']} disabled={sending}>
              {sending ? 'Sending…' : 'Send'}
            </button>
            <button type="button" className={styles['modal-btn-cancel']} onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export const NotificationCenter = () => {
  const dispatch = useAppDispatch()
  const { notifications, loading, sending, error } = useAppSelector((s) => s.notifications)
  const user = useAppSelector((s) => s.auth.user)
  const isAdmin = user?.role === 'ADMIN'

  const [filter, setFilter]       = useState<FilterKey>('ALL')
  const [showSend, setShowSend]   = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchNotifications())
  }, [dispatch])

  const visible = applyFilter(notifications, filter)
  const unreadCount = notifications.filter((n) => n.status === 'UNREAD').length

  const handleMarkAll = () => {
    dispatch(markAllReadLocally())
  }

  const handleMarkOne = (id: string) => {
    dispatch(markNotificationRead(id))
  }

  const handleSend = async (payload: { userId: string; message: string; category: string }) => {
    setSendError(null)
    const result = await dispatch(sendNotification(payload))
    if (sendNotification.fulfilled.match(result)) {
      setShowSend(false)
      dispatch(fetchNotifications())
    } else {
      setSendError(result.payload as string ?? 'Failed to send notification.')
    }
  }

  return (
    <div className={styles.page}>

      {/* ── Banner ── */}
      <div className={styles.banner}>
        <div className={styles['banner-inner']}>
          <div className={styles['banner-text']}>
            <h1><Bell size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />Notifications</h1>
            <p>
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                : "You're all caught up"}
            </p>
          </div>
          <div className={styles['banner-actions']}>
            {unreadCount > 0 && (
              <button className={styles['btn-outline']} onClick={handleMarkAll}>
                <CheckAll size={16} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
                Mark All as Read
              </button>
            )}
            {isAdmin && (
              <button className={styles['btn-primary']} onClick={() => setShowSend(true)}>
                <Send size={14} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
                Send Notification
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className={styles.content}>

        {/* Filter chips */}
        <div className={styles['filter-row']}>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`${styles.chip}${filter === f.key ? ` ${styles.active}` : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
              {f.key === 'UNREAD' && unreadCount > 0 && ` (${unreadCount})`}
            </button>
          ))}
        </div>

        {/* Table card */}
        <div className={styles.card}>
          <div className={styles['table-wrapper']}>
            {loading ? (
              <div className={styles.loading}>Loading notifications…</div>
            ) : visible.length === 0 ? (
              <div className={styles.empty}>
                {filter === 'UNREAD' ? 'No unread notifications.' : 'No notifications found.'}
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 28 }}></th>
                    <th>Title / Message</th>
                    <th>Type</th>
                    <th>Sent To</th>
                    <th>Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((n) => (
                    <tr
                      key={n.notificationId}
                      className={n.status === 'UNREAD' ? styles['row-unread'] : ''}
                    >
                      {/* Dot */}
                      <td className={styles['dot-cell']}>
                        <span className={`${styles.dot} ${n.status === 'UNREAD' ? styles['dot-unread'] : styles['dot-read']}`} />
                      </td>

                      {/* Title + message */}
                      <td>
                        <div className={`${styles['notif-title']}${n.status === 'READ' ? ` ${styles.read}` : ''}`}>
                          {n.category?.charAt(0).toUpperCase() + n.category?.slice(1).toLowerCase()} Notification
                        </div>
                        <div className={styles['notif-message']}>{n.message}</div>
                      </td>

                      {/* Category badge */}
                      <td>
                        <span className={`${styles.badge} ${badgeClass(n.category)}`}>
                          {n.category}
                        </span>
                      </td>

                      {/* Sent to */}
                      <td>
                        <span className={styles.timestamp}>{n.userId}</span>
                      </td>

                      {/* Timestamp */}
                      <td>
                        <span className={styles.timestamp}>{formatDate(n.createdAt)}</span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className={styles.actions}>
                          {n.status === 'UNREAD' && (
                            <button
                              className={styles['btn-sm']}
                              onClick={() => handleMarkOne(n.notificationId)}
                            >
                              Mark Read
                            </button>
                          )}
                          {n.status === 'READ' && (
                            <span className={styles['btn-sm-muted']} style={{ cursor: 'default' }}>
                              Read
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {error && <div className={styles['error-msg']}>{error}</div>}
      </div>

      {/* ── Send Modal ── */}
      {showSend && (
        <SendModal
          sending={sending}
          error={sendError}
          onClose={() => { setShowSend(false); setSendError(null) }}
          onSend={handleSend}
        />
      )}
    </div>
  )
}
