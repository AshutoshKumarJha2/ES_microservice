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
import { TableRowsSkeleton } from '../../elements/skeletons/PageSkeleton'
import { PageBanner } from '../../elements/common/PageBanner'
import { FinanceSubNav } from '../../elements/finance/FinanceSubNav'
import { Container, Card, Table, Button, ButtonGroup } from 'react-bootstrap'

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
    APPROVED:  expenses.filter((e) => e.status === 'APPROVED').length,
    REJECTED:  expenses.filter((e) => e.status === 'REJECTED').length,
    PAID:      expenses.filter((e) => e.status === 'PAID').length,
  }

  const filtered = expenses.filter((e) => e.status === activeStatusFilter)

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <PageBanner title="Expense Approvals" subtitle="Review and action submitted expenses" />
      <FinanceSubNav />
    <Container fluid className="px-3 px-md-4 py-4">

      {actionError && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center mb-3 py-2" style={{ fontSize: '0.88rem' }}>
          <span>{actionError}</span>
          <Button variant="link" size="sm" className="p-0 text-danger text-decoration-none fw-bold" onClick={() => dispatch(clearActionError())}>✕</Button>
        </div>
      )}

      {/* Filter chips */}
      <ButtonGroup className="flex-wrap gap-1 mb-3">
        {FILTERS.map((status) => (
          <Button
            key={status}
            size="sm"
            variant={activeStatusFilter === status ? 'primary' : 'outline-secondary'}
            className="rounded-pill"
            style={{ fontSize: '0.78rem' }}
            onClick={() => dispatch(setActiveStatusFilter(status))}
          >
            {FILTER_LABELS[status]} ({counts[status]})
          </Button>
        ))}
      </ButtonGroup>

      <Card className="es-card border shadow-sm">
        <Card.Body className="p-0">
          {expensesLoading ? (
            <Table hover responsive className="mb-0" style={{ fontSize: '0.88rem' }}>
              <thead style={{ background: 'var(--bg-subtle)' }}>
                <tr>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Event</th>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Description</th>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Amount</th>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Date</th>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Status</th>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody><TableRowsSkeleton rows={5} cols={6} colWidths={['12%','28%','14%','12%','14%','20%']} /></tbody>
            </Table>
          ) : expensesError ? (
            <div className="text-center py-5 small" style={{ color: 'var(--text-muted)' }}>{expensesError}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-5 small" style={{ color: 'var(--text-muted)' }}>
              No {FILTER_LABELS[activeStatusFilter].toLowerCase()} expenses found.
            </div>
          ) : (
            <Table hover responsive className="mb-0" style={{ fontSize: '0.88rem', tableLayout: 'fixed' }}>
              <thead style={{ background: 'var(--bg-subtle)' }}>
                <tr>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)', width: '12%' }}>Event</th>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)', width: '28%' }}>Description</th>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)', width: '14%' }}>Amount</th>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)', width: '12%' }}>Date</th>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)', width: '14%' }}>Status</th>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)', width: '20%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((exp) => (
                  <tr key={exp.expenseId}>
                    <td className="align-middle" style={{ color: 'var(--text-secondary)' }}>{exp.eventId.slice(0, 8)}…</td>
                    <td className="align-middle" style={{ color: 'var(--text-body)' }}>{exp.description}</td>
                    <td className="align-middle" style={{ color: 'var(--text-body)' }}>{formatCurrency(exp.amount)}</td>
                    <td className="align-middle" style={{ color: 'var(--text-secondary)' }}>{formatDate(exp.date)}</td>
                    <td className="align-middle"><StatusBadge status={exp.status} /></td>
                    <td className="align-middle">
                      {exp.status === 'SUBMITTED' ? (
                        <div className="d-flex gap-1">
                          <Button
                            variant="outline-primary" size="sm" className="rounded-3"
                            style={{ fontSize: '0.78rem' }}
                            onClick={() => dispatch(approveExpense(exp.expenseId))}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outline-danger" size="sm" className="rounded-3"
                            style={{ fontSize: '0.78rem' }}
                            onClick={() => dispatch(rejectExpense(exp.expenseId))}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
    </div>
  )
}
