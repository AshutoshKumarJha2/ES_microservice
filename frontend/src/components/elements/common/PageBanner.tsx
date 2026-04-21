import { Container } from 'react-bootstrap'

interface PageBannerProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export const PageBanner = ({ title, subtitle, actions }: PageBannerProps) => (
  <div className="es-banner">
    <Container fluid className="px-3 px-md-4 py-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
      <div>
        <h1 className="fw-bold fs-3 mb-1">{title}</h1>
        {subtitle && <p className="mb-0 small" style={{ color: 'rgba(255,255,255,0.72)' }}>{subtitle}</p>}
      </div>
      {actions && <div className="d-flex gap-2 flex-wrap align-items-center">{actions}</div>}
    </Container>
  </div>
)
