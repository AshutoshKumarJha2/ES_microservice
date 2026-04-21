import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchAllExpenses, openProcessPaymentModal } from '../../../store/slices/Finance/financeSlice'
import { StatusBadge } from '../../elements/finance/StatusBadge'
import { ProcessPaymentModal } from '../../elements/finance/ProcessPaymentModal'
import styles from '../../../css/finance/Finance.module.css'
import { TableRowsSkeleton } from '../../elements/skeletons/PageSkeleton'

const METHOD_LABELS: Record<string, string> = {
  CREDIT_CARD: 'Credit Card', DEBIT_CARD: 'Debit Card', BANK_TRANSFER: 'Bank Transfer',
  CASH: 'Cash', UPI: 'UPI', PAYPAL: 'PayPal',
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n)

export const Payments = () => {
  const dispatch = useAppDispatch()
  const { expenses, expensesLoading, expensesError, paymentsByExpenseId, transactionRefByExpenseId } =
    useAppSelector((s) => s.finance)

  useEffect(() => { dispatch(fetchAllExpenses()) }, [dispatch])

  const paymentRows = expenses.filter((e) => e.status === 'APPROVED' || e.status === 'PAID')

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Payments</h1>
          <p className={styles.pageSubtitle}>Process payments for approved expenses</p>
        </div>
      </div>

      <div className={`${styles.card} ${styles.cardNoPad}`}>
        {expensesLoading ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Expense</th><th>Amount</th><th>Method</th><th>Transaction ID</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody><TableRowsSkeleton rows={4} cols={6} /></tbody>
          </table>
        ) : expensesError ? (
          <div className={styles.loadingState}>{expensesError}</div>
        ) : paymentRows.length === 0 ? (
          <div className={styles.emptyState}>No payments to display.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Expense</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Transaction ID</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paymentRows.map((exp) => {
                const payment = paymentsByExpenseId[exp.expenseId]
                const txnRef = transactionRefByExpenseId[exp.expenseId]
                const isPaid = exp.status === 'PAID'

                return (
                  <tr key={exp.expenseId}>
                    <td>{exp.description}</td>
                    <td>{formatCurrency(exp.amount)}</td>
                    <td>{isPaid && payment ? (METHOD_LABELS[payment.method] || payment.method) : '—'}</td>
                    <td>{isPaid && txnRef ? txnRef : isPaid && payment ? payment.paymentId.slice(0, 12) : '—'}</td>
                    <td><StatusBadge status={isPaid ? 'COMPLETED' : 'PENDING'} /></td>
                    <td>
                      {isPaid ? (
                        <button className={`${styles.btn} ${styles.btnSm}`}>Receipt</button>
                      ) : (
                        <button
                          className={`${styles.btn} ${styles.btnSm} ${styles.btnPrimary}`}
                          onClick={() => dispatch(openProcessPaymentModal({
                            expenseId: exp.expenseId,
                            expenseDescription: exp.description,
                            expenseAmount: exp.amount,
                          }))}
                        >
                          Pay Now
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <ProcessPaymentModal />
    </>
  )
}
