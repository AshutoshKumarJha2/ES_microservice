import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
  fetchAllExpenses,
  approveExpense,
  rejectExpense,
  setActiveStatusFilter,
  clearActionError,
} from '../../../store/slices/Finance/financeSlice'

import type { ExpenseStatus } from '../../../types/finance'
import { StatusBadge } from '../../elements/finance/StatusBadge'
import styles from '../../../css/finance/Finance.module.css'

const FILTERS: ExpenseStatus[] = ['SUBMITTED', 'APPROVED', 'REJECTED', 'PAID']
const FILTER_LABELS: Record<ExpenseStatus, string> = {
  SUBMITTED: 'Submitted', APPROVED: 'Approved', REJECTED: 'Rejected', PAID: 'Paid',
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n)

const formatDate = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

export const ExpenseApprovals = () => {
  const dispatch = useAppDispatch()
  const { expenses, expensesLoading, expensesError, activeStatusFilter } = useAppSelector((s) => s.finance)
  const actionError = useAppSelector((s) => s.finance.actionError)

  useEffect(() => { dispatch(fetchAllExpenses()) }, [dispatch])

  const counts: Record<ExpenseStatus, number> = {
    SUBMITTED: expenses.filter((e) => e.status === 'SUBMITTED').length,
    APPROVED: expenses.filter((e) => e.status === 'APPROVED').length,
    REJECTED: expenses.filter((e) => e.status === 'REJECTED').length,
    PAID: expenses.filter((e) => e.status === 'PAID').length,
  }

  const filtered = expenses.filter((e) => e.status === activeStatusFilter)

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Expense Approvals</h1>
          <p className={styles.pageSubtitle}>Review and action submitted expenses</p>
        </div>
      </div>

      {actionError && (
        <div className={styles.errorBanner}>
          <span>{actionError}</span>
          <button className={styles.errorDismiss} onClick={() => dispatch(clearActionError())}>✕</button>
        </div>
      )}

      <div className={styles.filterRow}>
        {FILTERS.map((status) => (
          <div
            key={status}
            className={`${styles.filterChip} ${activeStatusFilter === status ? styles.filterChipActive : ''}`}
            onClick={() => dispatch(setActiveStatusFilter(status))}
          >
            {FILTER_LABELS[status]} ({counts[status]})
          </div>
        ))}
      </div>

      <div className={`${styles.card} ${styles.cardNoPad}`}>
        {expensesLoading ? (
          <div className={styles.loadingState}>Loading expenses…</div>
        ) : expensesError ? (
          <div className={styles.loadingState}>{expensesError}</div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyState}>No {FILTER_LABELS[activeStatusFilter].toLowerCase()} expenses found.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Event</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((exp) => (
                <tr key={exp.expenseId}>
                  <td>{exp.eventId.slice(0, 8)}…</td>
                  <td>{exp.description}</td>
                  <td>{formatCurrency(exp.amount)}</td>
                  <td>{formatDate(exp.date)}</td>
                  <td><StatusBadge status={exp.status} /></td>
                  <td>
                    {exp.status === 'SUBMITTED' ? (
                      <div className={styles.btnGroup}>
                        <button
                          className={`${styles.btn} ${styles.btnSm} ${styles.btnPrimary}`}
                          onClick={() => dispatch(approveExpense(exp.expenseId))}
                        >
                          Approve
                        </button>
                        <button
                          className={`${styles.btn} ${styles.btnSm} ${styles.btnDanger}`}
                          onClick={() => dispatch(rejectExpense(exp.expenseId))}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: '#525C7A', fontSize: '11px' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
