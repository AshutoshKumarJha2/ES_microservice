import { NavLink } from 'react-router-dom'
import { Nav } from 'react-bootstrap'

const LINKS = [
  { to: '/admin/dashboard',  label: 'Dashboard' },
  { to: '/admin/users',      label: 'Users' },
  { to: '/admin/events',     label: 'Events' },
  { to: '/admin/audit-logs', label: 'Audit Logs' },
]

export const AdminSubNav: React.FC = () => (
  <div
    className="border-bottom"
    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)', transition: 'background 0.3s' }}
  >
    <div className="container-fluid px-3 px-md-4">
      <Nav>
        {LINKS.map(({ to, label }) => (
          <Nav.Link
            key={to}
            as={NavLink}
            to={to}
            end={to === '/admin/dashboard'}
            style={({ isActive }: { isActive: boolean }) => ({
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
          </Nav.Link>
        ))}
      </Nav>
    </div>
  </div>
)
