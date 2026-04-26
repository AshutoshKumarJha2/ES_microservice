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
import { PageBanner } from '../../elements/common/PageBanner'
import { FinanceSubNav } from '../../elements/finance/FinanceSubNav'
import { StatCard } from '../../elements/common/StatCard'
import { TableRowsSkeleton } from '../../elements/skeletons/PageSkeleton'
import {
  Container, Row, Col, Card, Table, Button, Badge,
} from 'react-bootstrap'
import {
  HourglassSplit, CheckCircleFill, CashCoin, XCircleFill,
} from 'react-bootstrap-icons'

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n)

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

  const totalPlanned   = budgets.reduce((sum, b) => sum + (b.plannedAmount ?? 0), 0)
  const totalActual    = budgets.reduce((sum, b) => sum + (b.actualAmount ?? 0), 0)
  const utilizationPct = totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0

  const utilizationBadgeClass = utilizationPct >= 90
    ? 'es-badge-cancelled'
    : utilizationPct >= 70
    ? 'es-badge-pending'
    : 'es-badge-approved'

  const handlePay = (e: FinanceExpenseDto) => {
    dispatch(openProcessPaymentModal({
      expenseId: e.expenseId,
      expenseDescription: e.description,
      expenseAmount: e.amount,
    }))
  }

  const STATS = [
    { label: 'Pending Approvals', value: pendingCount,  accent: 'es-stat-card-blue',   icon: <HourglassSplit size={18} />, iconBg: 'var(--blue-subtle)',    iconColor: 'var(--blue)'   },
    { label: 'Approved',          value: approvedCount, accent: 'es-stat-card-green',  icon: <CheckCircleFill size={18} />,iconBg: 'var(--green-subtle)',   iconColor: 'var(--green)'  },
    { label: 'Paid',              value: paidCount,     accent: 'es-stat-card-orange', icon: <CashCoin size={18} />,       iconBg: 'var(--saffron-subtle)', iconColor: 'var(--saffron)'},
    { label: 'Rejected',          value: rejectedCount, accent: 'es-stat-card-red',    icon: <XCircleFill size={18} />,    iconBg: 'var(--red-subtle)',     iconColor: 'var(--red)'    },
  ]

  const ACTIVITY = [
    { color: 'var(--blue)',    label: <><strong>{pendingCount}</strong> expenses awaiting your approval</>,    sub: <>Use <strong>Expense Approvals</strong> to review</> },
    { color: 'var(--green)',   label: <><strong>{approvedCount}</strong> approved expenses ready for payment</>, sub: <>Process via <strong>Payments</strong></> },
    { color: 'var(--saffron)', label: <><strong>{budgets.length}</strong> event budgets tracked</>,             sub: <>View in <strong>Budget Overview</strong></> },
    { color: 'var(--red)',     label: <><strong>{rejectedCount}</strong> rejected expenses on record</>,        sub: <>Archive kept for audit</> },
  ]

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <PageBanner
        title="Finance Officer Dashboard"
        subtitle="Oversee expense approvals, payments &amp; event budgets"
        actions={<>
          <Button variant="outline-light" size="sm" className="rounded-3" onClick={() => navigate('/finance/budget')}>
            View Budgets
          </Button>
          <Button variant="light" size="sm" className="rounded-3 fw-semibold" onClick={() => navigate('/finance/expenses')}>
            Review Approvals
          </Button>
        </>}
      />

      <FinanceSubNav />

      <Container fluid className="px-3 px-md-4 py-4">
        {/* Stats */}
        <Row className="g-3 mb-4">
          {STATS.map((s) => (
            <Col key={s.label} xs={6} lg={3}>
              <StatCard {...s} loading={expensesLoading} />
            </Col>
          ))}
        </Row>

        {/* Pending + Awaiting Payment */}
        <Row className="g-3 mb-3">
          <Col xs={12} lg={6}>
            <Card className="es-card border shadow-sm h-100">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Card.Title className="mb-0 fw-semibold fs-6" style={{ color: 'var(--text-primary)' }}>
                    Pending Approvals
                  </Card.Title>
                  <Button variant="link" size="sm" className="p-0 text-decoration-none" style={{ color: 'var(--blue)', fontSize: '0.82rem' }} onClick={() => navigate('/finance/expenses')}>
                    View All →
                  </Button>
                </div>
                <Table hover responsive className="mb-0" style={{ fontSize: '0.88rem', tableLayout: 'fixed' }}>
                  <thead style={{ background: 'var(--bg-subtle)' }}>
                    <tr>
                      <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)', width: '40%' }}>Description</th>
                      <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)', width: '25%' }}>Amount</th>
                      <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)', width: '20%' }}>Status</th>
                      <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)', width: '15%' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expensesLoading
                      ? <TableRowsSkeleton rows={4} cols={4} colWidths={['40%', '25%', '20%', '15%']} />
                      : recentPending.length === 0
                      ? <tr><td colSpan={4} className="text-center py-3" style={{ color: 'var(--text-muted)' }}>No pending expenses</td></tr>
                      : recentPending.map((e: FinanceExpenseDto) => (
                        <tr key={e.expenseId}>
                          <td className="align-middle fw-medium" style={{ color: 'var(--text-primary)' }}>{e.description}</td>
                          <td className="align-middle" style={{ color: 'var(--text-body)' }}>{formatCurrency(e.amount)}</td>
                          <td className="align-middle"><StatusBadge status={e.status} /></td>
                          <td className="align-middle">
                            <div className="d-flex gap-1">
                              <Button variant="outline-success" size="sm" className="rounded-3" style={{ fontSize: '0.75rem' }} onClick={() => dispatch(approveExpense(e.expenseId))}>✓</Button>
                              <Button variant="outline-danger"  size="sm" className="rounded-3" style={{ fontSize: '0.75rem' }} onClick={() => dispatch(rejectExpense(e.expenseId))}>✕</Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} lg={6}>
            <Card className="es-card border shadow-sm h-100">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Card.Title className="mb-0 fw-semibold fs-6" style={{ color: 'var(--text-primary)' }}>
                    Awaiting Payment
                  </Card.Title>
                  <Button variant="link" size="sm" className="p-0 text-decoration-none" style={{ color: 'var(--blue)', fontSize: '0.82rem' }} onClick={() => navigate('/finance/payments')}>
                    View All →
                  </Button>
                </div>
                <Table hover responsive className="mb-0" style={{ fontSize: '0.88rem', tableLayout: 'fixed' }}>
                  <thead style={{ background: 'var(--bg-subtle)' }}>
                    <tr>
                      <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)', width: '55%' }}>Description</th>
                      <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)', width: '25%' }}>Amount</th>
                      <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)', width: '20%' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expensesLoading
                      ? <TableRowsSkeleton rows={3} cols={3} colWidths={['55%', '25%', '20%']} />
                      : recentApproved.length === 0
                      ? <tr><td colSpan={3} className="text-center py-3" style={{ color: 'var(--text-muted)' }}>No approved expenses awaiting payment</td></tr>
                      : recentApproved.map((e: FinanceExpenseDto) => (
                        <tr key={e.expenseId}>
                          <td className="align-middle fw-medium" style={{ color: 'var(--text-primary)' }}>{e.description}</td>
                          <td className="align-middle" style={{ color: 'var(--text-body)' }}>{formatCurrency(e.amount)}</td>
                          <td className="align-middle">
                            <Button variant="primary" size="sm" className="rounded-3" style={{ fontSize: '0.78rem' }} onClick={() => handlePay(e)}>
                              Pay Now
                            </Button>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Budget Summary + Activity */}
        <Row className="g-3">
          <Col xs={12} lg={6}>
            <Card className="es-card border shadow-sm h-100">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Card.Title className="mb-0 fw-semibold fs-6" style={{ color: 'var(--text-primary)' }}>
                    Budget Summary
                  </Card.Title>
                  <Button variant="link" size="sm" className="p-0 text-decoration-none" style={{ color: 'var(--blue)', fontSize: '0.82rem' }} onClick={() => navigate('/finance/budget')}>
                    View All →
                  </Button>
                </div>
                <Table hover responsive className="mb-0" style={{ fontSize: '0.88rem' }}>
                  <thead style={{ background: 'var(--bg-subtle)' }}>
                    <tr>
                      <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Metric</th>
                      <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ color: 'var(--text-secondary)' }}>Events Tracked</td>
                      <td className="fw-bold" style={{ color: 'var(--text-primary)' }}>{budgets.length}</td>
                    </tr>
                    <tr>
                      <td style={{ color: 'var(--text-secondary)' }}>Total Planned</td>
                      <td className="fw-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(totalPlanned)}</td>
                    </tr>
                    <tr>
                      <td style={{ color: 'var(--text-secondary)' }}>Total Actual Spend</td>
                      <td className="fw-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(totalActual)}</td>
                    </tr>
                    <tr>
                      <td style={{ color: 'var(--text-secondary)' }}>Overall Utilization</td>
                      <td>
                        <Badge className={`${utilizationBadgeClass} border-0`} style={{ fontSize: '0.7rem', fontWeight: 700 }}>
                          {utilizationPct}%
                        </Badge>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} lg={6}>
            <Card className="es-card border shadow-sm h-100">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Card.Title className="mb-0 fw-semibold fs-6" style={{ color: 'var(--text-primary)' }}>
                    Finance Activity
                  </Card.Title>
                  <Button variant="link" size="sm" className="p-0 text-decoration-none" style={{ color: 'var(--blue)', fontSize: '0.82rem' }} onClick={() => navigate('/finance/expenses')}>
                    Go to Approvals →
                  </Button>
                </div>
                <div className="d-flex flex-column gap-3">
                  {ACTIVITY.map((item, i) => (
                    <div key={i} className="d-flex align-items-start gap-3">
                      <div style={{
                        width: 10, height: 10, borderRadius: '50%',
                        background: item.color, flexShrink: 0, marginTop: 4,
                      }} />
                      <div>
                        <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{item.label}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>{item.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <ProcessPaymentModal />
    </div>
  )
}
