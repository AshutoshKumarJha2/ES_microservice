import { useEffect } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchCurrentUser } from '../../store/slices/authSlice'
import { Container } from 'react-bootstrap'
import { Header } from './Header'
import { TabBar } from '../elements/TabBar'

export const SUB_TABS = [
  { to: '/venue-manager/dashboard',        label: 'Dashboard'  },
  { to: '/venue-manager/venues',           label: 'Venues'     },
  { to: '/venue-manager/venue/bookings',   label: 'Bookings'   },
  { to: '/venue-manager/venue/resources',  label: 'Resources'  },
]

export const VenueLayout = () => {
  const dispatch = useAppDispatch()
  const { accessToken, user } = useAppSelector((s) => s.auth)

  useEffect(() => {
    if (accessToken && !user) dispatch(fetchCurrentUser())
  }, [accessToken, user, dispatch])

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <Header />

      {/* <div className="border-bottom" style={{ background: 'var(--bg-surface)' }}>
      <Container fluid className="px-3 px-md-4">
        <div className="d-flex align-items-center gap-3 py-2 flex-wrap">
        <span className="fw-semibold small" style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
          Venue Manager Portal
        </span>
        <nav className="d-flex gap-1">
          {SUB_TABS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
            `nav-link px-3 py-1 rounded-2 small fw-medium${isActive ? ' fw-semibold' : ''}`
            }
            style={({ isActive }) => ({
            color: isActive ? 'var(--blue)' : 'var(--text-secondary)',
            background: isActive ? 'var(--bg-hover)' : 'transparent',
            })}
          >
            {label}
          </NavLink>
          ))}
        </nav>
        </div>
      </Container>
      </div> */}


      <Outlet />
    </div>
  )
}
