import type { ReactNode } from 'react'

interface Props {
  title: string
  children?: ReactNode
}

export const PanelHeader = ({ title, children }: Props) => (
  <div className="d-flex justify-content-between align-items-center mb-3">
    <h6 className="fw-semibold mb-0" style={{ color: 'var(--text-primary)' }}>{title}</h6>
    {children}
  </div>
)
