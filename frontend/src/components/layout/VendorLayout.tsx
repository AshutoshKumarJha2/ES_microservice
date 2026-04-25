import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchCurrentUser } from '../../store/slices/authSlice'
import { Header } from './Header'
import { TabBar } from '../elements/TabBar'

export const SUB_TABS = [
  { to: '/vendor',            label: 'Dashboard'  },
  { to: '/vendor/vendors',    label: 'Vendor'     },
  { to: '/vendor/contracts',  label: 'Contracts'  },
  { to: '/vendor/deliveries', label: 'Deliveries' },
  { to: '/vendor/invoices',   label: 'Invoices'   },
]

export const VendorLayout = () => {
  const dispatch = useAppDispatch()
  const { accessToken, user } = useAppSelector((s) => s.auth)

  useEffect(() => {
    if (accessToken && !user) dispatch(fetchCurrentUser())
  }, [accessToken, user, dispatch])

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <Header />

      <Outlet />
    </div>
  )
}
