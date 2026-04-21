import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchUsers } from '../../../store/slices/adminSlice'
import { AdminSubNav } from '../../elements/admin/AdminSubNav'
import {
  Container, Row, Col, Card, Table, Badge, Button, Spinner,
} from 'react-bootstrap'
import {
  People, PersonCheckFill, PersonXFill, ShieldFillCheck,
  CalendarEventFill, ClockHistory,
} from 'react-bootstrap-icons'

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
    { label: 'Total Users',  value: allUsers.length, accent: 'es-stat-card-blue',   icon: <People size={18} />,          iconBg: 'var(--blue-subtle)',    iconColor: 'var(--blue)'    },
    { label: 'Active Users', value: activeCount,     accent: 'es-stat-card-green',  icon: <PersonCheckFill size={18} />, iconBg: 'var(--green-subtle)',   iconColor: 'var(--green)'   },
    { label: 'Suspended',    value: suspendedCount,  accent: 'es-stat-card-red',    icon: <PersonXFill size={18} />,     iconBg: 'var(--red-subtle)',     iconColor: 'var(--red)'     },
    { label: 'Admins',       value: adminCount,      accent: 'es-stat-card-orange', icon: <ShieldFillCheck size={18} />, iconBg: 'var(--saffron-subtle)', iconColor: 'var(--saffron)' },
  ]

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      {/* Banner */}
      <div className="es-banner">
        <Container fluid className="px-3 px-md-4 py-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h1 className="fw-bold fs-3 mb-1">Admin Dashboard</h1>
            <p className="mb-0 text-secondary small">Platform overview &amp; controls</p>
          </div>
          <div className="d-flex gap-2">
            <Button variant="outline-primary" size="sm" className="rounded-3" onClick={() => navigate('/admin/audit-logs')}>
              View Audit Logs
            </Button>
            <Button variant="primary" size="sm" className="rounded-3 fw-semibold" onClick={() => navigate('/admin/users')}>
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
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="small fw-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{s.label}</div>
                      <div className="fw-bold" style={{ fontSize: '1.8rem', color: 'var(--text-primary)', lineHeight: 1.1 }}>{s.value}</div>
                    </div>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: s.iconBg, color: s.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {s.icon}
                    </div>
                  </div>
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
                    <thead style={{ background: 'var(--bg-subtle)' }}>
                      <tr>
                        <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Name</th>
                        <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Role</th>
                        <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Status</th>
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

          {/* Quick Actions */}
          <Col xs={12} lg={5}>
            <Card className="es-card border shadow-sm h-100">
              <Card.Body className="p-3">
                <Card.Title className="mb-3 fw-semibold fs-6" style={{ color: 'var(--text-primary)' }}>Quick Actions</Card.Title>
                <div className="d-flex flex-column gap-2">
                  <Button
                    variant="outline-primary" size="sm"
                    className="w-100 text-start rounded-3 d-flex align-items-center gap-2 fw-medium"
                    onClick={() => navigate('/admin/users')}
                  >
                    <People size={15} /> Manage Users
                  </Button>
                  <Button
                    variant="outline-primary" size="sm"
                    className="w-100 text-start rounded-3 d-flex align-items-center gap-2 fw-medium"
                    onClick={() => navigate('/admin/events')}
                  >
                    <CalendarEventFill size={15} /> Browse Events
                  </Button>
                  <Button
                    variant="outline-primary" size="sm"
                    className="w-100 text-start rounded-3 d-flex align-items-center gap-2 fw-medium"
                    onClick={() => navigate('/admin/audit-logs')}
                  >
                    <ClockHistory size={15} /> View Audit Logs
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}
