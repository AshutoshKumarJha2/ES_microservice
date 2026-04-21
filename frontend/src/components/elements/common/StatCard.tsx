import { Card } from 'react-bootstrap'

interface StatCardProps {
  label: string
  value: number | string
  accent: string
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  loading?: boolean
}

export const StatCard = ({ label, value, accent, icon, iconBg, iconColor, loading }: StatCardProps) => (
  <Card className={`es-card border shadow-sm h-100 ${accent}`}>
    <Card.Body className="p-3">
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <div className="small fw-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</div>
          <div className="fw-bold" style={{ fontSize: '1.8rem', color: 'var(--text-primary)', lineHeight: 1.1 }}>
            {loading ? '—' : value}
          </div>
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: iconBg, color: iconColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>
    </Card.Body>
  </Card>
)
