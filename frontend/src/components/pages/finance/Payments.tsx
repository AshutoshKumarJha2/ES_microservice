import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchAllExpenses, openProcessPaymentModal } from '../../../store/slices/Finance/financeSlice'
import { StatusBadge } from '../../elements/finance/StatusBadge'
import { ProcessPaymentModal } from '../../elements/finance/ProcessPaymentModal'
import { TableRowsSkeleton } from '../../elements/skeletons/PageSkeleton'
import { PageBanner } from '../../elements/common/PageBanner'
import { FinanceSubNav } from '../../elements/finance/FinanceSubNav'
import { Container, Card, Table, Button } from 'react-bootstrap'

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
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <PageBanner title="Payments" subtitle="Process payments for approved expenses" />
      <FinanceSubNav />
    <Container fluid className="px-3 px-md-4 py-4">

      <Card className="es-card border shadow-sm">
        <Card.Body className="p-0">
          {expensesLoading ? (
            <Table hover responsive className="mb-0" style={{ fontSize: '0.88rem' }}>
              <thead style={{ background: 'var(--bg-subtle)' }}>
                <tr>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Expense</th>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Amount</th>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Method</th>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Transaction ID</th>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Status</th>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody><TableRowsSkeleton rows={4} cols={6} colWidths={['24%','14%','14%','20%','14%','14%']} /></tbody>
            </Table>
          ) : expensesError ? (
            <div className="text-center py-5 small" style={{ color: 'var(--text-muted)' }}>{expensesError}</div>
          ) : paymentRows.length === 0 ? (
            <div className="text-center py-5 small" style={{ color: 'var(--text-muted)' }}>No payments to display.</div>
          ) : (
            <Table hover responsive className="mb-0" style={{ fontSize: '0.88rem', tableLayout: 'fixed' }}>
              <thead style={{ background: 'var(--bg-subtle)' }}>
                <tr>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)', width: '24%' }}>Expense</th>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)', width: '14%' }}>Amount</th>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)', width: '14%' }}>Method</th>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)', width: '20%' }}>Transaction ID</th>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)', width: '14%' }}>Status</th>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)', width: '14%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paymentRows.map((exp) => {
                  const payment = paymentsByExpenseId[exp.expenseId]
                  const txnRef  = transactionRefByExpenseId[exp.expenseId]
                  const isPaid  = exp.status === 'PAID'

                  return (
                    <tr key={exp.expenseId}>
                      <td className="align-middle" style={{ color: 'var(--text-body)' }}>{exp.description}</td>
                      <td className="align-middle" style={{ color: 'var(--text-body)' }}>{formatCurrency(exp.amount)}</td>
                      <td className="align-middle" style={{ color: 'var(--text-secondary)' }}>
                        {isPaid && payment ? (METHOD_LABELS[payment.method] || payment.method) : '—'}
                      </td>
                      <td className="align-middle" style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {isPaid && txnRef ? txnRef : isPaid && payment ? payment.paymentId.slice(0, 12) : '—'}
                      </td>
                      <td className="align-middle">
                        <StatusBadge status={isPaid ? 'COMPLETED' : 'PENDING'} />
                      </td>
                      <td className="align-middle">
                        {isPaid ? (
                          <Button variant="outline-secondary" size="sm" className="rounded-3" style={{ fontSize: '0.78rem' }} disabled>
                            Receipt
                          </Button>
                        ) : (
                          <Button
                            variant="primary" size="sm" className="rounded-3"
                            style={{ fontSize: '0.78rem' }}
                            onClick={() => dispatch(openProcessPaymentModal({
                              expenseId: exp.expenseId,
                              expenseDescription: exp.description,
                              expenseAmount: exp.amount,
                            }))}
                          >
                            Pay Now
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <ProcessPaymentModal />
    </Container>
    </div>
  )
}
