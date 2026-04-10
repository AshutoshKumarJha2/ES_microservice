import { useEffect, useState, useMemo } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import axiosInstance from '../../../api/axiosInstance'
import styles from '../../../css/admin/AdminPanel.module.css'

interface EventDto {
  id: string
  name: string
  organizerName?: string
  startDate?: string
  endDate?: string
  venueName?: string
  status?: string
}

const STATUS_BADGE: Record<string, string> = {
  PUBLISHED: styles['badge-published'],
  DRAFT:     styles['badge-draft'],
  COMPLETED: styles['badge-completed'],
  CANCELLED: styles['badge-cancelled'],
}

const STATUSES = ['ALL', 'PUBLISHED', 'DRAFT', 'COMPLETED', 'CANCELLED']
const PAGE_SIZE = 10

export const AdminEvents: React.FC = () => {
  const navigate = useNavigate()
  const [allEvents, setAllEvents] = useState<EventDto[]>([])
  const [loading, setLoading]     = useState(false)
  const [search, setSearch]       = useState('')
  const [status, setStatus]       = useState('ALL')
  const [page, setPage]           = useState(0)

  useEffect(() => {
    setLoading(true)
    axiosInstance.get('/api/v1/event-manager/events')
      .then(({ data }) => {
        setAllEvents(Array.isArray(data) ? data : (data.content ?? []))
      })
      .catch(() => setAllEvents([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return allEvents.filter((ev) => {
      const matchStatus = status === 'ALL' || ev.status === status
      const matchSearch = !q || ev.name.toLowerCase().includes(q) || ev.organizerName?.toLowerCase().includes(q)
      return matchStatus && matchSearch
    })
  }, [allEvents, search, status])

  useEffect(() => { setPage(0) }, [search, status])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageEvents = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const formatDate = (iso?: string) => {
    if (!iso) return '—'
    try { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
    catch { return iso }
  }

  return (
    <div className={styles.page}>
      {/* Banner */}
      <div className={styles.banner}>
        <div className={styles['banner-inner']}>
          <div className={styles['banner-text']}>
            <h1>All Events</h1>
            <p>Monitor every event on the platform</p>
          </div>
        </div>
      </div>

      {/* Sub-nav */}
      <div className={styles.subnav}>
        <div className={styles['subnav-inner']}>
          <NavLink to="/admin/dashboard"  className={({ isActive }) => `${styles['subnav-link']}${isActive ? ` ${styles.active}` : ''}`}>Dashboard</NavLink>
          <NavLink to="/admin/users"      className={({ isActive }) => `${styles['subnav-link']}${isActive ? ` ${styles.active}` : ''}`}>Users</NavLink>
          <NavLink to="/admin/events"     className={({ isActive }) => `${styles['subnav-link']}${isActive ? ` ${styles.active}` : ''}`}>Events</NavLink>
          <NavLink to="/admin/audit-logs" className={({ isActive }) => `${styles['subnav-link']}${isActive ? ` ${styles.active}` : ''}`}>Audit Logs</NavLink>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles['card-title']}>
            All Events
            <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-muted)' }}>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Toolbar */}
          <div className={styles.toolbar} style={{ marginBottom: '0.85rem' }}>
            <div className={styles['search-wrap']}>
              <span className={styles['search-icon']}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </span>
              <input
                className={styles['search-input']}
                placeholder="Search events…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className={styles['filter-select']}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className={styles['table-wrapper']}>
            {loading ? (
              <p className={styles.loading}>Loading…</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Organizer</th>
                    <th>Dates</th>
                    <th>Venue</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageEvents.length === 0 ? (
                    <tr><td colSpan={6} className={styles.empty}>No events found</td></tr>
                  ) : pageEvents.map((ev) => (
                    <tr key={ev.id}>
                      <td><strong>{ev.name}</strong></td>
                      <td>{ev.organizerName || '—'}</td>
                      <td>
                        {ev.startDate ? formatDate(ev.startDate) : '—'}
                        {ev.endDate && ev.endDate !== ev.startDate ? ` – ${formatDate(ev.endDate)}` : ''}
                      </td>
                      <td>{ev.venueName || '—'}</td>
                      <td>
                        {ev.status
                          ? <span className={`${styles.badge} ${STATUS_BADGE[ev.status] ?? styles['badge-draft']}`}>{ev.status}</span>
                          : '—'}
                      </td>
                      <td>
                        <button className={styles['btn-sm']} onClick={() => navigate(`/organizer/events/${ev.id}`)}>View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {filtered.length > PAGE_SIZE && (
            <div className={styles.pagination} style={{ marginTop: '1rem' }}>
              <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>← Prev</button>
              <span>Page {page + 1} of {totalPages} · {filtered.length} events</span>
              <button disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
