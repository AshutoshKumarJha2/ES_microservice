import { Link } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'
import {
  CalendarEventFill, TicketFill, BarChartFill, ShieldFillCheck,
  LightningChargeFill, PeopleFill, ArrowRight, CheckCircleFill,
  ChatLeftQuoteFill,
} from 'react-bootstrap-icons'
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap'
import { useIntersect } from '../../hooks/useIntersect'
import styles from '../../css/Home.module.css'

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
  { value: '500+', label: 'Events Managed' },
  { value: '6',    label: 'User Roles' },
  { value: '99.9%', label: 'Uptime' },
  { value: '∞',    label: 'Scale' },
]

const TESTIMONIALS = [
  {
    quote: 'EventSphere made our conference registration completely painless. Our team set everything up in under an hour.',
    name: 'Sarah K.', role: 'Event Organizer', initials: 'SK', color: 'primary',
  },
  {
    quote: 'The role-based access control meant our finance team had exactly the data they needed — nothing more, nothing less.',
    name: 'Mark T.', role: 'Finance Officer', initials: 'MT', color: 'warning',
  },
  {
    quote: 'Real-time analytics during the event completely changed how we respond to attendees on the ground.',
    name: 'Priya S.', role: 'Operations Lead', initials: 'PS', color: 'success',
  },
]

export const Home = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)

  const featuresSection  = useIntersect()
  const stepsSection     = useIntersect()
  const testimonialsSection = useIntersect()
  const rolesSection     = useIntersect()

  const getDashboardPath = () => {
    if (!user) return '/dashboard'
    if (user.role === 'ORGANIZER') return '/organizer/dashboard'
    if (user.role === 'ADMIN') return '/admin/dashboard'
    return '/dashboard'
  }

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="es-hero text-white">
        {/* decorative grid pattern */}
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-grid)" />
          </svg>
        </div>

        <Container style={{ position: 'relative' }}>
          <Row className="justify-content-center text-center">
            <Col xs={12} lg={8}>
              <Badge
                bg="light"
                text="primary"
                className="mb-3 px-3 py-2 fw-semibold"
                style={{ fontSize: '0.75rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}
              >
                <LightningChargeFill className="me-1" size={11} /> Event Management Platform
              </Badge>

              <h1
                className="fw-bold mb-3"
                style={{ fontSize: 'clamp(2.25rem, 5vw, 3rem)', lineHeight: 1.1, letterSpacing: '-0.02em' }}
              >
                Plan. Manage.{' '}
                <span style={{ color: 'var(--saffron)' }}>Succeed.</span>
              </h1>

              <p className="lead mb-4" style={{ color: 'rgba(255,255,255,0.72)', fontSize: '1.0625rem', lineHeight: 1.65, maxWidth: 560, margin: '0 auto 1.5rem' }}>
                EventSphere is a full-featured event management platform built for organisers,
                administrators, and attendees — all in one connected system.
              </p>

              <div className="d-flex flex-wrap gap-2 justify-content-center mb-4">
                {isAuthenticated ? (
                  <Button
                    as={Link as React.ElementType}
                    to={getDashboardPath()}
                    className="fw-semibold px-4 rounded-3"
                    style={{
                      background: 'var(--gradient-accent)', border: 'none', color: '#fff',
                      height: 48, display: 'inline-flex', alignItems: 'center',
                    }}
                  >
                    Go to Dashboard <ArrowRight size={15} className="ms-1" />
                  </Button>
                ) : (
                  <>
                    <Button
                      as={Link as React.ElementType}
                      to="/register"
                      className="fw-semibold px-4 rounded-3"
                      style={{
                        background: 'var(--gradient-accent)', border: 'none', color: '#fff',
                        height: 48, display: 'inline-flex', alignItems: 'center',
                      }}
                    >
                      Get Started Free <ArrowRight size={15} className="ms-1" />
                    </Button>
                    <Button
                      as={Link as React.ElementType}
                      to="/login"
                      variant="outline-light"
                      className="fw-semibold px-4 rounded-3"
                      style={{ height: 48, display: 'inline-flex', alignItems: 'center' }}
                    >
                      Sign In
                    </Button>
                  </>
                )}
              </div>

              <div className="d-flex flex-wrap gap-3 justify-content-center">
                {['Role-based access control', 'Real-time analytics', 'Full audit trail'].map((item) => (
                  <span key={item} className="d-flex align-items-center gap-1" style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)' }}>
                    <CheckCircleFill size={13} style={{ color: '#6ee7b7' }} /> {item}
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
          <div ref={featuresSection.ref}>
            <Row className={`g-4 ${featuresSection.visible ? styles.animateIn : styles.animateReady}`}>
              {FEATURES.map((f) => (
                <Col key={f.title} xs={12} sm={6}>
                  <Card className={`es-card h-100 border shadow-sm rounded-4 ${styles.featureCard}`}>
                    <Card.Body className="p-4">
                      <div
                        className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3"
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
          </div>
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
          <div ref={stepsSection.ref}>
            <Row className={`g-4 ${stepsSection.visible ? styles.animateIn : styles.animateReady}`}>
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
          </div>
        </Container>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────────── */}
      <section className="py-5" style={{ background: 'var(--bg-page)' }}>
        <Container>
          <div className="text-center mb-5">
            <p className="text-uppercase fw-bold small mb-1" style={{ color: 'var(--blue)', letterSpacing: '0.1em' }}>
              Trusted by teams
            </p>
            <h2 className="fw-bold fs-1 mb-2" style={{ color: 'var(--text-primary)' }}>
              What our users say
            </h2>
            <p className="mx-auto" style={{ maxWidth: 500, color: 'var(--text-secondary)' }}>
              Teams across roles rely on EventSphere to run smoother, better-connected events.
            </p>
          </div>
          <div ref={testimonialsSection.ref}>
            <Row className={`g-4 ${testimonialsSection.visible ? styles.animateIn : styles.animateReady}`}>
              {TESTIMONIALS.map((t) => (
                <Col key={t.name} xs={12} md={4}>
                  <Card className={`es-card h-100 border shadow-sm rounded-4 ${styles.testimonialCard}`}>
                    <Card.Body className="p-4 d-flex flex-column">
                      <ChatLeftQuoteFill
                        size={20}
                        className="mb-3"
                        style={{ color: 'var(--blue)', opacity: 0.5 }}
                        aria-hidden="true"
                      />
                      <p className="flex-grow-1 mb-4" style={{ color: 'var(--text-primary)', fontSize: '0.93rem', lineHeight: 1.65 }}>
                        {t.quote}
                      </p>
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className={`d-flex align-items-center justify-content-center rounded-circle fw-bold text-white ${styles.testimonialAvatar}`}
                          style={{
                            background: t.color === 'primary' ? 'var(--blue)' : t.color === 'warning' ? 'var(--saffron)' : 'var(--green)',
                          }}
                        >
                          {t.initials}
                        </div>
                        <div>
                          <div className="fw-semibold small" style={{ color: 'var(--text-primary)' }}>{t.name}</div>
                          <Badge
                            bg={t.color}
                            className="px-2 py-1"
                            style={{ fontSize: '0.7rem' }}
                          >
                            {t.role}
                          </Badge>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </Container>
      </section>

      {/* ── Roles ─────────────────────────────────────────────────────────── */}
      <section className="py-5" style={{ background: 'var(--bg-subtle)' }}>
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
          <div ref={rolesSection.ref}>
            <Row className={`g-4 ${rolesSection.visible ? styles.animateIn : styles.animateReady}`}>
              {ROLES.map((r) => (
                <Col key={r.name} xs={12} sm={6} lg={4}>
                  <Card className={`es-card h-100 border shadow-sm rounded-4 ${styles.roleCard}`}>
                    <Card.Body className="p-4">
                      <div className="fw-semibold fs-6 mb-2" style={{ color: 'var(--text-primary)' }}>
                        {r.name}
                      </div>
                      <p className="small mb-3" style={{ color: 'var(--text-secondary)' }}>
                        {r.desc}
                      </p>
                      <Badge bg={r.bg} className="px-2 py-1" style={{ fontSize: '0.72rem' }}>
                        {r.name}
                      </Badge>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </Container>
      </section>

      {/* ── CTA band ──────────────────────────────────────────────────────── */}
      <section className="es-cta-band text-white text-center">
        <Container>
          <PeopleFill size={32} aria-hidden="true" style={{ color: 'rgba(255,255,255,0.4)' }} className="mb-3" />
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
