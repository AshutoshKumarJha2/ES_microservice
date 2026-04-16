import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../../../store/hooks'
import { fetchCurrentUser, logout, refreshSession } from '../../../store/slices/authSlice'
import { toast, Bounce } from 'react-toastify'

function isAccessTokenExpired(): boolean {
  const token = localStorage.getItem('accessToken')
  if (!token) return true
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

export const AdminRoute: React.FC = () => {
  const dispatch = useAppDispatch()
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const { pathname } = useLocation()

  useEffect(() => {
    if (!isAuthenticated) return

    const run = async () => {
      if (isAccessTokenExpired()) {
        const refreshResult = await dispatch(refreshSession())
        if (refreshSession.rejected.match(refreshResult)) return
      }

      const result = await dispatch(fetchCurrentUser())
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
    }

    run()
  }, [pathname, dispatch, isAuthenticated])

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user && user.role !== 'ADMIN') return <Navigate to="/" replace />

  return <Outlet />
}
