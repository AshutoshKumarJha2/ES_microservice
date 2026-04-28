import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchUsers, updateUserRole, updateUserStatus } from '../../../store/slices/adminSlice'
import type { UserResponseDto } from '../../../types/events'
import { AdminSubNav } from '../../elements/admin/AdminSubNav'
import { PageBanner } from '../../elements/common/PageBanner'
import { PaginationBar } from '../../elements/common/PaginationBar'
import { roleBadgeClass, userStatusBadgeClass, userInitials } from '../../../utils/badgeHelpers'
import {
  Container, Card, Table, Badge, Button, Modal, Form,
  InputGroup, ButtonGroup, Spinner,
} from 'react-bootstrap'
import { TableRowsSkeleton } from '../../elements/skeletons/PageSkeleton'
import { Search } from 'react-bootstrap-icons'

const ROLES: UserResponseDto['role'][]     = ['ADMIN', 'ORGANIZER', 'ATTENDEE', 'VENDOR', 'VENUE_MANAGER', 'FINANCE_OFFICER']
const STATUSES: UserResponseDto['status'][] = ['ACTIVE', 'INACTIVE', 'SUSPENDED']
const PAGE_SIZE = 10

interface EditRoleModal { userId: string; name: string }

export const AdminUsers: React.FC = () => {
  const dispatch = useAppDispatch()
  const { allUsers, loadingUsers, totalUsers, totalUserPages } = useAppSelector((state) => state.admin)

  const [search, setSearch]             = useState('')
  const [roleFilter, setRoleFilter]     = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [page, setPage]                 = useState(0)
  const [editModal, setEditModal]       = useState<EditRoleModal | null>(null)
  const [selectedRole, setSelectedRole] = useState<UserResponseDto['role']>('ATTENDEE')
  const [saving, setSaving]             = useState(false)

  const [debouncedSearch, setDebouncedSearch] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const buildParams = (p: number) => ({
    search: debouncedSearch || undefined,
    role:   roleFilter   !== 'ALL' ? roleFilter   : undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    page:   p,
    size:   PAGE_SIZE,
  })

  useEffect(() => {
    setPage(0)
    dispatch(fetchUsers(buildParams(0)))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, roleFilter, statusFilter, dispatch])

  const handlePageChange = (p: number) => {
    setPage(p)
    dispatch(fetchUsers(buildParams(p)))
  }

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

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <PageBanner title="User Management" subtitle="View, update roles, suspend accounts" />

      <AdminSubNav />

      <Container fluid className="px-3 px-md-4 py-4">
        <Card className="es-card border shadow-sm">
          <Card.Body className="p-3 p-md-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Card.Title className="mb-0 fw-semibold" style={{ color: 'var(--text-primary)' }}>
                All Users
              </Card.Title>
              <span className="small" style={{ color: 'var(--text-muted)' }}>
                {totalUsers} result{totalUsers !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Search */}
            <InputGroup className="mb-3" style={{ maxWidth: 420 }}>
              <InputGroup.Text style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                <Search size={14} style={{ color: 'var(--text-muted)' }} />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="es-form-control"
              />
            </InputGroup>

            {/* Role filters */}
            <div className="mb-1" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Role</div>
            <ButtonGroup className="flex-wrap gap-1 mb-3">
              {['ALL', ...ROLES].map((r) => (
                <Button
                  key={r}
                  size="sm"
                  variant={roleFilter === r ? 'primary' : 'outline-secondary'}
                  className="rounded-pill"
                  onClick={() => setRoleFilter(r)}
                  style={{ fontSize: '0.78rem' }}
                >
                  {r === 'ALL' ? 'All' : r.replace('_', ' ')}
                </Button>
              ))}
            </ButtonGroup>

            {/* Status filters */}
            <div className="mb-1" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</div>
            <ButtonGroup className="flex-wrap gap-1 mb-3">
              {['ALL', ...STATUSES].map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={statusFilter === s ? 'primary' : 'outline-secondary'}
                  className="rounded-pill"
                  onClick={() => setStatusFilter(s)}
                  style={{ fontSize: '0.78rem' }}
                >
                  {s === 'ALL' ? 'All' : s}
                </Button>
              ))}
            </ButtonGroup>

            {/* Table */}
            <Table hover responsive className="mb-0" style={{ fontSize: '0.88rem', tableLayout: 'fixed', textAlign: 'left' }}>
              <thead style={{ background: 'var(--bg-subtle)' }}>
                <tr>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)', width: '20%' }}>User</th>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)', width: '28%' }}>Email</th>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)', width: '18%' }}>Role</th>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)', width: '14%' }}>Status</th>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)', width: '20%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingUsers ? <TableRowsSkeleton rows={10} cols={5} colWidths={['55%','78%','38%','34%','58%']} /> : allUsers.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-4" style={{ color: 'var(--text-muted)' }}>No users found</td></tr>
                  ) : allUsers.map((u) => (
                    <tr key={u.userId}>
                      <td className="align-middle">
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="d-flex align-items-center justify-content-center rounded-circle fw-bold text-white flex-shrink-0"
                            style={{ width: 28, height: 28, fontSize: '0.65rem', background: 'var(--blue)' }}
                          >
                            {userInitials(u.name || u.email)}
                          </div>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{u.name || '—'}</span>
                        </div>
                      </td>
                      <td className="align-middle" style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td className="align-middle">
                        <Badge className={`${roleBadgeClass(u.role)} border-0`} style={{ fontSize: '0.7rem' }}>{u.role}</Badge>
                      </td>
                      <td className="align-middle">
                        <Badge className={`${userStatusBadgeClass(u.status)} border-0`} style={{ fontSize: '0.7rem' }}>{u.status}</Badge>
                      </td>
                      <td className="align-middle">
                        <div className="d-flex gap-1 flex-wrap">
                          <Button variant="outline-primary" size="sm" className="rounded-3" style={{ fontSize: '0.78rem' }} onClick={() => openEditModal(u)}>
                            Edit Role
                          </Button>
                          {u.status === 'ACTIVE' ? (
                            <Button variant="outline-danger" size="sm" className="rounded-3" style={{ fontSize: '0.78rem' }} onClick={() => handleToggleStatus(u)}>
                              Suspend
                            </Button>
                          ) : (
                            <Button variant="outline-success" size="sm" className="rounded-3" style={{ fontSize: '0.78rem' }} onClick={() => handleToggleStatus(u)}>
                              Activate
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </Table>

            <PaginationBar page={page} totalPages={totalUserPages} totalElements={totalUsers} label="users" onChange={handlePageChange} />
          </Card.Body>
        </Card>
      </Container>

      {/* Edit Role Modal */}
      <Modal show={!!editModal} onHide={() => setEditModal(null)} centered>
        <Modal.Header closeButton style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <Modal.Title className="fs-6 fw-semibold" style={{ color: 'var(--text-primary)' }}>
            Edit Role — {editModal?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'var(--bg-surface)' }}>
          <Form.Group>
            <Form.Label className="es-label">New Role</Form.Label>
            <Form.Select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserResponseDto['role'])}
              className="es-form-control"
            >
              {ROLES.map((r) => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <Button variant="outline-secondary" size="sm" className="rounded-3" onClick={() => setEditModal(null)}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" className="rounded-3 fw-semibold" onClick={handleSaveRole} disabled={saving}>
            {saving ? <><Spinner animation="border" size="sm" className="me-1" />Saving…</> : 'Save'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
