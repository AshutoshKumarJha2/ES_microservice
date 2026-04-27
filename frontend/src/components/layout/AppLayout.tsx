import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchCurrentUser } from '../../store/slices/authSlice'
import { fetchNotifications } from '../../store/slices/notificationsSlice'
import { Header } from './Header'
import { Footer } from './Footer'

export const AppLayout = () => {
  const dispatch = useAppDispatch()
  const { user, accessToken } = useAppSelector((state) => state.auth)
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  useEffect(() => {
    if (accessToken && !user) {
      dispatch(fetchCurrentUser())
    }
  }, [accessToken, user, dispatch])

  useEffect(() => {
    if (user) dispatch(fetchNotifications())
  }, [user, dispatch])

  return (
    <>
      <a href="#main-content" className="es-skip-link">Skip to main content</a>
      <Header />
      <main id="main-content">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}