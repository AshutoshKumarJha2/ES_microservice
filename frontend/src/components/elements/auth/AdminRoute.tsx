import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '../../../store/hooks'

export const AdminRoute: React.FC = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user && user.role !== 'ADMIN') return <Navigate to="/" replace />

  return <Outlet />
}
