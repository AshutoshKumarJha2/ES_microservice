import { Pagination } from 'react-bootstrap'

interface PaginationBarProps {
  page: number
  totalPages: number
  totalElements?: number
  label?: string
  onChange: (page: number) => void
  className?: string
}

export const PaginationBar = ({ page, totalPages, totalElements, label, onChange, className }: PaginationBarProps) => {
  if (totalPages <= 1) return null
  const start = Math.max(0, Math.min(page - 2, totalPages - 5))
  return (
    <div className={`d-flex ${totalElements !== undefined ? 'justify-content-between' : 'justify-content-center'} align-items-center mt-3 ${className ?? ''}`}>
      {totalElements !== undefined && (
        <small style={{ color: 'var(--text-muted)' }}>
          Page {page + 1} of {totalPages} · {totalElements.toLocaleString()}{label ? ` ${label}` : ''}
        </small>
      )}
      <Pagination size="sm" className="mb-0 ms-auto">
        <Pagination.Prev disabled={page === 0} onClick={() => onChange(page - 1)} />
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const p = start + i
          return (
            <Pagination.Item key={p} active={p === page} onClick={() => onChange(p)}>
              {p + 1}
            </Pagination.Item>
          )
        })}
        <Pagination.Next disabled={page + 1 >= totalPages} onClick={() => onChange(page + 1)} />
      </Pagination>
    </div>
  )
}
