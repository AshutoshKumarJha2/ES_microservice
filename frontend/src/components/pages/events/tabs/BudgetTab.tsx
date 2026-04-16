import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../../store/hooks'
import { setBudget, createExpense, fetchBudget } from '../../../../store/slices/budgetSlice'
import { PanelHeader } from '../../../elements/events/PanelHeader'
import { EventStatusBadge } from '../../../elements/events/EventStatusBadge'
import type { BudgetRequestDto, ExpenseRequestDto } from '../../../../types/events'
import styles from '../../../../css/events/EventsPanel.module.css'

interface Props {
  eventId: string
}

export const BudgetTab = ({ eventId }: Props) => {
  const dispatch = useAppDispatch()
  const { budget, expenses, loading } = useAppSelector((s) => s.budget)

  const [budgetInput, setBudgetInput] = useState('')
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [expenseForm, setExpenseForm] = useState<ExpenseRequestDto>({ description: '', amount: 0, date: '' })

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

  return (
    <>
      <div className={styles['budget-stats']}>
        <div className={styles['budget-card']}>
          <div className={styles['budget-label']}>Planned Budget</div>
          <div className={styles['budget-value']}>₹{budget ? budget.plannedAmount.toLocaleString() : '—'}</div>
        </div>
        <div className={`${styles['budget-card']} ${styles.orange}`}>
          <div className={styles['budget-label']}>Actual Spend</div>
          <div className={styles['budget-value']}>₹{budget ? budget.actualAmount.toLocaleString() : '—'}</div>
        </div>
        <div className={`${styles['budget-card']} ${budget && budget.variance < 0 ? styles.red : styles.green}`}>
          <div className={styles['budget-label']}>Variance</div>
          <div className={styles['budget-value']}>
            {budget ? (budget.variance >= 0 ? '+' : '') + '₹' + budget.variance.toLocaleString() : '—'}
          </div>
        </div>
      </div>

      {!budget && (
        <div className={styles.card}>
          <form onSubmit={handleSetBudget} className={styles['budget-form']}>
            <input
              type="number"
              min={0}
              placeholder="Set planned budget (₹)"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              className={styles['form-input']}
              required
            />
            <button type="submit" className={styles['btn-primary']}>Set Budget</button>
          </form>
        </div>
      )}

      <div className={styles.card}>
        <PanelHeader title="Expenses">
          <button className={styles['btn-primary']} onClick={() => setShowExpenseForm((v) => !v)}>
            {showExpenseForm ? 'Cancel' : '+ Add Expense'}
          </button>
        </PanelHeader>

        {showExpenseForm && (
          <form onSubmit={handleCreateExpense} className={styles['expense-form']}>
            {[
              { label: 'Description', key: 'description', type: 'text',   placeholder: 'Expense description' },
              { label: 'Amount (₹)',  key: 'amount',      type: 'number', placeholder: '' },
              { label: 'Date',        key: 'date',        type: 'date',   placeholder: '' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key} className={styles.field}>
                <label>{label}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={expenseForm[key as keyof ExpenseRequestDto] as string | number}
                  onChange={(e) =>
                    setExpenseForm((p) => ({ ...p, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))
                  }
                  required
                />
              </div>
            ))}
            <button type="submit" className={styles['btn-primary']} style={{ alignSelf: 'flex-end' }}>
              Save
            </button>
          </form>
        )}

        {loading ? (
          <p className={styles.loading}>Loading expenses…</p>
        ) : expenses.length === 0 ? (
          <p className={styles.empty}>No expenses recorded yet.</p>
        ) : (
          <div className={styles['table-wrapper']}>
            <table>
              <thead>
                <tr><th>Description</th><th>Amount</th><th>Date</th><th>Status</th></tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp.expenseId}>
                    <td>{exp.description}</td>
                    <td>₹{exp.amount.toLocaleString()}</td>
                    <td>{exp.date}</td>
                    <td><EventStatusBadge status={exp.status ?? 'SUBMITTED'} variant="expense" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
