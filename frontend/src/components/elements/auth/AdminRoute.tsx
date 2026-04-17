import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../../../store/hooks'
import { fetchCurrentUser, logout } from '../../../store/slices/authSlice'
import { toast, Bounce } from 'react-toastify'

export const AdminRoute: React.FC = () => {
  const dispatch = useAppDispatch()
  const { user, isAuthenticated, userLoading } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (!isAuthenticated) return
    if (user) return

    dispatch(fetchCurrentUser()).then((result) => {
      if (fetchCurrentUser.fulfilled.match(result) && result.payload.status === 'SUSPENDED') {
        toast.error('Your account has been suspended. Please contact support.', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'light',
          transition: Bounce,
        })
        dispatch(logout())
      }
    })
  }, [dispatch, isAuthenticated, user])

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (userLoading || !user) return null

  if (user.role !== 'ADMIN') return <Navigate to="/" replace />

  return <Outlet />
}
