import { Outlet } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setSidebarCollapsed } from '../../store/slices/uiSlice'
import { Sidebar } from './Sidebar'
import { AppHeader } from './AppHeader'
import styles from '../../css/layout/AuthenticatedLayout.module.css'

export const AuthenticatedLayout: React.FC = () => {
  const dispatch = useAppDispatch()
  const { sidebarCollapsed } = useAppSelector((state) => state.ui)

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
