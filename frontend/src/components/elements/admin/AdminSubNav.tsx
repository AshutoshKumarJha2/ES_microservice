import { NavLink } from 'react-router-dom'

const LINKS = [
  { to: '/admin/dashboard',  label: 'Dashboard' },
  { to: '/admin/users',      label: 'Users' },
  { to: '/admin/events',     label: 'Events' },
  { to: '/admin/expenses',   label: 'Expenses' },
  { to: '/admin/budget',     label: 'Budget' },
  { to: '/admin/audit-logs', label: 'Audit Logs' },
]

export const AdminSubNav: React.FC = () => (
  <div
    className="border-bottom"
    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)', transition: 'background 0.3s' }}
  >
    <div className="container-fluid px-3 px-md-4">
      <nav className="nav">
        {LINKS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin/dashboard'}
            className="nav-link"
            style={({ isActive }) => ({
              color: isActive ? 'var(--blue)' : 'var(--text-secondary)',
              fontWeight: isActive ? 600 : 400,
              borderBottom: isActive ? '2px solid var(--blue)' : '2px solid transparent',
              paddingBottom: '0.6rem',
              paddingTop: '0.6rem',
              fontSize: '0.9rem',
              marginRight: '0.25rem',
            })}
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  </div>
)
