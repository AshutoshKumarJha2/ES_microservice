import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
  fetchAllVendors,
  fetchAllContracts,
  fetchAllDeliveries,
  fetchAllInvoices,
} from '../../../store/slices/vendor/vendorSlice'
import { Container, Row, Col, Card, Table, Badge, Alert, Button } from 'react-bootstrap'
import { StatCard } from '../../elements/shared/StatCard'
import { ActionCard } from '../../elements/shared/ActionCard'
import { TableRowsSkeleton } from '../../elements/skeletons/PageSkeleton'
import { SUB_TABS } from '../../layout/VendorLayout'
import { TabBar } from '../../elements/TabBar'

const contractBadgeClass = (status: string): string => {
  if (status === 'ACTIVE')     return 'es-badge-active'
  if (status === 'COMPLETED')  return 'es-badge-completed'
  if (status === 'TERMINATED') return 'es-badge-cancelled'
  return 'es-badge-draft'
}

export const VendorManagerDashboard = () => {
  const dispatch   = useAppDispatch()
  const navigate   = useNavigate()
  const { user }   = useAppSelector((s) => s.auth)
  const {
    vendors, vendorsLoading,
    contracts, contractsLoading,
    deliveries, deliveriesLoading,
    invoices, invoicesLoading,
  } = useAppSelector((s) => s.vendor)

  useEffect(() => {
    dispatch(fetchAllVendors())
    dispatch(fetchAllContracts())
    dispatch(fetchAllDeliveries())
    dispatch(fetchAllInvoices())
  }, [dispatch])

  const isVendor  = user?.role === 'VENDOR'
  const hasProfile = vendors.length > 0

  const draftContracts      = contracts.filter(c => c.status === 'DRAFT').length
  const activeContracts     = contracts.filter(c => c.status === 'ACTIVE').length
  const scheduledDeliveries = deliveries.filter(d => d.status === 'SCHEDULED').length
  const inTransitDeliveries = deliveries.filter(d => d.status === 'IN_TRANSIT').length
  const pendingInvoices     = invoices.filter(i => i.status === 'ISSUED').length
  const overdueInvoices     = invoices.filter(i => i.status === 'OVERDUE').length

  const activeVendors      = vendors.filter(v => v.status === 'ACTIVE').length
  const inactiveVendors    = vendors.filter(v => v.status === 'INACTIVE').length
  const blacklistedVendors = vendors.filter(v => v.status === 'BLACKLISTED').length

  const STATS = [
    { label: 'Contracts to Sign', value: draftContracts,                           accent: 'es-stat-card-blue',  loading: contractsLoading },
    { label: 'Active Contracts',  value: activeContracts,                           accent: 'es-stat-card-green', loading: contractsLoading },
    { label: 'Active Deliveries', value: scheduledDeliveries + inTransitDeliveries, accent: 'es-stat-card-amber', loading: deliveriesLoading },
    { label: 'Unpaid Invoices',   value: pendingInvoices + overdueInvoices,         accent: 'es-stat-card-red',   loading: invoicesLoading   },
  ]

  const ACTIONS = [
    // "My Profile" / "Register" is only meaningful for VENDOR role (POST /vendors requires VENDOR)
    ...(isVendor ? [{
      to:     '/vendor/profile',
      title:  hasProfile ? 'My Profile' : 'Register as Vendor',
      desc:   hasProfile ? 'View and update your vendor profile' : 'Create your vendor profile to start',
      accent: 'es-stat-card-blue',
    }] : []),
    {
      to:     '/vendor/contracts',
      title:  'Contracts',
      desc:   draftContracts > 0
        ? `${draftContracts} contract${draftContracts > 1 ? 's' : ''} awaiting signature`
        : 'View all vendor agreements',
      accent: 'es-stat-card-green',
    },
    // "Log Delivery" action is only for VENDOR (POST /deliveries requires VENDOR)
    ...(isVendor ? [{
      to:     '/vendor/deliveries',
      title:  'Log Delivery',
      desc:   'Confirm and track goods & equipment delivered',
      accent: 'es-stat-card-amber',
    }] : [{
      to:     '/vendor/deliveries',
      title:  'Deliveries',
      desc:   'View delivery records and statuses',
      accent: 'es-stat-card-amber',
    }]),
    {
      to:     '/vendor/invoices',
      title:  'Invoices',
      desc:   overdueInvoices > 0
        ? `${overdueInvoices} overdue invoice${overdueInvoices > 1 ? 's' : ''} — action needed`
        : 'View billing records and download PDFs',
      accent: 'es-stat-card-red',
    },
  ]

  const recentContracts = contracts.slice(0, 5)

  const firstName = user?.name?.split(' ')[0] ?? 'User'

  return (
    <div>
      <div className="es-banner">
        <Container fluid className="px-3 px-md-4 py-3">
          <h1 className="fw-bold fs-4 mb-1" style={{ color: '#fff' }}>Welcome back, {firstName}</h1>
          <p className="mb-0 small" style={{ color: 'rgba(255,255,255,0.72)' }}>Vendor Portal</p>
        </Container>
      </div>


      <TabBar SUB_TABS={SUB_TABS} />

      <Container fluid className="px-3 px-md-4 py-4">
        {/* Alert banners */}
        {draftContracts > 0 && (
          <Alert variant="primary" className="py-2 mb-3 d-flex justify-content-between align-items-center">
            <span><strong>{draftContracts}</strong> contract{draftContracts !== 1 ? 's' : ''} in DRAFT — review and sign to activate.</span>
            <Link to="/vendor/contracts" className="fw-bold small text-decoration-none">View Contracts →</Link>
          </Alert>
        )}
        {overdueInvoices > 0 && (
          <Alert variant="danger" className="py-2 mb-3 d-flex justify-content-between align-items-center">
            <span><strong>{overdueInvoices}</strong> overdue invoice{overdueInvoices !== 1 ? 's' : ''} — follow up with the finance team.</span>
            <Link to="/vendor/invoices" className="fw-bold small text-decoration-none text-danger">View Invoices →</Link>
          </Alert>
        )}

        {/* Stat Cards */}
        <Row className="g-3 mb-4">
          {STATS.map((s) => <StatCard key={s.label} {...s} />)}
        </Row>

        {/* Quick Actions */}
        <div className="text-uppercase fw-bold mb-3" style={{ fontSize: '0.7rem', letterSpacing: '.08em', color: 'var(--text-secondary)' }}>
          Quick Actions
        </div>
        <Row className="g-3 mb-4">
          {ACTIONS.map((a) => <ActionCard key={a.title} {...a} />)}
        </Row>

        {/* Secondary Panel */}
        <Row className="g-3">
          {/* Recent Contracts */}
          <Col xs={12} lg={8}>
            <Card className="es-card border shadow-sm h-100">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Card.Title className="mb-0 fw-semibold fs-6" style={{ color: 'var(--text-primary)' }}>
                    Recent Contracts
                  </Card.Title>
                  <Button variant="link" size="sm" className="p-0 text-decoration-none" style={{ color: 'var(--blue)', fontSize: '0.82rem' }} onClick={() => navigate('/vendor/contracts')}>
                    View All →
                  </Button>
                </div>
                {(!contractsLoading && recentContracts.length === 0) ? (
                  <p className="text-center py-3 mb-0 small" style={{ color: 'var(--text-muted)' }}>No contracts yet.</p>
                ) : (
                  <Table hover responsive className="mb-0" style={{ fontSize: '0.88rem' }}>
                    <thead style={{ background: 'var(--bg-subtle)' }}>
                      <tr>
                        {['Vendor', 'Value', 'Start Date', 'End Date', 'Status'].map(h => (
                          <th key={h} className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {contractsLoading ? (
                        <TableRowsSkeleton rows={5} cols={5} />
                      ) : recentContracts.map(c => (
                        <tr key={c.contractId}>
                          <td className="align-middle fw-semibold" style={{ color: 'var(--text-primary)' }}>
                            {vendors.find(v => v.vendorId === c.vendorId)?.name ?? '—'}
                          </td>
                          <td className="align-middle fw-semibold" style={{ color: 'var(--text-primary)' }}>
                            ${Number(c.value).toLocaleString()}
                          </td>
                          <td className="align-middle" style={{ color: 'var(--text-secondary)' }}>
                            {new Date(c.startDate).toLocaleDateString()}
                          </td>
                          <td className="align-middle" style={{ color: 'var(--text-secondary)' }}>
                            {new Date(c.endDate).toLocaleDateString()}
                          </td>
                          <td className="align-middle">
                            <Badge className={`${contractBadgeClass(c.status)} border-0`} style={{ fontSize: '0.7rem' }}>
                              {c.status}
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

          {/* Vendor Status Breakdown */}
          <Col xs={12} lg={4}>
            <Card className="es-card border shadow-sm h-100">
              <Card.Body className="p-3">
                <Card.Title className="mb-3 fw-semibold fs-6" style={{ color: 'var(--text-primary)' }}>
                  Vendor Status Breakdown
                </Card.Title>
                <div className="d-flex flex-column gap-3">
                  {[
                    { label: 'Active',      value: activeVendors,      bar: 'var(--green)',      badge: 'es-badge-active'    },
                    { label: 'Inactive',    value: inactiveVendors,    bar: 'var(--text-muted)', badge: 'es-badge-draft'     },
                    { label: 'Blacklisted', value: blacklistedVendors, bar: 'var(--red)',        badge: 'es-badge-suspended' },
                  ].map(row => {
                    const pct = vendors.length > 0 ? Math.round((row.value / vendors.length) * 100) : 0
                    return (
                      <div key={row.label}>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="small fw-medium" style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                          <Badge className={`${row.badge} border-0`} style={{ fontSize: '0.7rem' }}>{row.value}</Badge>
                        </div>
                        <div className="rounded-pill" style={{ height: 6, background: 'var(--border-color)' }}>
                          <div
                            className="rounded-pill"
                            style={{ height: 6, width: `${pct}%`, background: row.bar, transition: 'width 0.4s ease' }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}
