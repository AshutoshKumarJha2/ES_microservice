import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
  fetchAllExpenses,
  fetchBudgets,
  approveExpense,
  rejectExpense,
  openProcessPaymentModal,
} from '../../../store/slices/Finance/financeSlice'
import type { FinanceExpenseDto } from '../../../types/finance'
import { StatusBadge } from '../../elements/finance/StatusBadge'
import { ProcessPaymentModal } from '../../elements/finance/ProcessPaymentModal'
import styles from '../../../css/admin/AdminPanel.module.css'

export const FinanceDashboard: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { expenses, expensesLoading, budgets } = useAppSelector((state) => state.finance)

  useEffect(() => {
    if (expenses.length === 0) dispatch(fetchAllExpenses())
    if (budgets.length === 0) dispatch(fetchBudgets())
  }, [dispatch]) // eslint-disable-line react-hooks/exhaustive-deps

  const pendingCount  = expenses.filter((e) => e.status === 'SUBMITTED').length
  const approvedCount = expenses.filter((e) => e.status === 'APPROVED').length
  const paidCount     = expenses.filter((e) => e.status === 'PAID').length
  const rejectedCount = expenses.filter((e) => e.status === 'REJECTED').length

  const recentPending  = expenses.filter((e) => e.status === 'SUBMITTED').slice(0, 5)
  const recentApproved = expenses.filter((e) => e.status === 'APPROVED').slice(0, 3)

  const totalPlanned = budgets.reduce((sum, b) => sum + (b.plannedAmount ?? 0), 0)
  const totalActual  = budgets.reduce((sum, b) => sum + (b.actualAmount ?? 0), 0)
  const utilizationPct = totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0

  const handlePay = (e: FinanceExpenseDto) => {
    dispatch(openProcessPaymentModal({
      expenseId: e.expenseId,
      expenseDescription: e.description,
      expenseAmount: e.amount,
    }))
  }

  return (
    <div className={styles.page}>
      {/* Banner */}
      <div className={styles.banner}>
        <div className={styles['banner-inner']}>
          <div className={styles['banner-text']}>
            <h1>Finance Officer Dashboard</h1>
            <p>Oversee expense approvals, payments &amp; event budgets</p>
          </div>
          <div className={styles['banner-actions']}>
            <button className={styles['btn-secondary']} onClick={() => navigate('/finance/budget')}>View Budgets</button>
            <button className={styles['btn-primary']} onClick={() => navigate('/finance/expenses')}>Review Approvals</button>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {/* Stats */}
        <div className={styles['stats-grid']}>
          <div className={`${styles['stat-card']} ${styles.blue}`}>
            <div className={styles['stat-label']}>Pending Approvals</div>
            <div className={styles['stat-value']}>{pendingCount}</div>
          </div>
          <div className={`${styles['stat-card']} ${styles.green}`}>
            <div className={styles['stat-label']}>Approved</div>
            <div className={styles['stat-value']}>{approvedCount}</div>
          </div>
          <div className={`${styles['stat-card']} ${styles.orange}`}>
            <div className={styles['stat-label']}>Paid</div>
            <div className={styles['stat-value']}>{paidCount}</div>
          </div>
          <div className={`${styles['stat-card']} ${styles.red}`}>
            <div className={styles['stat-label']}>Rejected</div>
            <div className={styles['stat-value']}>{rejectedCount}</div>
          </div>
        </div>

        {/* Two columns */}
        <div className={styles['two-col']}>
          {/* Pending expenses */}
          <div className={styles.card}>
            <div className={styles['card-title']}>
              Pending Approvals
              <button className={styles['btn-sm']} onClick={() => navigate('/finance/expenses')}>View All →</button>
            </div>
            {expensesLoading ? (
              <p className={styles.loading}>Loading…</p>
            ) : (
              <div className={styles['table-wrapper']}>
                <table>
                  <thead>
                    <tr><th>Description</th><th>Amount</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {recentPending.length === 0 ? (
                      <tr><td colSpan={4} className={styles.empty}>No pending expenses</td></tr>
                    ) : recentPending.map((e: FinanceExpenseDto) => (
                      <tr key={e.expenseId}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{e.description}</td>
                        <td>{e.amount.toLocaleString()}</td>
                        <td><StatusBadge status={e.status} /></td>
                        <td>
                          <div className={styles.actions}>
                            <button className={styles['btn-success']} onClick={() => dispatch(approveExpense(e.expenseId))}>Approve</button>
                            <button className={styles['btn-danger']} onClick={() => dispatch(rejectExpense(e.expenseId))}>Reject</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Awaiting payment */}
          <div className={styles.card}>
            <div className={styles['card-title']}>
              Awaiting Payment
              <button className={styles['btn-sm']} onClick={() => navigate('/finance/payments')}>View All →</button>
            </div>
            {expensesLoading ? (
              <p className={styles.loading}>Loading…</p>
            ) : (
              <div className={styles['table-wrapper']}>
                <table>
                  <thead>
                    <tr><th>Description</th><th>Amount</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {recentApproved.length === 0 ? (
                      <tr><td colSpan={3} className={styles.empty}>No approved expenses awaiting payment</td></tr>
                    ) : recentApproved.map((e: FinanceExpenseDto) => (
                      <tr key={e.expenseId}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{e.description}</td>
                        <td>{e.amount.toLocaleString()}</td>
                        <td>
                          <div className={styles.actions}>
                            <button className={styles['btn-sm']} onClick={() => handlePay(e)}>Pay Now</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Budget summary + activity */}
        <div className={styles['two-col']}>
          {/* Budget summary */}
          <div className={styles.card}>
            <div className={styles['card-title']}>
              Budget Summary
              <button className={styles['btn-sm']} onClick={() => navigate('/finance/budget')}>View All →</button>
            </div>
            <div className={styles['table-wrapper']}>
              <table>
                <thead>
                  <tr><th>Metric</th><th>Value</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Events Tracked</td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{budgets.length}</td>
                  </tr>
                  <tr>
                    <td>Total Planned</td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{totalPlanned.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td>Total Actual Spend</td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{totalActual.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td>Overall Utilization</td>
                    <td>
                      <span className={`${styles.badge} ${utilizationPct >= 90 ? styles['badge-suspended'] : utilizationPct >= 70 ? styles['badge-vendor'] : styles['badge-active']}`}>
                        {utilizationPct}%
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Finance activity */}
          <div className={styles.card}>
            <div className={styles['card-title']}>
              Finance Activity
              <button className={styles['btn-sm']} onClick={() => navigate('/finance/expenses')}>Go to Approvals →</button>
            </div>
            <ul className={styles.timeline}>
              <li className={styles['timeline-item']}>
                <div className={`${styles['timeline-dot']} ${styles['dot-green']}`} />
                <div>
                  <div className={styles['timeline-text']}><strong>{pendingCount}</strong> expenses awaiting your approval</div>
                  <div className={styles['timeline-time']}>Use <strong>Expense Approvals</strong> to review</div>
                </div>
              </li>
              <li className={styles['timeline-item']}>
                <div className={`${styles['timeline-dot']} ${styles['dot-blue']}`} />
                <div>
                  <div className={styles['timeline-text']}><strong>{approvedCount}</strong> approved expenses ready for payment</div>
                  <div className={styles['timeline-time']}>Process via <strong>Payments</strong></div>
                </div>
              </li>
              <li className={styles['timeline-item']}>
                <div className={`${styles['timeline-dot']} ${styles['dot-orange']}`} />
                <div>
                  <div className={styles['timeline-text']}><strong>{budgets.length}</strong> event budgets tracked</div>
                  <div className={styles['timeline-time']}>View in <strong>Budget Overview</strong></div>
                </div>
              </li>
              <li className={styles['timeline-item']}>
                <div className={`${styles['timeline-dot']} ${styles['dot-red']}`} />
                <div>
                  <div className={styles['timeline-text']}><strong>{rejectedCount}</strong> rejected expenses on record</div>
                  <div className={styles['timeline-time']}>Archive kept for audit</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Reuse existing payment modal so "Pay Now" works from dashboard */}
      <ProcessPaymentModal />
    </div>
  )
}