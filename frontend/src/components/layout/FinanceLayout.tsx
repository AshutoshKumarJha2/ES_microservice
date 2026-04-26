import { Outlet } from 'react-router-dom'
import { Header } from './Header'

export const FinanceLayout = () => (
  <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
    <Header />
    <Outlet />
  </div>
)
