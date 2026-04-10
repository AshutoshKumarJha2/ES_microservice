import { Link } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'
import {
  CalendarEventFill,
  TicketFill,
  BarChartFill,
  ShieldFillCheck,
  LightningChargeFill,
  PeopleFill,
  ArrowRight,
  CheckCircleFill,
} from 'react-bootstrap-icons'
import styles from '../../css/Home.module.css'

const FEATURES = [
  {
    icon: <CalendarEventFill size={22} />,
    title: 'Event Management',
    desc: 'Create and manage events from start to finish — sessions, venues, schedules and more.',
    color: 'blue',
  },
  {
    icon: <TicketFill size={22} />,
    title: 'Ticketing & Registration',
    desc: 'Sell tickets, manage registrations, and approve attendees with a single click.',
    color: 'orange',
  },
  {
    icon: <BarChartFill size={22} />,
    title: 'Real-Time Analytics',
    desc: 'Track engagement, feedback ratings, and attendee activity as events unfold.',
    color: 'blue',
  },
  {
    icon: <ShieldFillCheck size={22} />,
    title: 'Role-Based Access',
    desc: 'Granular permissions for Admins, Organizers, Venue Managers, and Attendees.',
    color: 'orange',
  },
]

const STEPS = [
  {
    number: '01',
    title: 'Create your event',
    desc: 'Set up event details, choose a venue, define sessions, and configure tickets in minutes.',
  },
  {
    number: '02',
    title: 'Manage registrations',
    desc: 'Review attendee registrations, approve or reject applications, and track capacity.',
  },
  {
    number: '03',
    title: 'Analyse & grow',
    desc: 'Access real-time dashboards, engagement metrics, and budget reports after your event.',
  },
]

const ROLES = [
  { name: 'Organizer', desc: 'Create events, manage sessions, approve registrations, and track budgets.', pill: 'pill-blue' },
  { name: 'Attendee', desc: 'Browse events, register with a ticket, and submit feedback after attending.', pill: 'pill-green' },
  { name: 'Admin', desc: 'Oversee the entire platform — users, events, audit logs, and system health.', pill: 'pill-orange' },
  { name: 'Venue Manager', desc: 'Control venue availability, capacity settings, and scheduling conflicts.', pill: 'pill-blue' },
  { name: 'Finance Officer', desc: 'Review budgets, approve expenses, and generate financial summaries.', pill: 'pill-green' },
  { name: 'Vendor', desc: 'Collaborate with organizers on event logistics, contracts, and invoices.', pill: 'pill-orange' },
]

const STATS = [
  { value: '10+', label: 'Microservices' },
  { value: '6', label: 'User Roles' },
  { value: '50+', label: 'API Endpoints' },
  { value: '∞', label: 'Possibilities' },
]

export const Home = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)

  const getDashboardPath = () => {
    if (!user) return '/dashboard'
    if (user.role === 'ORGANIZER') return '/organizer/dashboard'
    if (user.role === 'ADMIN') return '/admin/dashboard'
    return '/dashboard'
  }

  return (
    <div className={styles.page}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles['hero-inner']}>
          <span className={styles['hero-badge']}>
            <LightningChargeFill size={11} /> Event Management Platform
          </span>
          <h1 className={styles['hero-title']}>
            Plan. Manage.{' '}
            <span className={styles['hero-accent']}>Succeed.</span>
          </h1>
          <p className={styles['hero-sub']}>
            EventSphere is a full-featured event management platform built for organisers,
            administrators, and attendees — all in one connected system.
          </p>
          <div className={styles['hero-actions']}>
            {isAuthenticated ? (
              <Link to={getDashboardPath()} className={styles['btn-primary']}>
                Go to Dashboard <ArrowRight size={15} />
              </Link>
            ) : (
              <>
                <Link to="/register" className={styles['btn-primary']}>
                  Get Started Free <ArrowRight size={15} />
                </Link>
                <Link to="/login" className={styles['btn-ghost']}>
                  Sign In
                </Link>
              </>
            )}
          </div>
          <div className={styles['hero-checks']}>
            {['Role-based access control', 'Real-time analytics', 'Full audit trail'].map((item) => (
              <span key={item} className={styles['hero-check']}>
                <CheckCircleFill size={12} style={{ color: '#4ade80' }} /> {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      <div className={styles['stats-strip']}>
        <div className={styles['stats-inner']}>
          {STATS.map((s) => (
            <div key={s.label} className={styles['stat-item']}>
              <span className={styles['stat-value']}>{s.value}</span>
              <span className={styles['stat-label']}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles['section-inner']}>
          <p className={styles['section-overline']}>Everything you need</p>
          <h2 className={styles['section-title']}>Built for every role on your team</h2>
          <p className={styles['section-sub']}>
            From the first planning stage to post-event reports, EventSphere covers every step of your workflow.
          </p>
          <div className={styles['features-grid']}>
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className={`${styles['feature-card']} ${styles[`feature-${f.color}`]}`}
              >
                <div className={styles['feature-icon']}>{f.icon}</div>
                <h3 className={styles['feature-title']}>{f.title}</h3>
                <p className={styles['feature-desc']}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className={`${styles.section} ${styles['section-alt']}`}>
        <div className={styles['section-inner']}>
          <p className={styles['section-overline']}>How it works</p>
          <h2 className={styles['section-title']}>Three steps to a great event</h2>
          <p className={styles['section-sub']}>
            EventSphere streamlines the entire lifecycle so you can focus on what matters most.
          </p>
          <div className={styles['steps-grid']}>
            {STEPS.map((s) => (
              <div key={s.number} className={styles['step-card']}>
                <span className={styles['step-number']}>{s.number}</span>
                <h3 className={styles['step-title']}>{s.title}</h3>
                <p className={styles['step-desc']}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roles ────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles['section-inner']}>
          <p className={styles['section-overline']}>Who it's for</p>
          <h2 className={styles['section-title']}>A platform for every stakeholder</h2>
          <p className={styles['section-sub']}>
            Six distinct roles give everyone the right tools without stepping on each other's toes.
          </p>
          <div className={styles['roles-grid']}>
            {ROLES.map((r) => (
              <div key={r.name} className={styles['role-card']}>
                <span className={`${styles['role-badge-pill']} ${styles[r.pill]}`}>
                  {r.name}
                </span>
                <p className={styles['role-name']}>{r.name}</p>
                <p className={styles['role-desc']}>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA band ─────────────────────────────────────────────────────── */}
      <section className={styles['cta-band']}>
        <div className={styles['cta-inner']}>
          <PeopleFill size={32} style={{ color: 'rgba(255,255,255,0.5)' }} />
          {isAuthenticated ? (
            <>
              <h2 className={styles['cta-title']}>Welcome to EventSphere</h2>
              <p className={styles['cta-sub']}>
                You're signed in and ready to go. Head to your dashboard to get started.
              </p>
              <div className={styles['cta-actions']}>
                <Link to={getDashboardPath()} className={styles['btn-primary-light']}>
                  Open Dashboard <ArrowRight size={15} />
                </Link>
                <Link to="/about" className={styles['btn-ghost-light']}>
                  About the Platform
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className={styles['cta-title']}>Ready to run better events?</h2>
              <p className={styles['cta-sub']}>
                Join EventSphere today and take full control of your event lifecycle.
              </p>
              <div className={styles['cta-actions']}>
                <Link to="/register" className={styles['btn-primary-light']}>
                  Create an Account <ArrowRight size={15} />
                </Link>
                <Link to="/about" className={styles['btn-ghost-light']}>
                  Learn More
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

    </div>
  )
}
