import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../../store/hooks'
import { setBudget, createExpense, fetchBudget } from '../../../../store/slices/budgetSlice'
import { EventStatusBadge } from '../../../elements/events/EventStatusBadge'
import type { BudgetRequestDto, ExpenseRequestDto } from '../../../../types/events'
import {
  Card, Row, Col, Table, Button, Form, Spinner, Alert,
} from 'react-bootstrap'

interface Props { eventId: string }

export const BudgetTab = ({ eventId }: Props) => {
  const dispatch = useAppDispatch()
  const { budget, expenses, loading } = useAppSelector((s) => s.budget)

  const [budgetInput, setBudgetInput]       = useState('')
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [expenseForm, setExpenseForm]        = useState<ExpenseRequestDto>({ description: '', amount: 0, date: '' })

  const handleSetBudget = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload: BudgetRequestDto = { plannedAmount: Number(budgetInput) }
    await dispatch(setBudget({ eventId, payload })).unwrap()
    setBudgetInput('')
  }

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    await dispatch(createExpense({ eventId, payload: expenseForm })).unwrap()
    setExpenseForm({ description: '', amount: 0, date: '' })
    setShowExpenseForm(false)
    dispatch(fetchBudget(eventId))
  }

  const varianceClass = budget
    ? (budget.variance < 0 ? 'es-stat-card-red' : 'es-stat-card-green')
    : ''

  return (
    <>
      {/* Budget stat cards */}
      <Row className="g-3 mb-3">
        <Col xs={12} sm={4}>
          <Card className="es-card border shadow-sm es-stat-card-blue">
            <Card.Body className="p-3">
              <div className="small fw-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Planned Budget</div>
              <div className="fw-bold" style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>
                ₹{budget ? budget.plannedAmount.toLocaleString() : '—'}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={4}>
          <Card className="es-card border shadow-sm es-stat-card-orange">
            <Card.Body className="p-3">
              <div className="small fw-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Actual Spend</div>
              <div className="fw-bold" style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>
                ₹{budget ? budget.actualAmount.toLocaleString() : '—'}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={4}>
          <Card className={`es-card border shadow-sm ${varianceClass}`}>
            <Card.Body className="p-3">
              <div className="small fw-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Variance</div>
              <div className="fw-bold" style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>
                {budget ? (budget.variance >= 0 ? '+' : '') + '₹' + budget.variance.toLocaleString() : '—'}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Set budget form */}
      {!budget && (
        <Card className="es-card border shadow-sm mb-3">
          <Card.Body className="p-3 p-md-4">
            <Form onSubmit={handleSetBudget} className="d-flex gap-2 align-items-end">
              <Form.Group className="flex-grow-1">
                <Form.Label className="es-label">Set Planned Budget (₹)</Form.Label>
                <Form.Control
                  type="number" min={0} placeholder="Enter amount"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  className="es-form-control rounded-3"
                  required
                />
              </Form.Group>
              <Button type="submit" variant="primary" size="sm" className="rounded-3 fw-semibold mb-0" style={{ height: 38 }}>
                Set Budget
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* Expenses */}
      <Card className="es-card border shadow-sm">
        <Card.Body className="p-3 p-md-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Card.Title className="mb-0 fw-semibold" style={{ color: 'var(--text-primary)' }}>Expenses</Card.Title>
            <Button
              variant={showExpenseForm ? 'outline-secondary' : 'primary'}
              size="sm"
              className="rounded-3"
              onClick={() => setShowExpenseForm((v) => !v)}
            >
              {showExpenseForm ? 'Cancel' : '+ Add Expense'}
            </Button>
          </div>

          {showExpenseForm && (
            <Card className="border mb-3" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-subtle)' }}>
              <Card.Body className="p-3">
                <Form onSubmit={handleCreateExpense}>
                  <Row className="g-3">
                    <Col xs={12} sm={4}>
                      <Form.Group>
                        <Form.Label className="es-label">Description</Form.Label>
                        <Form.Control
                          type="text" placeholder="Expense description"
                          value={expenseForm.description}
                          onChange={(e) => setExpenseForm((p) => ({ ...p, description: e.target.value }))}
                          className="es-form-control rounded-3" required
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={4}>
                      <Form.Group>
                        <Form.Label className="es-label">Amount (₹)</Form.Label>
                        <Form.Control
                          type="number" min={0}
                          value={expenseForm.amount}
                          onChange={(e) => setExpenseForm((p) => ({ ...p, amount: Number(e.target.value) }))}
                          className="es-form-control rounded-3" required
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={4}>
                      <Form.Group>
                        <Form.Label className="es-label">Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={expenseForm.date}
                          onChange={(e) => setExpenseForm((p) => ({ ...p, date: e.target.value }))}
                          className="es-form-control rounded-3" required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="text-end mt-3">
                    <Button type="submit" variant="primary" size="sm" className="rounded-3 fw-semibold">Save Expense</Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          )}

          {loading ? (
            <div className="text-center py-4"><Spinner animation="border" style={{ color: 'var(--blue)' }} /></div>
          ) : expenses.length === 0 ? (
            <p className="text-center py-3" style={{ color: 'var(--text-muted)' }}>No expenses recorded yet.</p>
          ) : (
            <Table hover responsive className="mb-0" style={{ fontSize: '0.88rem' }}>
              <thead style={{ background: 'var(--bg-subtle)' }}>
                <tr>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Description</th>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Amount</th>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Date</th>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp.expenseId}>
                    <td className="align-middle" style={{ color: 'var(--text-primary)' }}>{exp.description}</td>
                    <td className="align-middle" style={{ color: 'var(--text-secondary)' }}>₹{exp.amount.toLocaleString()}</td>
                    <td className="align-middle" style={{ color: 'var(--text-secondary)' }}>{exp.date}</td>
                    <td className="align-middle">
                      <EventStatusBadge status={exp.status ?? 'SUBMITTED'} variant="expense" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </>
  )
}
