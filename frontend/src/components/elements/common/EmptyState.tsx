interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export const EmptyState = ({ icon, title, subtitle, action }: EmptyStateProps) => (
  <div className="text-center py-5 d-flex flex-column align-items-center gap-3">
    <div style={{
      width: 56, height: 56, borderRadius: 16,
      background: 'var(--blue-subtle)', color: 'var(--blue)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {icon}
    </div>
    <div>
      <div className="fw-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{title}</div>
      {subtitle && <div className="small" style={{ color: 'var(--text-muted)' }}>{subtitle}</div>}
    </div>
    {action}
  </div>
)
