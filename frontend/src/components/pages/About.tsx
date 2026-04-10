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
import styles from '../../css/About.module.css'

const VALUES = [
  {
    icon: <ShieldFillCheck size={22} />,
    title: 'Reliability',
    desc: 'Built on a resilient microservices architecture with independent scaling for every service.',
    color: 'blue',
  },
  {
    icon: <LightningChargeFill size={22} />,
    title: 'Speed',
    desc: 'Optimistic UI updates and async processing keep the experience snappy even under load.',
    color: 'orange',
  },
  {
    icon: <PeopleFill size={22} />,
    title: 'Inclusivity',
    desc: 'Six distinct user roles ensure every stakeholder has exactly the right tools.',
    color: 'blue',
  },
  {
    icon: <BarChartLineFill size={22} />,
    title: 'Transparency',
    desc: 'Full audit logs, budget tracking, and real-time analytics give you complete visibility.',
    color: 'orange',
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
  { value: '10', label: 'Backend Services' },
  { value: '6', label: 'User Roles' },
  { value: '50+', label: 'API Endpoints' },
  { value: '∞', label: 'Possibilities' },
]

export const About = () => {
  return (
    <div className={styles.page}>

      {/* ── Banner ───────────────────────────────────────────────────────── */}
      <div className={styles.banner}>
        <div className={styles['banner-inner']}>
          <p className={styles['banner-overline']}>About EventSphere</p>
          <h1 className={styles['banner-title']}>Built to power every great event</h1>
          <p className={styles['banner-sub']}>
            EventSphere is a microservices-based event management platform designed for organisers,
            administrators, attendees, and everyone in between.
          </p>
        </div>
      </div>

      {/* ── Mission ──────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles['section-inner']}>
          <div className={styles['two-col']}>
            <div>
              <p className={styles['section-overline']}>Our Mission</p>
              <h2 className={styles['section-title']}>
                Simplify the complex world of event management
              </h2>
              <p className={styles['mission-body']}>
                Event management involves many moving parts — venues, tickets, registrations,
                budgets, vendors, and communications. EventSphere brings all of them into a single
                coherent platform so your team can focus on creating memorable experiences.
              </p>
              <p className={styles['mission-body']}>
                Every feature is designed around real workflows: organizers create and manage
                events, administrators oversee the platform, venue managers control capacity,
                finance officers track budgets, and attendees register seamlessly.
              </p>
              <Link to="/dashboard" className={styles['btn-primary']}>
                Go to Dashboard <ArrowRight size={14} />
              </Link>
            </div>
            <div className={styles['mission-stats']}>
              {MISSION_STATS.map((s) => (
                <div key={s.label} className={styles['mission-stat']}>
                  <span className={styles['mission-stat-value']}>{s.value}</span>
                  <span className={styles['mission-stat-label']}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────────────────────── */}
      <section className={`${styles.section} ${styles['section-alt']}`}>
        <div className={styles['section-inner']}>
          <p className={styles['section-overline']}>Our Values</p>
          <h2 className={styles['section-title']}>What we stand for</h2>
          <div className={styles['values-grid']}>
            {VALUES.map((v) => (
              <div
                key={v.title}
                className={`${styles['value-card']} ${styles[`value-${v.color}`]}`}
              >
                <div className={styles['value-icon']}>{v.icon}</div>
                <h3 className={styles['value-title']}>{v.title}</h3>
                <p className={styles['value-desc']}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Architecture ─────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles['section-inner']}>
          <p className={styles['section-overline']}>Architecture</p>
          <h2 className={styles['section-title']}>Powered by microservices</h2>
          <p className={styles['section-sub']}>
            Each domain runs as an independent service, communicating via Feign clients with
            JWT propagation — scalable, resilient, and independently deployable.
          </p>
          <div className={styles['services-grid']}>
            {SERVICES.map((s) => (
              <div key={s.name} className={styles['service-card']}>
                <div className={styles['service-header']}>
                  <span className={styles['service-name']}>{s.name}</span>
                  <span className={styles['service-port']}>:{s.port}</span>
                </div>
                <p className={styles['service-desc']}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech stack ───────────────────────────────────────────────────── */}
      <section className={`${styles.section} ${styles['section-alt']}`}>
        <div className={styles['section-inner']}>
          <p className={styles['section-overline']}>Technology</p>
          <h2 className={styles['section-title']}>Modern stack, proven patterns</h2>
          <p className={styles['section-sub']}>
            Carefully chosen technologies that work together to deliver a fast, type-safe,
            and maintainable application.
          </p>
          <div className={styles['tech-grid']}>
            <div className={styles['tech-card']}>
              <div className={styles['tech-icon']}><CodeSlash size={20} /></div>
              <h3 className={styles['tech-title']}>Frontend</h3>
              <ul className={styles['tech-list']}>
                <li>React 19 + TypeScript</li>
                <li>Redux Toolkit</li>
                <li>React Router v7</li>
                <li>CSS Modules + Bootstrap</li>
                <li>Vite</li>
              </ul>
            </div>
            <div className={styles['tech-card']}>
              <div className={styles['tech-icon']}><GearFill size={20} /></div>
              <h3 className={styles['tech-title']}>Backend</h3>
              <ul className={styles['tech-list']}>
                <li>Java + Spring Boot 3</li>
                <li>Spring Security + JWT</li>
                <li>Feign Client (inter-service)</li>
                <li>Spring Data JPA</li>
                <li>Maven</li>
              </ul>
            </div>
            <div className={styles['tech-card']}>
              <div className={styles['tech-icon']}><BuildingFill size={20} /></div>
              <h3 className={styles['tech-title']}>Infrastructure</h3>
              <ul className={styles['tech-list']}>
                <li>Spring Cloud Gateway</li>
                <li>Eureka Service Discovery</li>
                <li>Centralised Audit Logging</li>
                <li>Role-Based Access Control</li>
                <li>Relational Database</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className={styles['cta-band']}>
        <div className={styles['cta-inner']}>
          <h2 className={styles['cta-title']}>Ready to experience EventSphere?</h2>
          <p className={styles['cta-sub']}>
            Head to your dashboard and start managing events like a pro.
          </p>
          <div className={styles['cta-actions']}>
            <Link to="/dashboard" className={styles['btn-primary-light']}>
              Open Dashboard <ArrowRight size={14} />
            </Link>
            <Link to="/contact" className={styles['btn-ghost-light']}>
              Contact Us
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
