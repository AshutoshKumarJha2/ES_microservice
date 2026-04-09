import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchEventById } from '../../../store/slices/eventsSlice'
import { fetchTicketsByEvent, createTicket, updateTicket, deleteTicket } from '../../../store/slices/ticketsSlice'
import { fetchRegistrationsByEvent, approveRegistration, rejectRegistration } from '../../../store/slices/registrationsSlice'
import { fetchBudget, fetchExpenses, setBudget, createExpense } from '../../../store/slices/budgetSlice'
import { eventService } from '../../../services/events/eventService'
import { TicketModal } from '../../elements/events/TicketModal'
import type { ScheduleResponseDto, CreateTicketRequest, TicketResponseDto, BudgetRequestDto, ExpenseRequestDto } from '../../../types/events'
import styles from '../../../css/events/EventDetail.module.css'

type Tab = 'overview' | 'tickets' | 'registrations' | 'budget'
type RegFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'

const statusBadgeClass = (status: string) => {
  const map: Record<string, string> = {
    draft: styles['badge-draft'],
    published: styles['badge-published'],
    completed: styles['badge-completed'],
    cancelled: styles['badge-cancelled'],
  }
  return `${styles.badge} ${map[status] ?? styles['badge-draft']}`
}

export const EventDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { selectedEvent } = useAppSelector((s) => s.events)
  const { tickets, loading: ticketsLoading } = useAppSelector((s) => s.tickets)
  const { registrations, loading: regLoading, actionLoading } = useAppSelector((s) => s.registrations)
  const { budget, expenses, loading: budgetLoading } = useAppSelector((s) => s.budget)

  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [schedules, setSchedules] = useState<ScheduleResponseDto[]>([])
  const [schedulesLoading, setSchedulesLoading] = useState(false)
  const [regFilter, setRegFilter] = useState<RegFilter>('ALL')

  const [ticketModalOpen, setTicketModalOpen] = useState(false)
  const [editingTicket, setEditingTicket] = useState<TicketResponseDto | null>(null)

  const [budgetInput, setBudgetInput] = useState('')
  const [expenseForm, setExpenseForm] = useState<ExpenseRequestDto>({ description: '', amount: 0, date: '' })
  const [showExpenseForm, setShowExpenseForm] = useState(false)

  useEffect(() => {
    if (!id) return
    dispatch(fetchEventById(id))
    dispatch(fetchTicketsByEvent({ eventId: id }))
    dispatch(fetchRegistrationsByEvent({ eventId: id }))
    dispatch(fetchBudget(id))
    dispatch(fetchExpenses({ eventId: id }))
  }, [id, dispatch])

  useEffect(() => {
    if (activeTab === 'overview' && id) {
      setSchedulesLoading(true)
      eventService.getSchedules(id)
        .then(setSchedules)
        .catch(console.error)
        .finally(() => setSchedulesLoading(false))
    }
  }, [activeTab, id])

  const filteredRegistrations =
    regFilter === 'ALL' ? registrations : registrations.filter((r) => r.status === regFilter)

  const handleTicketSave = async (payload: CreateTicketRequest) => {
    if (!id) return
    if (editingTicket) {
      await dispatch(updateTicket({ ticketId: editingTicket.ticketId, payload })).unwrap()
    } else {
      await dispatch(createTicket({ eventId: id, payload })).unwrap()
      dispatch(fetchTicketsByEvent({ eventId: id }))
    }
    setEditingTicket(null)
  }

  const handleSetBudget = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    const payload: BudgetRequestDto = { plannedAmount: Number(budgetInput) }
    await dispatch(setBudget({ eventId: id, payload })).unwrap()
    setBudgetInput('')
  }

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    await dispatch(createExpense({ eventId: id, payload: expenseForm })).unwrap()
    setExpenseForm({ description: '', amount: 0, date: '' })
    setShowExpenseForm(false)
    dispatch(fetchBudget(id))
  }

  if (!selectedEvent) {
    return <div className={styles.page}><p className={styles.loading}>Loading event…</p></div>
  }

  return (
    <div className={styles.page}>
      <button className={styles['back-btn']} onClick={() => navigate('/organizer/dashboard')}>
        ← Back to Dashboard
      </button>

      <div className={styles['event-header']}>
        <div>
          <h1 className={styles['event-title']}>{selectedEvent.eventName}</h1>
          <div className={styles['event-meta']}>
            <span>Start: {selectedEvent.startAt}</span>
            <span>End: {selectedEvent.endAt}</span>
            <span>Venue ID: {selectedEvent.venueId}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span className={statusBadgeClass(selectedEvent.status)}>{selectedEvent.status}</span>
          <button className={styles['btn-primary']} onClick={() => navigate(`/organizer/analytics/${id}`)}>
            Analytics
          </button>
        </div>
      </div>

      <div className={styles.tabs}>
        {(['overview', 'tickets', 'registrations', 'budget'] as Tab[]).map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Overview ─────────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className={styles.panel}>
          <div className={styles['quick-stats']}>
            <div className={styles['qs-card']}>
              <div className={styles['qs-label']}>Total Tickets</div>
              <div className={styles['qs-value']}>{tickets.length}</div>
            </div>
            <div className={styles['qs-card']}>
              <div className={styles['qs-label']}>Registrations</div>
              <div className={styles['qs-value']}>{registrations.length}</div>
            </div>
            <div className={styles['qs-card']}>
              <div className={styles['qs-label']}>Sessions</div>
              <div className={styles['qs-value']}>{schedules.length}</div>
            </div>
          </div>
          <div className={styles['panel-header']}>
            <h3 className={styles['panel-title']}>Schedule</h3>
          </div>
          {schedulesLoading ? (
            <p className={styles.loading}>Loading schedule…</p>
          ) : schedules.length === 0 ? (
            <p className={styles.empty}>No sessions added yet.</p>
          ) : (
            <div className={styles['table-wrapper']}>
              <table>
                <thead>
                  <tr><th>Date</th><th>Time Slot</th><th>Activity</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {schedules.map((s) => (
                    <tr key={s.scheduleId}>
                      <td>{s.date}</td>
                      <td>{s.timeSlot}</td>
                      <td>{s.activity}</td>
                      <td><span className={statusBadgeClass(s.status)}>{s.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Tickets ──────────────────────────────────────────────────────────── */}
      {activeTab === 'tickets' && (
        <div className={styles.panel}>
          <div className={styles['panel-header']}>
            <h3 className={styles['panel-title']}>Tickets</h3>
            <button className={styles['btn-primary']} onClick={() => { setEditingTicket(null); setTicketModalOpen(true) }}>
              + Add Ticket
            </button>
          </div>
          {ticketsLoading ? (
            <p className={styles.loading}>Loading tickets…</p>
          ) : tickets.length === 0 ? (
            <p className={styles.empty}>No tickets yet. Add one to get started.</p>
          ) : (
            <div className={styles['table-wrapper']}>
              <table>
                <thead>
                  <tr><th>Type</th><th>Price</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr key={t.ticketId}>
                      <td style={{ fontWeight: 600 }}>{t.type}</td>
                      <td>₹{t.price.toFixed(2)}</td>
                      <td>
                        <span
                          className={styles.badge}
                          style={t.status === 'ACTIVE'
                            ? { background: '#f0fdf4', color: '#16a34a' }
                            : { background: '#f1f5f9', color: '#64748b' }}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button className={styles['btn-edit']} onClick={() => { setEditingTicket(t); setTicketModalOpen(true) }}>Edit</button>
                          <button className={styles['btn-delete']} onClick={() => dispatch(deleteTicket(t.ticketId))}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Registrations ────────────────────────────────────────────────────── */}
      {activeTab === 'registrations' && (
        <div className={styles.panel}>
          <div className={styles['panel-header']}>
            <h3 className={styles['panel-title']}>Registrations</h3>
          </div>
          <div className={styles['filter-row']}>
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as RegFilter[]).map((f) => (
              <button
                key={f}
                className={`${styles.chip} ${regFilter === f ? styles.active : ''}`}
                onClick={() => setRegFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          {regLoading ? (
            <p className={styles.loading}>Loading registrations…</p>
          ) : filteredRegistrations.length === 0 ? (
            <p className={styles.empty}>No registrations found.</p>
          ) : (
            <div className={styles['table-wrapper']}>
              <table>
                <thead>
                  <tr><th>Registration ID</th><th>Attendee ID</th><th>Ticket ID</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filteredRegistrations.map((r) => (
                    <tr key={r.registrationId}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{r.registrationId}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{r.attendeeId}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{r.ticketId}</td>
                      <td>
                        <span
                          className={styles.badge}
                          style={
                            r.status === 'APPROVED' ? { background: '#f0fdf4', color: '#16a34a' }
                            : r.status === 'REJECTED' ? { background: '#fff1f2', color: '#be123c' }
                            : { background: '#fefce8', color: '#a16207' }
                          }
                        >
                          {r.status}
                        </span>
                      </td>
                      <td>
                        {r.status === 'PENDING' && (
                          <div className={styles.actions}>
                            <button
                              className={styles['btn-approve']}
                              disabled={actionLoading === r.registrationId}
                              onClick={() => dispatch(approveRegistration(r.registrationId))}
                            >
                              Approve
                            </button>
                            <button
                              className={styles['btn-reject']}
                              disabled={actionLoading === r.registrationId}
                              onClick={() => dispatch(rejectRegistration(r.registrationId))}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Budget ───────────────────────────────────────────────────────────── */}
      {activeTab === 'budget' && (
        <div className={styles.panel}>
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
            <form onSubmit={handleSetBudget} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <input
                type="number" min={0}
                placeholder="Set planned budget (₹)"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                style={{ fontFamily: 'Urbanist, sans-serif', fontSize: '0.95rem', color: '#1e293b', background: '#f8f9ff', border: '1.5px solid #e2e8f0', borderLeft: '3px solid #f97316', borderRadius: 8, padding: '0.55rem 0.9rem', outline: 'none', flex: 1 }}
                required
              />
              <button type="submit" className={styles['btn-primary']}>Set Budget</button>
            </form>
          )}

          <div className={styles['panel-header']}>
            <h3 className={styles['panel-title']}>Expenses</h3>
            <button className={styles['btn-primary']} onClick={() => setShowExpenseForm((v) => !v)}>
              {showExpenseForm ? 'Cancel' : '+ Add Expense'}
            </button>
          </div>

          {showExpenseForm && (
            <form
              onSubmit={handleCreateExpense}
              style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.75rem', marginBottom: '1rem', alignItems: 'end' }}
            >
              {[
                { label: 'Description', key: 'description', type: 'text', placeholder: 'Expense description' },
                { label: 'Amount (₹)', key: 'amount', type: 'number', placeholder: '' },
                { label: 'Date', key: 'date', type: 'date', placeholder: '' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={expenseForm[key as keyof ExpenseRequestDto] as string | number}
                    onChange={(e) => setExpenseForm((p) => ({ ...p, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                    required
                    style={{ fontFamily: 'Urbanist, sans-serif', fontSize: '0.9rem', color: '#1e293b', background: '#f8f9ff', border: '1.5px solid #e2e8f0', borderLeft: '3px solid #f97316', borderRadius: 8, padding: '0.5rem 0.8rem', outline: 'none' }}
                  />
                </div>
              ))}
              <button type="submit" className={styles['btn-primary']} style={{ alignSelf: 'flex-end' }}>Save</button>
            </form>
          )}

          {budgetLoading ? (
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
                      <td>
                        <span
                          className={styles.badge}
                          style={
                            exp.status === 'APPROVED' ? { background: '#f0fdf4', color: '#16a34a' }
                            : exp.status === 'PAID' ? { background: '#eff6ff', color: '#1d4ed8' }
                            : exp.status === 'REJECTED' ? { background: '#fff1f2', color: '#be123c' }
                            : { background: '#fefce8', color: '#a16207' }
                          }
                        >
                          {exp.status ?? 'SUBMITTED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {ticketModalOpen && (
        <TicketModal
          onClose={() => { setTicketModalOpen(false); setEditingTicket(null) }}
          onSave={handleTicketSave}
          existing={editingTicket}
        />
      )}
    </div>
  )
}
