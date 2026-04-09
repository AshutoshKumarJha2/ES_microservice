import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchCurrentUser } from '../../store/slices/authSlice'
import { setSidebarCollapsed } from '../../store/slices/uiSlice'
import { Sidebar } from './Sidebar'
import { AppHeader } from './AppHeader'
import styles from '../../css/layout/AuthenticatedLayout.module.css'

export const AuthenticatedLayout: React.FC = () => {
  const dispatch = useAppDispatch()
  const { user, accessToken } = useAppSelector((state) => state.auth)
  const { sidebarCollapsed } = useAppSelector((state) => state.ui)

  // Hydrate user from token on page refresh
  useEffect(() => {
    if (accessToken && !user) {
      dispatch(fetchCurrentUser())
    }
  }, [accessToken, user, dispatch])

  const handleOverlayClick = () => {
    dispatch(setSidebarCollapsed(true))
  }

  return (
    <div className={styles.shell}>
      <Sidebar />

      {/* Mobile overlay */}
      {!sidebarCollapsed && (
        <div
          className={`${styles.overlay} ${styles.visible}`}
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      <div className={styles.main}>
        <AppHeader />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
