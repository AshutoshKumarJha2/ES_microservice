import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchBudgets, toggleBudgetSort } from '../../../store/slices/Finance/financeSlice'
import styles from '../../../css/finance/Finance.module.css'
import { TableRowsSkeleton } from '../../elements/skeletons/PageSkeleton'

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n)

const getUtilization = (actual: number, planned: number) =>
  planned > 0 ? Math.round((actual / planned) * 100) : 0

const getProgressClass = (pct: number) => {
  if (pct > 90) return styles.progressRed
  if (pct >= 70) return styles.progressOrange
  return styles.progressGreen
}

export const BudgetOverview = () => {
  const dispatch = useAppDispatch()
  const { budgets, budgetsLoading, budgetsError, budgetSortAsc } = useAppSelector((s) => s.finance)

  useEffect(() => { dispatch(fetchBudgets()) }, [dispatch])

  const sorted = [...budgets].sort((a, b) => {
    const uA = getUtilization(a.actualAmount, a.plannedAmount)
    const uB = getUtilization(b.actualAmount, b.plannedAmount)
    return budgetSortAsc ? uA - uB : uB - uA
  })

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Budget Overview</h1>
          <p className={styles.pageSubtitle}>Financial summary across all events</p>
        </div>
      </div>

      <div className={`${styles.card} ${styles.cardNoPad}`}>
        {budgetsLoading ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Event</th><th>Planned</th><th>Expenses</th><th>Remaining</th><th>Utilization</th>
              </tr>
            </thead>
            <tbody><TableRowsSkeleton rows={5} cols={5} /></tbody>
          </table>
        ) : budgetsError ? (
          <div className={styles.loadingState}>{budgetsError}</div>
        ) : sorted.length === 0 ? (
          <div className={styles.emptyState}>No budgets found.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Event</th>
                <th>Planned</th>
                <th>Expenses</th>
                <th>Remaining</th>
                <th className={styles.sortable} onClick={() => dispatch(toggleBudgetSort())}>
                  Utilization {budgetSortAsc ? '▲' : '▼'}
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((b) => {
                const pct = getUtilization(b.actualAmount, b.plannedAmount)
                return (
                  <tr key={b.budgetId}>
                    <td><strong>{b.eventName}</strong></td>
                    <td>{formatCurrency(b.plannedAmount)}</td>
                    <td>{formatCurrency(b.actualAmount)}</td>
                    <td>{formatCurrency(b.variance)}</td>
                    <td>
                      <div className={styles.utilizationCell}>
                        <div className={styles.progressBar}>
                          <div
                            className={`${styles.progressFill} ${getProgressClass(pct)}`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        {pct}%
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
