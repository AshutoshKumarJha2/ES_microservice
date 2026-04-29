import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchBudgets, toggleBudgetSort } from '../../../store/slices/Finance/financeSlice'
import { TableRowsSkeleton } from '../../elements/skeletons/PageSkeleton'
import { PageBanner } from '../../elements/common/PageBanner'
import { AdminSubNav } from '../../elements/admin/AdminSubNav'
import { Container, Card, Table } from 'react-bootstrap'
import styles from '../../../css/finance/Finance.module.css'

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n)

const getUtilization = (actual: number, planned: number) =>
  planned > 0 ? Math.round((actual / planned) * 100) : 0

const getProgressClass = (pct: number) => {
  if (pct > 90) return styles.progressRed
  if (pct >= 70) return styles.progressOrange
  return styles.progressGreen
}

export const AdminBudget: React.FC = () => {
  const dispatch = useAppDispatch()
  const { budgets, budgetsLoading, budgetsError, budgetSortAsc } = useAppSelector((s) => s.finance)

  useEffect(() => { dispatch(fetchBudgets()) }, [dispatch])

  const sorted = [...budgets].sort((a, b) => {
    const uA = getUtilization(a.actualAmount, a.plannedAmount)
    const uB = getUtilization(b.actualAmount, b.plannedAmount)
    return budgetSortAsc ? uA - uB : uB - uA
  })

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <PageBanner title="Budget Overview" subtitle="Financial summary across all events" />
      <AdminSubNav />
      <Container fluid className="px-3 px-md-4 py-4">

        <Card className="es-card border shadow-sm">
          <Card.Body className="p-0">
            {budgetsLoading ? (
              <Table hover responsive className="mb-0" style={{ fontSize: '0.88rem' }}>
                <thead style={{ background: 'var(--bg-subtle)' }}>
                  <tr>
                    <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Event</th>
                    <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Planned</th>
                    <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Expenses</th>
                    <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Remaining</th>
                    <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Utilization</th>
                  </tr>
                </thead>
                <tbody><TableRowsSkeleton rows={5} cols={5} colWidths={['28%','18%','18%','18%','18%']} /></tbody>
              </Table>
            ) : budgetsError ? (
              <div className="text-center py-5 small" style={{ color: 'var(--text-muted)' }}>{budgetsError}</div>
            ) : sorted.length === 0 ? (
              <div className="text-center py-5 small" style={{ color: 'var(--text-muted)' }}>No budgets found.</div>
            ) : (
              <Table hover responsive className="mb-0" style={{ fontSize: '0.88rem', tableLayout: 'fixed' }}>
                <thead style={{ background: 'var(--bg-subtle)' }}>
                  <tr>
                    <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)', width: '28%' }}>Event</th>
                    <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)', width: '18%' }}>Planned</th>
                    <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)', width: '18%' }}>Expenses</th>
                    <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)', width: '18%' }}>Remaining</th>
                    <th
                      className="fw-semibold border-0 pb-2"
                      style={{ color: 'var(--text-primary)', width: '18%', cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => dispatch(toggleBudgetSort())}
                    >
                      Utilization {budgetSortAsc ? '▲' : '▼'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((b) => {
                    const pct = getUtilization(b.actualAmount, b.plannedAmount)
                    return (
                      <tr key={b.budgetId}>
                        <td className="align-middle fw-medium" style={{ color: 'var(--text-primary)' }}>{b.eventName}</td>
                        <td className="align-middle" style={{ color: 'var(--text-body)' }}>{formatCurrency(b.plannedAmount)}</td>
                        <td className="align-middle" style={{ color: 'var(--text-body)' }}>{formatCurrency(b.actualAmount)}</td>
                        <td className="align-middle" style={{ color: 'var(--text-body)' }}>{formatCurrency(b.variance)}</td>
                        <td className="align-middle">
                          <div className={styles.utilizationCell}>
                            <div className={styles.progressBar}>
                              <div
                                className={`${styles.progressFill} ${getProgressClass(pct)}`}
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              />
                            </div>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  )
}
