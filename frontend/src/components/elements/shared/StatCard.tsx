import { Col, Card, Spinner } from 'react-bootstrap'

interface Props {
  label: string
  value: number | string
  accent: string
  loading?: boolean
}

export const StatCard = ({ label, value, accent, loading }: Props) => (
  <Col xs={6} lg={3}>
    <Card className={`es-card border shadow-sm h-100 ${accent}`}>
      <Card.Body className="p-3">
        <div className="small fw-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </div>
        <div className="fw-bold" style={{ fontSize: '1.8rem', color: 'var(--text-primary)', lineHeight: 1.1 }}>
          {loading ? <Spinner animation="border" size="sm" /> : value}
        </div>
      </Card.Body>
    </Card>
  </Col>
)
