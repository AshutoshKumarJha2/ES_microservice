import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchUsers } from '../../../store/slices/adminSlice'
import { AdminSubNav } from '../../elements/admin/AdminSubNav'
import {
  Container, Row, Col, Card, Table, Badge, Button, Spinner,
} from 'react-bootstrap'

const initials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

const roleBadgeClass = (role: string) => {
  const map: Record<string, string> = {
    ADMIN: 'es-badge-admin', ORGANIZER: 'es-badge-organizer',
    ATTENDEE: 'es-badge-attendee', VENDOR: 'es-badge-vendor',
    FINANCE_OFFICER: 'es-badge-finance', VENUE_MANAGER: 'es-badge-venue',
  }
  return map[role] ?? 'es-badge-draft'
}

const statusBadgeClass = (status: string) =>
  status === 'ACTIVE' ? 'es-badge-active' : 'es-badge-suspended'

const ACTIVITY = [
  { dot: '#16a34a', text: 'Admin panel loaded — user management ready',    time: 'Just now' },
  { dot: '#1d4ed8', text: <>Navigate to <strong>Audit Logs</strong> for full activity history</>, time: '—' },
  { dot: '#f97316', text: <>Use <strong>Users</strong> to edit roles &amp; suspend accounts</>,    time: '—' },
]

export const AdminDashboard: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { allUsers, loadingUsers } = useAppSelector((state) => state.admin)

  useEffect(() => {
    if (allUsers.length === 0) dispatch(fetchUsers())
  }, [dispatch]) // eslint-disable-line react-hooks/exhaustive-deps

  const recentUsers    = allUsers.slice(0, 5)
  const activeCount    = allUsers.filter((u) => u.status === 'ACTIVE').length
  const suspendedCount = allUsers.filter((u) => u.status === 'SUSPENDED').length
  const adminCount     = allUsers.filter((u) => u.role === 'ADMIN').length

  const STATS = [
    { label: 'Total Users',   value: allUsers.length, accent: 'es-stat-card-blue' },
    { label: 'Active Users',  value: activeCount,     accent: 'es-stat-card-green' },
    { label: 'Suspended',     value: suspendedCount,  accent: 'es-stat-card-red' },
    { label: 'Admins',        value: adminCount,      accent: 'es-stat-card-orange' },
  ]

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      {/* Banner */}
      <div className="es-banner text-white">
        <Container fluid className="px-3 px-md-4 py-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h1 className="fw-bold fs-3 mb-1">Admin Dashboard</h1>
            <p className="mb-0 text-white-50 small">Platform overview &amp; controls</p>
          </div>
          <div className="d-flex gap-2">
            <Button variant="outline-light" size="sm" className="rounded-3" onClick={() => navigate('/admin/audit-logs')}>
              View Audit Logs
            </Button>
            <Button variant="light" size="sm" className="rounded-3 fw-semibold" onClick={() => navigate('/admin/users')}>
              Manage Users
            </Button>
          </div>
        </Container>
      </div>

      {/* Sub-nav */}
      <AdminSubNav />

      <Container fluid className="px-3 px-md-4 py-4">
        {/* Stats */}
        <Row className="g-3 mb-4">
          {STATS.map((s) => (
            <Col key={s.label} xs={6} lg={3}>
              <Card className={`es-card border shadow-sm h-100 ${s.accent}`}>
                <Card.Body className="p-3">
                  <div className="small fw-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{s.label}</div>
                  <div className="fw-bold" style={{ fontSize: '1.8rem', color: 'var(--text-primary)', lineHeight: 1.1 }}>{s.value}</div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Two columns */}
        <Row className="g-3">
          {/* Recent Users */}
          <Col xs={12} lg={7}>
            <Card className="es-card border shadow-sm h-100">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Card.Title className="mb-0 fw-semibold fs-6" style={{ color: 'var(--text-primary)' }}>Recent Users</Card.Title>
                  <Button variant="link" size="sm" className="p-0 text-decoration-none" style={{ color: 'var(--blue)', fontSize: '0.82rem' }} onClick={() => navigate('/admin/users')}>
                    View All →
                  </Button>
                </div>

                {loadingUsers ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" size="sm" style={{ color: 'var(--blue)' }} />
                  </div>
                ) : (
                  <Table hover responsive className="mb-0" style={{ fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ color: 'var(--text-secondary)' }}>
                        <th className="fw-medium border-0 pb-2">Name</th>
                        <th className="fw-medium border-0 pb-2">Role</th>
                        <th className="fw-medium border-0 pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.length === 0 ? (
                        <tr><td colSpan={3} className="text-center py-3" style={{ color: 'var(--text-muted)' }}>No users found</td></tr>
                      ) : recentUsers.map((u) => (
                        <tr key={u.userId}>
                          <td className="align-middle">
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="d-flex align-items-center justify-content-center rounded-circle fw-bold text-white flex-shrink-0"
                                style={{ width: 28, height: 28, fontSize: '0.65rem', background: 'var(--blue)' }}
                              >
                                {initials(u.name || u.email)}
                              </div>
                              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{u.name || u.email}</span>
                            </div>
                          </td>
                          <td className="align-middle">
                            <Badge className={`${roleBadgeClass(u.role)} border-0`} style={{ fontSize: '0.7rem' }}>
                              {u.role}
                            </Badge>
                          </td>
                          <td className="align-middle">
                            <Badge className={`${statusBadgeClass(u.status)} border-0`} style={{ fontSize: '0.7rem' }}>
                              {u.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* System Activity */}
          <Col xs={12} lg={5}>
            <Card className="es-card border shadow-sm h-100">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Card.Title className="mb-0 fw-semibold fs-6" style={{ color: 'var(--text-primary)' }}>System Activity</Card.Title>
                  <Button variant="link" size="sm" className="p-0 text-decoration-none" style={{ color: 'var(--blue)', fontSize: '0.82rem' }} onClick={() => navigate('/admin/audit-logs')}>
                    View Logs →
                  </Button>
                </div>
                <div className="d-flex flex-column gap-3">
                  {ACTIVITY.map((item, i) => (
                    <div key={i} className="d-flex gap-3 align-items-start">
                      <div
                        className="rounded-circle flex-shrink-0 mt-1"
                        style={{ width: 10, height: 10, background: item.dot }}
                      />
                      <div>
                        <div style={{ fontSize: '0.88rem', color: 'var(--text-body)' }}>{item.text}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{item.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}
