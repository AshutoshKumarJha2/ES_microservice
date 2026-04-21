import { Link } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'
import {
  CalendarEventFill, TicketFill, BarChartFill, ShieldFillCheck,
  LightningChargeFill, PeopleFill, ArrowRight, CheckCircleFill,
} from 'react-bootstrap-icons'
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap'

const FEATURES = [
  {
    icon: <CalendarEventFill size={22} />, title: 'Event Management',
    desc: 'Create and manage events from start to finish — sessions, venues, schedules and more.',
    color: 'primary',
  },
  {
    icon: <TicketFill size={22} />, title: 'Ticketing & Registration',
    desc: 'Sell tickets, manage registrations, and approve attendees with a single click.',
    color: 'warning',
  },
  {
    icon: <BarChartFill size={22} />, title: 'Real-Time Analytics',
    desc: 'Track engagement, feedback ratings, and attendee activity as events unfold.',
    color: 'primary',
  },
  {
    icon: <ShieldFillCheck size={22} />, title: 'Role-Based Access',
    desc: 'Granular permissions for Admins, Organizers, Venue Managers, and Attendees.',
    color: 'warning',
  },
]

const STEPS = [
  { number: '01', title: 'Create your event', desc: 'Set up event details, choose a venue, define sessions, and configure tickets in minutes.' },
  { number: '02', title: 'Manage registrations', desc: 'Review attendee registrations, approve or reject applications, and track capacity.' },
  { number: '03', title: 'Analyse & grow', desc: 'Access real-time dashboards, engagement metrics, and budget reports after your event.' },
]

const ROLES = [
  { name: 'Organizer',       desc: 'Create events, manage sessions, approve registrations, and track budgets.', bg: 'primary' },
  { name: 'Attendee',        desc: 'Browse events, register with a ticket, and submit feedback after attending.', bg: 'success' },
  { name: 'Admin',           desc: 'Oversee the entire platform — users, events, audit logs, and system health.', bg: 'warning' },
  { name: 'Venue Manager',   desc: 'Control venue availability, capacity settings, and scheduling conflicts.', bg: 'primary' },
  { name: 'Finance Officer', desc: 'Review budgets, approve expenses, and generate financial summaries.', bg: 'success' },
  { name: 'Vendor',          desc: 'Collaborate with organizers on event logistics, contracts, and invoices.', bg: 'warning' },
]

const STATS = [
  { value: '10+', label: 'Microservices' },
  { value: '6',   label: 'User Roles' },
  { value: '50+', label: 'API Endpoints' },
  { value: '∞',   label: 'Possibilities' },
]

export const Home = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)

  const getDashboardPath = () => {
    if (!user) return '/dashboard'
    if (user.role === 'ORGANIZER') return '/organizer/dashboard'
    if (user.role === 'VENUE_MANAGER') return '/venue-manager/dashboard'
    if (user.role === 'ADMIN') return '/admin/dashboard'
    if (user.role === 'VENDOR') return '/vendor/dashboard'
    return '/dashboard'
  }

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="es-hero text-white">
        <Container>
          <Row className="justify-content-center text-center">
            <Col xs={12} lg={8}>
              <Badge
                bg="light"
                text="primary"
                className="mb-3 px-3 py-2 fw-semibold"
                style={{ fontSize: '0.8rem' }}
              >
                <LightningChargeFill className="me-1" size={11} /> Event Management Platform
              </Badge>

              <h1 className="display-4 fw-bold mb-3">
                Plan. Manage.{' '}
                <span style={{ color: 'var(--saffron)' }}>Succeed.</span>
              </h1>

              <p className="lead mb-4 text-white-50">
                EventSphere is a full-featured event management platform built for organisers,
                administrators, and attendees — all in one connected system.
              </p>

              <div className="d-flex flex-wrap gap-2 justify-content-center mb-4">
                {isAuthenticated ? (
                  <Button
                    as={Link as React.ElementType}
                    to={getDashboardPath()}
                    variant="light"
                    className="fw-semibold px-4 py-2 rounded-3"
                  >
                    Go to Dashboard <ArrowRight size={15} className="ms-1" />
                  </Button>
                ) : (
                  <>
                    <Button
                      as={Link as React.ElementType}
                      to="/register"
                      variant="light"
                      className="fw-semibold px-4 py-2 rounded-3"
                    >
                      Get Started Free <ArrowRight size={15} className="ms-1" />
                    </Button>
                    <Button
                      as={Link as React.ElementType}
                      to="/login"
                      variant="outline-light"
                      className="fw-semibold px-4 py-2 rounded-3"
                    >
                      Sign In
                    </Button>
                  </>
                )}
              </div>

              <div className="d-flex flex-wrap gap-3 justify-content-center">
                {['Role-based access control', 'Real-time analytics', 'Full audit trail'].map((item) => (
                  <span key={item} className="text-white-50 d-flex align-items-center gap-1" style={{ fontSize: '0.88rem' }}>
                    <CheckCircleFill size={13} style={{ color: '#4ade80' }} /> {item}
                  </span>
                ))}
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ── Stats strip ───────────────────────────────────────────────────── */}
      <div className="es-stats-strip">
        <Container>
          <Row className="text-center g-4">
            {STATS.map((s) => (
              <Col key={s.label} xs={6} md={3}>
                <div className="fw-bold fs-2" style={{ color: 'var(--blue)' }}>{s.value}</div>
                <div className="small" style={{ color: 'var(--text-secondary)' }}>{s.label}</div>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="py-5" style={{ background: 'var(--bg-page)' }}>
        <Container>
          <div className="text-center mb-5">
            <p className="text-uppercase fw-bold small mb-1" style={{ color: 'var(--blue)', letterSpacing: '0.1em' }}>
              Everything you need
            </p>
            <h2 className="fw-bold fs-1 mb-2" style={{ color: 'var(--text-primary)' }}>
              Built for every role on your team
            </h2>
            <p className="mx-auto" style={{ maxWidth: 560, color: 'var(--text-secondary)' }}>
              From the first planning stage to post-event reports, EventSphere covers every step of your workflow.
            </p>
          </div>
          <Row className="g-4">
            {FEATURES.map((f) => (
              <Col key={f.title} xs={12} sm={6}>
                <Card className="es-card h-100 border shadow-sm rounded-4">
                  <Card.Body className="p-4">
                    <div
                      className={`d-inline-flex align-items-center justify-content-center rounded-3 mb-3`}
                      style={{
                        width: 46, height: 46,
                        background: f.color === 'primary' ? 'var(--blue-subtle)' : 'var(--saffron-subtle)',
                        color: f.color === 'primary' ? 'var(--blue)' : 'var(--saffron)',
                      }}
                    >
                      {f.icon}
                    </div>
                    <Card.Title className="fw-semibold fs-6 mb-2" style={{ color: 'var(--text-primary)' }}>
                      {f.title}
                    </Card.Title>
                    <Card.Text className="small mb-0" style={{ color: 'var(--text-secondary)' }}>
                      {f.desc}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="py-5" style={{ background: 'var(--bg-subtle)' }}>
        <Container>
          <div className="text-center mb-5">
            <p className="text-uppercase fw-bold small mb-1" style={{ color: 'var(--blue)', letterSpacing: '0.1em' }}>
              How it works
            </p>
            <h2 className="fw-bold fs-1 mb-2" style={{ color: 'var(--text-primary)' }}>
              Three steps to a great event
            </h2>
            <p className="mx-auto" style={{ maxWidth: 520, color: 'var(--text-secondary)' }}>
              EventSphere streamlines the entire lifecycle so you can focus on what matters most.
            </p>
          </div>
          <Row className="g-4">
            {STEPS.map((s) => (
              <Col key={s.number} xs={12} md={4}>
                <Card className="es-card h-100 border shadow-sm rounded-4">
                  <Card.Body className="p-4">
                    <div
                      className="fw-black mb-3"
                      style={{ fontSize: '2.5rem', color: 'var(--blue-subtle)', WebkitTextStroke: '2px var(--blue)', letterSpacing: '-0.02em', lineHeight: 1 }}
                    >
                      {s.number}
                    </div>
                    <Card.Title className="fw-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      {s.title}
                    </Card.Title>
                    <Card.Text className="small mb-0" style={{ color: 'var(--text-secondary)' }}>
                      {s.desc}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ── Roles ─────────────────────────────────────────────────────────── */}
      <section className="py-5" style={{ background: 'var(--bg-page)' }}>
        <Container>
          <div className="text-center mb-5">
            <p className="text-uppercase fw-bold small mb-1" style={{ color: 'var(--blue)', letterSpacing: '0.1em' }}>
              Who it's for
            </p>
            <h2 className="fw-bold fs-1 mb-2" style={{ color: 'var(--text-primary)' }}>
              A platform for every stakeholder
            </h2>
            <p className="mx-auto" style={{ maxWidth: 540, color: 'var(--text-secondary)' }}>
              Six distinct roles give everyone the right tools without stepping on each other's toes.
            </p>
          </div>
          <Row className="g-4">
            {ROLES.map((r) => (
              <Col key={r.name} xs={12} sm={6} lg={4}>
                <Card className="es-card h-100 border shadow-sm rounded-4">
                  <Card.Body className="p-4">
                    <Badge bg={r.bg} className="mb-3 px-2 py-1" style={{ fontSize: '0.78rem' }}>
                      {r.name}
                    </Badge>
                    <Card.Title className="fw-semibold fs-6 mb-2" style={{ color: 'var(--text-primary)' }}>
                      {r.name}
                    </Card.Title>
                    <Card.Text className="small mb-0" style={{ color: 'var(--text-secondary)' }}>
                      {r.desc}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ── CTA band ──────────────────────────────────────────────────────── */}
      <section className="es-cta-band text-white text-center">
        <Container>
          <PeopleFill size={32} style={{ color: 'rgba(255,255,255,0.4)' }} className="mb-3" />
          {isAuthenticated ? (
            <>
              <h2 className="fw-bold fs-1 mb-2">Welcome to EventSphere</h2>
              <p className="text-white-50 mb-4" style={{ maxWidth: 500, margin: '0 auto 1.5rem' }}>
                You're signed in and ready to go. Head to your dashboard to get started.
              </p>
              <div className="d-flex flex-wrap gap-2 justify-content-center">
                <Button
                  as={Link as React.ElementType}
                  to={getDashboardPath()}
                  variant="light"
                  className="fw-semibold px-4 py-2 rounded-3"
                >
                  Open Dashboard <ArrowRight size={15} className="ms-1" />
                </Button>
                <Button
                  as={Link as React.ElementType}
                  to="/about"
                  variant="outline-light"
                  className="fw-semibold px-4 py-2 rounded-3"
                >
                  About the Platform
                </Button>
              </div>
            </>
          ) : (
            <>
              <h2 className="fw-bold fs-1 mb-2">Ready to run better events?</h2>
              <p className="text-white-50 mb-4" style={{ maxWidth: 500, margin: '0 auto 1.5rem' }}>
                Join EventSphere today and take full control of your event lifecycle.
              </p>
              <div className="d-flex flex-wrap gap-2 justify-content-center">
                <Button
                  as={Link as React.ElementType}
                  to="/register"
                  variant="light"
                  className="fw-semibold px-4 py-2 rounded-3"
                >
                  Create an Account <ArrowRight size={15} className="ms-1" />
                </Button>
                <Button
                  as={Link as React.ElementType}
                  to="/about"
                  variant="outline-light"
                  className="fw-semibold px-4 py-2 rounded-3"
                >
                  Learn More
                </Button>
              </div>
            </>
          )}
        </Container>
      </section>
    </>
  )
}
