import { Link } from 'react-router-dom'
import { Container, Row, Col, Nav } from 'react-bootstrap'

const year = new Date().getFullYear()

const FOOTER_COLS = [
  {
    heading: 'Platform',
    links: [
      { label: 'Home',      to: '/' },
      { label: 'About',     to: '/about' },
      { label: 'Contact',   to: '/contact' },
      { label: 'Dashboard', to: '/dashboard' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', to: '#' },
      { label: 'Terms of Service', to: '#' },
      { label: 'Cookie Policy', to: '#' },
    ],
  },
]

export const Footer = () => {
  return (
    <footer
      style={{
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-color)',
        transition: 'background 0.3s, border-color 0.3s',
      }}
    >
      {/* Top */}
      <Container className="py-5">
        <Row className="g-4">
          {/* Brand column */}
          <Col xs={12} md={4}>
            <Link to="/" className="es-logo text-decoration-none d-inline-block mb-3">
              <span className="es-event">event</span>
              <span className="es-sphere">sphere</span>
            </Link>
            <p className="small" style={{ color: 'var(--text-secondary)', maxWidth: 260 }}>
              A unified platform for organizers, attendees, and vendors to plan, manage, and experience events seamlessly.
            </p>
          </Col>

          {/* Link columns */}
          {FOOTER_COLS.map((col) => (
            <Col key={col.heading} xs={6} md={true}>
              <p
                className="fw-bold mb-3"
                style={{ fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-primary)' }}
              >
                {col.heading}
              </p>
              <Nav className="flex-column gap-1">
                {col.links.map((lnk) => (
                  <Nav.Link
                    key={lnk.label}
                    as={Link}
                    to={lnk.to}
                    className="p-0"
                    style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}
                  >
                    {lnk.label}
                  </Nav.Link>
                ))}
              </Nav>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Bottom */}
      <div style={{ borderTop: '1px solid var(--border-color)' }}>
        <Container className="py-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
          <span className="small" style={{ color: 'var(--text-muted)' }}>
            © {year} EventSphere. All rights reserved.
          </span>
          <div className="d-flex gap-3">
            {['Privacy', 'Terms'].map((label) => (
              <a key={label} href="#" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {label}
              </a>
            ))}
            <Link to="/contact" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Support
            </Link>
          </div>
        </Container>
      </div>
    </footer>
  )
}
