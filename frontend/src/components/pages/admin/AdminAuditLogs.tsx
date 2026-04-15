import { useEffect, useState, useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchAuditLogs } from '../../../store/slices/adminSlice'
import styles from '../../../css/admin/AdminPanel.module.css'

const PAGE_SIZE = 15

export const AdminAuditLogs: React.FC = () => {
  const dispatch = useAppDispatch()
  const { auditLogs, loadingLogs } = useAppSelector((state) => state.admin)

  const [search, setSearch] = useState('')
  const [from, setFrom]     = useState('')
  const [to, setTo]         = useState('')
  const [page, setPage]     = useState(0)

  // Fetch all logs on mount (server returns a page; we filter client-side)
  useEffect(() => {
    dispatch(fetchAuditLogs({ size: 500 }))
  }, [dispatch])

  const filtered = useMemo(() => {
    const logs = auditLogs?.audits ?? []
    const q = search.toLowerCase()
    const fromTs = from ? new Date(from).getTime() : null
    const toTs   = to   ? new Date(to + 'T23:59:59').getTime() : null
    return logs.filter((log) => {
      const matchSearch = !q || log.userId?.toLowerCase().includes(q) || log.action?.toLowerCase().includes(q) || log.entityName?.toLowerCase().includes(q) || log.entityId?.toLowerCase().includes(q)
      const ts = new Date(log.timeStamp).getTime()
      const matchFrom = !fromTs || ts >= fromTs
      const matchTo   = !toTs   || ts <= toTs
      return matchSearch && matchFrom && matchTo
    })
  }, [auditLogs, search, from, to])

  useEffect(() => { setPage(0) }, [search, from, to])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageLogs   = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    } catch { return iso }
  }

  const handleExportCSV = () => {
    if (!filtered.length) return
    const header = 'ID,Timestamp,UserId,Action,EntityId,EntityName\n'
    const rows = filtered.map((log) =>
      [log.auditId, log.timeStamp, log.userId, log.action, log.entityId, `"${log.entityName?.replace(/"/g, '""') ?? ''}"`].join(',')
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'audit-logs.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={styles.page}>
      {/* Banner */}
      <div className={styles.banner}>
        <div className={styles['banner-inner']}>
          <div className={styles['banner-text']}>
            <h1>Audit Logs</h1>
            <p>Full activity history across the platform</p>
          </div>
          <div className={styles['banner-actions']}>
            <button className={styles['btn-secondary']} onClick={handleExportCSV} disabled={!filtered.length}>
              Export CSV
            </button>
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
            Audit Logs
            <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-muted)' }}>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Filters */}
          <div className={styles.toolbar} style={{ marginBottom: '1rem' }}>
            <div className={styles['search-wrap']}>
              <span className={styles['search-icon']}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </span>
              <input
                className={styles['search-input']}
                placeholder="Search actor, action, details…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <input type="date" className={styles['filter-select']} value={from} onChange={(e) => setFrom(e.target.value)} title="From" />
            <input type="date" className={styles['filter-select']} value={to}   onChange={(e) => setTo(e.target.value)}   title="To" />
            {(search || from || to) && (
              <button
                className={styles['btn-outline']}
                onClick={() => { setSearch(''); setFrom(''); setTo('') }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Table */}
          <div className={styles['table-wrapper']}>
            {loadingLogs ? (
              <p className={styles.loading}>Loading…</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User ID</th>
                    <th>Action</th>
                    <th>Entity</th>
                    <th>Entity Name</th>
                  </tr>
                </thead>
                <tbody>
                  {pageLogs.length === 0 ? (
                    <tr><td colSpan={5} className={styles.empty}>No audit logs found</td></tr>
                  ) : pageLogs.map((log) => (
                    <tr key={log.auditId}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}>{formatDate(log.timeStamp)}</td>
                      <td>
                        <div className={styles['user-cell']}>
                          <div className={styles.avatar}>{(log.userId || '?').slice(0, 2).toUpperCase()}</div>
                          <div>
                            <div className={styles['user-name-cell']}>{log.userId}</div>
                          </div>
                        </div>
                      </td>
                      <td><code style={{ fontSize: '0.8rem', color: 'var(--saffron)' }}>{log.action}</code></td>
                      <td>
                        <span className={`${styles.badge} ${styles['badge-draft']}`} style={{ fontSize: '0.65rem' }}>
                          {log.entityId}
                        </span>
                      </td>
                      <td style={{ maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.83rem' }} title={log.entityName}>
                        {log.entityName || '—'}
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
              <span>Page {page + 1} of {totalPages} · {filtered.length} logs</span>
              <button disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
