import { Outlet, NavLink, useLocation } from 'react-router-dom'
import styles from '../../css/finance/Finance.module.css'

const BREADCRUMBS: Record<string, string> = {
  '/finance/expenses': 'Finance › Expense Approvals',
  '/finance/payments': 'Finance › Payments',
  '/finance/budget': 'Finance › Budget Overview',
}

export const FinanceLayout = () => {
  const location = useLocation()
  const breadcrumb = BREADCRUMBS[location.pathname] || 'Finance'

  return (
    <div className={styles.portalWrapper}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <div className={styles.logoWordmark}>
            event<span className={styles.logoSaffron}>sphere</span>
          </div>
          <span className={styles.logoSub}>Finance Officer Portal</span>
        </div>

        <div className={styles.navGroup}>
          <div className={styles.navGroupLabel}>Finance Officer</div>
          <NavLink
            to="/finance/expenses"
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
          >
            Expense Approvals
          </NavLink>
          <NavLink
            to="/finance/payments"
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
          >
            Payments
          </NavLink>
          <NavLink
            to="/finance/budget"
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
          >
            Budget Overview
          </NavLink>
        </div>

        <div className={styles.sidebarNote}>EventSphere — Finance Module</div>
      </aside>

      <div className={styles.main}>
        <div className={styles.topbar}>
          <div className={styles.breadcrumb}>{breadcrumb}</div>
          <div className={styles.userChip}>Finance Officer</div>
        </div>
        <div className={styles.pageContent}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
