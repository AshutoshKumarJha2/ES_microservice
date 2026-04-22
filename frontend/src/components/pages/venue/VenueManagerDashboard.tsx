import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchAllVenues } from '../../../store/slices/venue/venueSlice'
import { Container, Row, Col, Card, Table, Badge, Button } from 'react-bootstrap'
import { StatCard } from '../../elements/shared/StatCard'
import { ActionCard } from '../../elements/shared/ActionCard'
import { TableRowsSkeleton } from '../../elements/skeletons/PageSkeleton'
import { PageBanner } from '../../elements/common/PageBanner'
import { TabBar } from '../../elements/TabBar'
import { SUB_TABS } from '../../layout/VenueLayout'

const venueBadgeClass = (status: string): string => {
  if (status === 'AVAILABLE')   return 'es-badge-active'
  if (status === 'UNAVAILABLE') return 'es-badge-suspended'
  return 'es-badge-pending'
}

const venueStatusLabel = (status: string) =>
  status === 'MAINTENENCE' ? 'Maintenance' : status.charAt(0) + status.slice(1).toLowerCase()

export const VenueManagerDashboard = () => {
  const dispatch    = useAppDispatch()
  const navigate    = useNavigate()
  const { venues, venuesLoading } = useAppSelector((s) => s.venue)
  const { user }    = useAppSelector((s) => s.auth)

  useEffect(() => { dispatch(fetchAllVenues()) }, [dispatch])

  const counts = {
    total:       venues.length,
    available:   venues.filter(v => v.availabilityStatus === 'AVAILABLE').length,
    unavailable: venues.filter(v => v.availabilityStatus === 'UNAVAILABLE').length,
    maintenance: venues.filter(v => v.availabilityStatus === 'MAINTENENCE').length,
  }

  const firstName = user?.name?.split(' ')[0] ?? 'Manager'

  const STATS = [
    { label: 'Total Venues',  value: counts.total,       accent: 'es-stat-card-blue',  loading: venuesLoading },
    { label: 'Available',     value: counts.available,   accent: 'es-stat-card-green', loading: venuesLoading },
    { label: 'Unavailable',   value: counts.unavailable, accent: 'es-stat-card-red',   loading: venuesLoading },
    { label: 'Maintenance',   value: counts.maintenance, accent: 'es-stat-card-amber', loading: venuesLoading },
  ]

  const ACTIONS = [
    {
      to:        '/venue-manager/venues',
      title:     'Venues',
      desc:      'Add, edit and update venue listings. Set capacity and toggle availability status.',
      accent:    'es-stat-card-blue',
      linkLabel: 'Manage Venues →',
    },
    {
      to:        '/venue-manager/venue/bookings',
      title:     'Bookings',
      desc:      'Review incoming booking requests. Confirm or cancel bookings per venue.',
      accent:    'es-stat-card-green',
      linkLabel: 'View Bookings →',
    },
    {
      to:        '/venue-manager/venue/resources',
      title:     'Resources',
      desc:      'Manage equipment and staff resources assigned to each venue.',
      accent:    'es-stat-card-amber',
      linkLabel: 'Manage Resources →',
    },
  ]

  const recentVenues = venues.slice(0, 5)

  return (
    <div>
      <PageBanner
        title={`Welcome back, ${firstName}`}
        subtitle={`Venue Manager Portal — ${counts.available} available · ${counts.unavailable} unavailable · ${counts.maintenance} in maintenance`}
        actions={<>
          <Button variant="outline-light" size="sm" className="rounded-3" onClick={() => navigate('/venue-manager/venue/bookings')}>
            View Bookings
          </Button>
          <Button variant="light" size="sm" className="fw-semibold rounded-3" onClick={() => navigate('/venue-manager/venues')}>
            Manage Venues
          </Button>
        </>}
      />

            <TabBar SUB_TABS={SUB_TABS} />


      <Container fluid className="px-3 px-md-4 py-4">
        {/* Stat Cards */}
        <Row className="g-3 mb-4">
          {STATS.map((s) => <StatCard key={s.label} {...s} />)}
        </Row>

        {/* Quick Access */}
        <div className="text-uppercase fw-bold mb-3" style={{ fontSize: '0.7rem', letterSpacing: '.08em', color: 'var(--text-secondary)' }}>
          Quick Access
        </div>
        <Row className="g-3 mb-4">
          {ACTIONS.map((a) => <ActionCard key={a.title} {...a} />)}
        </Row>

        {/* Secondary Panel */}
        <Row className="g-3">
          {/* Venue Overview */}
          <Col xs={12} lg={8}>
            <Card className="es-card border shadow-sm h-100">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Card.Title className="mb-0 fw-semibold fs-6" style={{ color: 'var(--text-primary)' }}>
                    Venue Overview
                  </Card.Title>
                  <Button variant="link" size="sm" className="p-0 text-decoration-none" style={{ color: 'var(--blue)', fontSize: '0.82rem' }} onClick={() => navigate('/venue-manager/venues')}>
                    View All →
                  </Button>
                </div>
                {(!venuesLoading && recentVenues.length === 0) ? (
                  <p className="text-center py-3 mb-0 small" style={{ color: 'var(--text-muted)' }}>No venues registered yet.</p>
                ) : (
                  <Table hover responsive className="mb-0" style={{ fontSize: '0.88rem' }}>
                    <thead style={{ background: 'var(--bg-subtle)' }}>
                      <tr>
                        {['Name', 'Location', 'Capacity', 'Status'].map(h => (
                          <th key={h} className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {venuesLoading ? <TableRowsSkeleton rows={5} cols={4} /> : recentVenues.map(v => (
                        <tr key={v.id}>
                          <td className="align-middle fw-semibold" style={{ color: 'var(--text-primary)' }}>{v.name}</td>
                          <td className="align-middle" style={{ color: 'var(--text-secondary)' }}>{v.location}</td>
                          <td className="align-middle" style={{ color: 'var(--text-secondary)' }}>{v.capacity.toLocaleString()}</td>
                          <td className="align-middle">
                            <Badge className={`${venueBadgeClass(v.availabilityStatus)} border-0`} style={{ fontSize: '0.7rem' }}>
                              {venueStatusLabel(v.availabilityStatus)}
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

          {/* Status Breakdown */}
          <Col xs={12} lg={4}>
            <Card className="es-card border shadow-sm h-100">
              <Card.Body className="p-3">
                <Card.Title className="mb-3 fw-semibold fs-6" style={{ color: 'var(--text-primary)' }}>
                  Status Breakdown
                </Card.Title>
                <div className="d-flex flex-column gap-3">
                  {[
                    { label: 'Available',   value: counts.available,   bar: 'var(--green)',  badge: 'es-badge-active'    },
                    { label: 'Unavailable', value: counts.unavailable, bar: 'var(--red)',    badge: 'es-badge-suspended' },
                    { label: 'Maintenance', value: counts.maintenance, bar: 'var(--amber)',  badge: 'es-badge-pending'   },
                  ].map(row => {
                    const pct = counts.total > 0 ? Math.round((row.value / counts.total) * 100) : 0
                    return (
                      <div key={row.label}>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="small fw-medium" style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                          <Badge className={`${row.badge} border-0`} style={{ fontSize: '0.7rem' }}>
                            {row.value}
                          </Badge>
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
