import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchCurrentUser, logout } from '../../../store/slices/authSlice'
import { toast, Bounce } from 'react-toastify'

export const ProtectedRoute: React.FC = () => {
  const dispatch = useAppDispatch()
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const { pathname } = useLocation()

  useEffect(() => {
    if (!isAuthenticated) return
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
  }, [pathname, dispatch, isAuthenticated])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
