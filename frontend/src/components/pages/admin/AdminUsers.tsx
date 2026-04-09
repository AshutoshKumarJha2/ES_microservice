import { useEffect, useState, useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchUsers, updateUserRole, updateUserStatus } from '../../../store/slices/adminSlice'
import type { UserResponseDto } from '../../../types/events'
import styles from '../../../css/admin/AdminPanel.module.css'

const ROLES: UserResponseDto['role'][] = ['ADMIN', 'ORGANIZER', 'ATTENDEE', 'VENDOR', 'VENUE_MANAGER', 'FINANCE_OFFICER']
const PAGE_SIZE = 10

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

interface EditRoleModal {
  userId: string
  name: string
}

export const AdminUsers: React.FC = () => {
  const dispatch = useAppDispatch()
  const { allUsers, loadingUsers } = useAppSelector((state) => state.admin)

  const [search, setSearch]       = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('ALL')
  const [page, setPage]           = useState(0)
  const [editModal, setEditModal] = useState<EditRoleModal | null>(null)
  const [selectedRole, setSelectedRole] = useState<UserResponseDto['role']>('ATTENDEE')
  const [saving, setSaving]       = useState(false)

  useEffect(() => {
    dispatch(fetchUsers())
  }, [dispatch])

  // Client-side filter + search
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return allUsers.filter((u) => {
      const matchRole   = roleFilter === 'ALL' || u.role === roleFilter
      const matchSearch = !q || u.name?.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      return matchRole && matchSearch
    })
  }, [allUsers, search, roleFilter])

  // Reset to page 0 when filter changes
  useEffect(() => { setPage(0) }, [search, roleFilter])

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageUsers   = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const openEditModal = (u: UserResponseDto) => {
    setSelectedRole(u.role)
    setEditModal({ userId: u.userId, name: u.name || u.email })
  }

  const handleSaveRole = async () => {
    if (!editModal) return
    setSaving(true)
    await dispatch(updateUserRole({ userId: editModal.userId, role: selectedRole }))
    setSaving(false)
    setEditModal(null)
  }

  const handleToggleStatus = async (u: UserResponseDto) => {
    const newStatus: UserResponseDto['status'] = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
    await dispatch(updateUserStatus({ userId: u.userId, status: newStatus }))
  }

  const initials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className={styles.page}>
      {/* Banner */}
      <div className={styles.banner}>
        <div className={styles['banner-inner']}>
          <div className={styles['banner-text']}>
            <h1>User Management</h1>
            <p>View, update roles, suspend accounts</p>
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
            All Users
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
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Role chips */}
          <div className={styles['filter-row']} style={{ marginBottom: '1rem' }}>
            {['ALL', ...ROLES].map((r) => (
              <button
                key={r}
                className={`${styles.chip}${roleFilter === r ? ` ${styles.active}` : ''}`}
                onClick={() => setRoleFilter(r)}
              >
                {r === 'ALL' ? 'All' : r.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className={styles['table-wrapper']}>
            {loadingUsers ? (
              <p className={styles.loading}>Loading…</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageUsers.length === 0 ? (
                    <tr><td colSpan={5} className={styles.empty}>No users found</td></tr>
                  ) : pageUsers.map((u) => (
                    <tr key={u.userId}>
                      <td>
                        <div className={styles['user-cell']}>
                          <div className={styles.avatar}>{initials(u.name || u.email)}</div>
                          <span className={styles['user-name-cell']}>{u.name || '—'}</span>
                        </div>
                      </td>
                      <td><span className={styles['user-email-cell']}>{u.email}</span></td>
                      <td><span className={`${styles.badge} ${ROLE_BADGE[u.role] ?? ''}`}>{u.role}</span></td>
                      <td><span className={`${styles.badge} ${STATUS_BADGE[u.status] ?? styles['badge-inactive']}`}>{u.status}</span></td>
                      <td>
                        <div className={styles.actions}>
                          <button className={styles['btn-sm']} onClick={() => openEditModal(u)}>Edit Role</button>
                          {u.status === 'ACTIVE' ? (
                            <button className={styles['btn-danger']} onClick={() => handleToggleStatus(u)}>Suspend</button>
                          ) : (
                            <button className={styles['btn-success']} onClick={() => handleToggleStatus(u)}>Activate</button>
                          )}
                        </div>
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
              <span>Page {page + 1} of {totalPages} · {filtered.length} users</span>
              <button disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Role Modal */}
      {editModal && (
        <div className={styles['modal-backdrop']} onClick={() => setEditModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles['modal-title']}>Edit Role — {editModal.name}</h3>
            <div className={styles['modal-field']}>
              <label className={styles['modal-label']}>New Role</label>
              <select
                className={styles['modal-select']}
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserResponseDto['role'])}
              >
                {ROLES.map((r) => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className={styles['modal-footer']}>
              <button className={styles['modal-btn-primary']} onClick={handleSaveRole} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button className={styles['modal-btn-cancel']} onClick={() => setEditModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
