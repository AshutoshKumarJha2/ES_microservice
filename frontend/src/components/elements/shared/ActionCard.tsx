import { Col, Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'

interface Props {
  title: string
  desc: string
  accent: string
  to: string
  linkLabel?: string
}

export const ActionCard = ({ title, desc, accent, to, linkLabel = 'Go →' }: Props) => (
  <Col xs={12} md={6} lg={3}>
    <Link to={to} style={{ textDecoration: 'none' }}>
      <Card className={`es-card border shadow-sm h-100 ${accent}`} style={{ cursor: 'pointer' }}>
        <Card.Body className="p-3">
          <Card.Title className="fw-semibold mb-2" style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
            {title}
          </Card.Title>
          <p className="small mb-3" style={{ color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            {desc}
          </p>
          <span className="small fw-bold" style={{ color: 'var(--blue)' }}>
            {linkLabel}
          </span>
        </Card.Body>
      </Card>
    </Link>
  </Col>
)
