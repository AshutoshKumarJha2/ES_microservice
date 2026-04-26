import { NavLink, useLocation } from 'react-router-dom'
import { Nav } from 'react-bootstrap'

const LINKS = [
  { to: '/finance/dashboard',  label: 'Dashboard',         exact: true  },
  { to: '/finance/expenses',   label: 'Expense Approvals', exact: false },
  { to: '/finance/payments',   label: 'Payments',          exact: false },
  { to: '/finance/budget',     label: 'Budget Overview',   exact: false },
  { to: '/finance/invoices',   label: 'Invoices',          exact: false },
]

export const FinanceSubNav: React.FC = () => {
  const { pathname } = useLocation()

  return (
    <div
      className="border-bottom"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)', transition: 'background 0.3s' }}
    >
      <div className="container-fluid px-3 px-md-4">
        <Nav>
          {LINKS.map(({ to, label, exact }) => {
            const active = exact ? pathname === to : pathname.startsWith(to)
            return (
              <Nav.Link
                key={to}
                as={NavLink}
                to={to}
                style={{
                  color: active ? 'var(--blue)' : 'var(--text-secondary)',
                  fontWeight: active ? 600 : 400,
                  borderBottom: active ? '2px solid var(--blue)' : '2px solid transparent',
                  paddingBottom: '0.6rem',
                  paddingTop: '0.6rem',
                  fontSize: '0.9rem',
                  marginRight: '0.25rem',
                }}
              >
                {label}
              </Nav.Link>
            )
          })}
        </Nav>
      </div>
    </div>
  )
}
