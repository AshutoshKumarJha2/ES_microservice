import { Link } from 'react-router-dom'
import {
  ShieldFillCheck,
  LightningChargeFill,
  PeopleFill,
  BarChartLineFill,
  ArrowRight,
  BuildingFill,
  CodeSlash,
  GearFill,
} from 'react-bootstrap-icons'
import { Container, Row, Col, Card, Button } from 'react-bootstrap'

const VALUES = [
  {
    icon: <ShieldFillCheck size={22} />,
    title: 'Reliability',
    desc: 'Built on a resilient microservices architecture with independent scaling for every service.',
    color: 'var(--blue)',
  },
  {
    icon: <LightningChargeFill size={22} />,
    title: 'Speed',
    desc: 'Optimistic UI updates and async processing keep the experience snappy even under load.',
    color: 'var(--saffron)',
  },
  {
    icon: <PeopleFill size={22} />,
    title: 'Inclusivity',
    desc: 'Six distinct user roles ensure every stakeholder has exactly the right tools.',
    color: 'var(--blue)',
  },
  {
    icon: <BarChartLineFill size={22} />,
    title: 'Transparency',
    desc: 'Full audit logs, budget tracking, and real-time analytics give you complete visibility.',
    color: 'var(--saffron)',
  },
]

const SERVICES = [
  { name: 'Auth Service',         port: '8080', desc: 'JWT authentication & user management' },
  { name: 'Event Service',        port: '8081', desc: 'Core event lifecycle & sessions' },
  { name: 'Ticket Service',       port: '8082', desc: 'Ticket types, pricing & availability' },
  { name: 'Registration Service', port: '8083', desc: 'Attendee registration & approvals' },
  { name: 'Venue Service',        port: '8084', desc: 'Venue data & capacity management' },
  { name: 'Budget Service',       port: '8085', desc: 'Expense tracking & budget planning' },
  { name: 'Analytics Service',    port: '8087', desc: 'Engagement metrics & feedback' },
  { name: 'Notification Service', port: '8089', desc: 'Real-time user notifications' },
  { name: 'Log Service',          port: '8090', desc: 'Centralised audit log aggregation' },
  { name: 'API Gateway',          port: '8888', desc: 'Unified entry point & routing' },
]

const MISSION_STATS = [
  { value: '10',  label: 'Backend Services' },
  { value: '6',   label: 'User Roles' },
  { value: '50+', label: 'API Endpoints' },
  { value: '∞',   label: 'Possibilities' },
]

const TECH = [
  {
    icon: <CodeSlash size={20} />,
    title: 'Frontend',
    items: ['React 19 + TypeScript', 'Redux Toolkit', 'React Router v7', 'React Bootstrap 5', 'Vite'],
  },
  {
    icon: <GearFill size={20} />,
    title: 'Backend',
    items: ['Java + Spring Boot 3', 'Spring Security + JWT', 'Feign Client (inter-service)', 'Spring Data JPA', 'Maven'],
  },
  {
    icon: <BuildingFill size={20} />,
    title: 'Infrastructure',
    items: ['Spring Cloud Gateway', 'Eureka Service Discovery', 'Centralised Audit Logging', 'Role-Based Access Control', 'Relational Database'],
  },
]

export const About = () => {
  return (
    <div style={{ background: 'var(--bg-page)' }}>

      {/* Banner */}
      <div className="es-banner text-white">
        <Container fluid className="px-3 px-md-5 py-5">
          <div style={{ maxWidth: 680 }}>
            <p className="text-uppercase fw-bold mb-2" style={{ fontSize: '0.75rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)' }}>
              About EventSphere
            </p>
            <h1 className="fw-bold display-5 mb-3">Built to power every great event</h1>
            <p className="lead mb-0" style={{ color: 'rgba(255,255,255,0.8)' }}>
              EventSphere is a microservices-based event management platform designed for organisers,
              administrators, attendees, and everyone in between.
            </p>
          </div>
        </Container>
      </div>

      {/* Mission */}
      <section className="py-5">
        <Container fluid className="px-3 px-md-5">
          <Row className="g-5 align-items-center">
            <Col xs={12} lg={7}>
              <p className="text-uppercase fw-bold mb-2" style={{ fontSize: '0.72rem', letterSpacing: '0.1em', color: 'var(--blue)' }}>
                Our Mission
              </p>
              <h2 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                Simplify the complex world of event management
              </h2>
              <p className="mb-3" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                Event management involves many moving parts — venues, tickets, registrations, budgets,
                vendors, and communications. EventSphere brings all of them into a single coherent platform
                so your team can focus on creating memorable experiences.
              </p>
              <p className="mb-4" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                Every feature is designed around real workflows: organizers create and manage events,
                administrators oversee the platform, venue managers control capacity, finance officers
                track budgets, and attendees register seamlessly.
              </p>
              <Button as={Link as any} to="/dashboard" variant="primary" className="rounded-3 fw-semibold">
                Go to Dashboard <ArrowRight size={14} className="ms-1" />
              </Button>
            </Col>
            <Col xs={12} lg={5}>
              <Row className="g-3">
                {MISSION_STATS.map((s) => (
                  <Col xs={6} key={s.label}>
                    <Card className="es-card border shadow-sm text-center p-3">
                      <div className="fw-bold" style={{ fontSize: '2rem', color: 'var(--blue)' }}>{s.value}</div>
                      <div className="small" style={{ color: 'var(--text-secondary)' }}>{s.label}</div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Values */}
      <section className="py-5" style={{ background: 'var(--bg-surface)' }}>
        <Container fluid className="px-3 px-md-5">
          <p className="text-uppercase fw-bold mb-1 text-center" style={{ fontSize: '0.72rem', letterSpacing: '0.1em', color: 'var(--blue)' }}>
            Our Values
          </p>
          <h2 className="fw-bold text-center mb-4" style={{ color: 'var(--text-primary)' }}>What we stand for</h2>
          <Row className="g-3 justify-content-center">
            {VALUES.map((v) => (
              <Col xs={12} sm={6} lg={3} key={v.title}>
                <Card className="es-card border shadow-sm h-100 p-3">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{ width: 44, height: 44, background: `color-mix(in srgb, ${v.color} 12%, transparent)`, color: v.color }}
                  >
                    {v.icon}
                  </div>
                  <h5 className="fw-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{v.title}</h5>
                  <p className="small mb-0" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{v.desc}</p>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Architecture */}
      <section className="py-5">
        <Container fluid className="px-3 px-md-5">
          <p className="text-uppercase fw-bold mb-1 text-center" style={{ fontSize: '0.72rem', letterSpacing: '0.1em', color: 'var(--blue)' }}>
            Architecture
          </p>
          <h2 className="fw-bold text-center mb-2" style={{ color: 'var(--text-primary)' }}>Powered by microservices</h2>
          <p className="text-center small mb-4" style={{ color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto 2rem' }}>
            Each domain runs as an independent service, communicating via Feign clients with JWT propagation —
            scalable, resilient, and independently deployable.
          </p>
          <Row className="g-2">
            {SERVICES.map((s) => (
              <Col xs={12} sm={6} md={4} lg={3} key={s.name}>
                <Card className="es-card border shadow-sm h-100 p-3">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <span className="fw-semibold small" style={{ color: 'var(--text-primary)' }}>{s.name}</span>
                    <span
                      className="fw-semibold"
                      style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--blue)', background: 'var(--blue-subtle)', padding: '1px 6px', borderRadius: 4 }}
                    >
                      :{s.port}
                    </span>
                  </div>
                  <p className="mb-0" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{s.desc}</p>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Tech Stack */}
      <section className="py-5" style={{ background: 'var(--bg-surface)' }}>
        <Container fluid className="px-3 px-md-5">
          <p className="text-uppercase fw-bold mb-1 text-center" style={{ fontSize: '0.72rem', letterSpacing: '0.1em', color: 'var(--blue)' }}>
            Technology
          </p>
          <h2 className="fw-bold text-center mb-2" style={{ color: 'var(--text-primary)' }}>Modern stack, proven patterns</h2>
          <p className="text-center small mb-4" style={{ color: 'var(--text-secondary)' }}>
            Carefully chosen technologies that work together to deliver a fast, type-safe, and maintainable application.
          </p>
          <Row className="g-3 justify-content-center">
            {TECH.map((t) => (
              <Col xs={12} md={4} key={t.title}>
                <Card className="es-card border shadow-sm h-100 p-4">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{ width: 44, height: 44, background: 'var(--blue-subtle)', color: 'var(--blue)' }}
                  >
                    {t.icon}
                  </div>
                  <h5 className="fw-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{t.title}</h5>
                  <ul className="list-unstyled mb-0">
                    {t.items.map((item) => (
                      <li key={item} className="small mb-2 d-flex align-items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                        <span style={{ color: 'var(--blue)', marginTop: 2 }}>•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CTA */}
      <section className="es-cta-band text-white text-center py-5">
        <Container fluid className="px-3 px-md-5">
          <h2 className="fw-bold mb-2">Ready to experience EventSphere?</h2>
          <p className="mb-4" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Head to your dashboard and start managing events like a pro.
          </p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Button as={Link as any} to="/dashboard" variant="light" className="fw-semibold rounded-3">
              Open Dashboard <ArrowRight size={14} className="ms-1" />
            </Button>
            <Button as={Link as any} to="/contact" variant="outline-light" className="fw-semibold rounded-3">
              Contact Us
            </Button>
          </div>
        </Container>
      </section>

    </div>
  )
}
