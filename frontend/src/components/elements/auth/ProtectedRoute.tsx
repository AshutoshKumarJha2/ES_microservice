import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
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

export const ProtectedRoute: React.FC = () => {
  const dispatch = useAppDispatch()
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const { pathname } = useLocation()

  useEffect(() => {
    if (!isAuthenticated) return

    const run = async () => {
      // If the access token is expired, silently refresh it before doing anything else.
      // This prevents the backend from ever seeing an expired token on this request.
      if (isAccessTokenExpired()) {
        const refreshResult = await dispatch(refreshSession())
        // If the refresh token is also invalid, refreshSession.rejected will set
        // isAuthenticated = false and React will redirect below — nothing more to do.
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

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
