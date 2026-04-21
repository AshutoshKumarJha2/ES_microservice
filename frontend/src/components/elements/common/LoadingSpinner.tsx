import { Spinner } from 'react-bootstrap'

export const LoadingSpinner = () => (
  <div className="text-center py-5">
    <Spinner animation="border" style={{ color: 'var(--blue)' }} />
  </div>
)
