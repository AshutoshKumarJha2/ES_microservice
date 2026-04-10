import { useEffect } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchUsers } from '../../../store/slices/adminSlice'
import styles from '../../../css/admin/AdminPanel.module.css'

const ROLE_BADGE: Record<string, string> = {
  ADMIN:           styles['badge-admin'],
  ORGANIZER:       styles['badge-organizer'],
  ATTENDEE:        styles['badge-attendee'],
  VENDOR:          styles['badge-vendor'],
  FINANCE_OFFICER: styles['badge-finance'],
  VENUE_MANAGER:   styles['badge-venue'],
}

const STATUS_BADGE: Record<string, string> = {
  ACTIVE:    styles['badge-active'],
  INACTIVE:  styles['badge-inactive'],
  SUSPENDED: styles['badge-suspended'],
}

const initials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

export const AdminDashboard: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { allUsers, loadingUsers } = useAppSelector((state) => state.admin)

  useEffect(() => {
    if (allUsers.length === 0) dispatch(fetchUsers())
  }, [dispatch]) // eslint-disable-line react-hooks/exhaustive-deps

  const recentUsers = allUsers.slice(0, 5)
  const activeCount = allUsers.filter((u) => u.status === 'ACTIVE').length

  return (
    <div className={styles.page}>
      {/* Banner */}
      <div className={styles.banner}>
        <div className={styles['banner-inner']}>
          <div className={styles['banner-text']}>
            <h1>Admin Dashboard</h1>
            <p>Platform overview &amp; controls</p>
          </div>
          <div className={styles['banner-actions']}>
            <button className={styles['btn-secondary']} onClick={() => navigate('/admin/audit-logs')}>View Audit Logs</button>
            <button className={styles['btn-primary']} onClick={() => navigate('/admin/users')}>Manage Users</button>
          </div>
        </div>
      </div>

      {/* Sub-nav */}
      <div className={styles.subnav}>
        <div className={styles['subnav-inner']}>
          <NavLink to="/admin/dashboard" className={({ isActive }) => `${styles['subnav-link']}${isActive ? ` ${styles.active}` : ''}`}>Dashboard</NavLink>
          <NavLink to="/admin/users"     className={({ isActive }) => `${styles['subnav-link']}${isActive ? ` ${styles.active}` : ''}`}>Users</NavLink>
          <NavLink to="/admin/events"    className={({ isActive }) => `${styles['subnav-link']}${isActive ? ` ${styles.active}` : ''}`}>Events</NavLink>
          <NavLink to="/admin/audit-logs" className={({ isActive }) => `${styles['subnav-link']}${isActive ? ` ${styles.active}` : ''}`}>Audit Logs</NavLink>
        </div>
      </div>

      <div className={styles.content}>
        {/* Stats */}
        <div className={styles['stats-grid']}>
          <div className={`${styles['stat-card']} ${styles.blue}`}>
            <div className={styles['stat-label']}>Total Users</div>
            <div className={styles['stat-value']}>{allUsers.length}</div>
          </div>
          <div className={`${styles['stat-card']} ${styles.green}`}>
            <div className={styles['stat-label']}>Active Users</div>
            <div className={styles['stat-value']}>{activeCount}</div>
          </div>
          <div className={`${styles['stat-card']} ${styles.red}`}>
            <div className={styles['stat-label']}>Suspended</div>
            <div className={styles['stat-value']}>{allUsers.filter((u) => u.status === 'SUSPENDED').length}</div>
          </div>
          <div className={`${styles['stat-card']} ${styles.orange}`}>
            <div className={styles['stat-label']}>Admins</div>
            <div className={styles['stat-value']}>{allUsers.filter((u) => u.role === 'ADMIN').length}</div>
          </div>
        </div>

        {/* Two columns */}
        <div className={styles['two-col']}>
          {/* Recent users */}
          <div className={styles.card}>
            <div className={styles['card-title']}>
              Recent Users
              <button className={styles['btn-sm']} onClick={() => navigate('/admin/users')}>View All →</button>
            </div>
            {loadingUsers ? (
              <p className={styles.loading}>Loading…</p>
            ) : (
              <div className={styles['table-wrapper']}>
                <table>
                  <thead>
                    <tr><th>Name</th><th>Role</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {recentUsers.length === 0 ? (
                      <tr><td colSpan={3} className={styles.empty}>No users found</td></tr>
                    ) : recentUsers.map((u) => (
                      <tr key={u.userId}>
                        <td>
                          <div className={styles['user-cell']}>
                            <div className={styles.avatar}>{initials(u.name || u.email)}</div>
                            <span className={styles['user-name-cell']}>{u.name || u.email}</span>
                          </div>
                        </td>
                        <td><span className={`${styles.badge} ${ROLE_BADGE[u.role] ?? ''}`}>{u.role}</span></td>
                        <td><span className={`${styles.badge} ${STATUS_BADGE[u.status] ?? styles['badge-inactive']}`}>{u.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Activity */}
          <div className={styles.card}>
            <div className={styles['card-title']}>
              System Activity
              <button className={styles['btn-sm']} onClick={() => navigate('/admin/audit-logs')}>View Logs →</button>
            </div>
            <ul className={styles.timeline}>
              <li className={styles['timeline-item']}>
                <div className={`${styles['timeline-dot']} ${styles['dot-green']}`} />
                <div>
                  <div className={styles['timeline-text']}>Admin panel loaded — user management ready</div>
                  <div className={styles['timeline-time']}>Just now</div>
                </div>
              </li>
              <li className={styles['timeline-item']}>
                <div className={`${styles['timeline-dot']} ${styles['dot-blue']}`} />
                <div>
                  <div className={styles['timeline-text']}>Navigate to <strong>Audit Logs</strong> for full activity history</div>
                  <div className={styles['timeline-time']}>—</div>
                </div>
              </li>
              <li className={styles['timeline-item']}>
                <div className={`${styles['timeline-dot']} ${styles['dot-orange']}`} />
                <div>
                  <div className={styles['timeline-text']}>Use <strong>Users</strong> to edit roles &amp; suspend accounts</div>
                  <div className={styles['timeline-time']}>—</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
