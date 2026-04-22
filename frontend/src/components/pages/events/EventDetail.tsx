import { useEffect, useState } from 'react'
import { useNavigate, useParams, NavLink } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchEventById } from '../../../store/slices/eventsSlice'
import { fetchTicketsByEvent, createTicket, updateTicket, deleteTicket } from '../../../store/slices/ticketsSlice'
import { fetchRegistrationsByEvent, approveRegistration, rejectRegistration } from '../../../store/slices/registrationsSlice'
import { fetchBudget, fetchExpenses, setBudget, createExpense } from '../../../store/slices/budgetSlice'
import { eventService } from '../../../services/events/eventService'
import { TicketModal } from '../../elements/events/TicketModal'
import type { ScheduleResponseDto, CreateTicketRequest, TicketResponseDto, BudgetRequestDto, ExpenseRequestDto } from '../../../types/events'
import styles from '../../../css/events/EventsPanel.module.css'

type Tab = 'overview' | 'tickets' | 'registrations' | 'budget'
type RegFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'

const STATUS_BADGE: Record<string, string> = {
  DRAFT:     styles['badge-draft'],
  PUBLISHED: styles['badge-published'],
  COMPLETED: styles['badge-completed'],
  CANCELLED: styles['badge-cancelled'],
}

const SCHEDULE_BADGE: Record<string, string> = {
  DRAFT:      styles['badge-draft'],
  ACTIVE:     styles['badge-active'],
  COMPLETED:  styles['badge-completed'],
  TERMINATED: styles['badge-cancelled'],
}

const REG_BADGE: Record<string, string> = {
  PENDING:  styles['badge-pending'],
  APPROVED: styles['badge-approved'],
  REJECTED: styles['badge-rejected'],
}

const EXP_BADGE: Record<string, string> = {
  APPROVED:  styles['badge-approved'],
  PAID:      styles['badge-paid'],
  REJECTED:  styles['badge-rejected'],
  SUBMITTED: styles['badge-submitted'],
}

const navLink = ({ isActive }: { isActive: boolean }) =>
  `${styles['subnav-link']}${isActive ? ` ${styles.active}` : ''}`

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

  const TABS: { key: Tab; label: string }[] = [
    { key: 'overview',      label: 'Overview' },
    { key: 'tickets',       label: 'Tickets' },
    { key: 'registrations', label: 'Registrations' },
    { key: 'budget',        label: 'Budget' },
  ]

  return (
    <div className={styles.page}>
      {/* Banner */}
      <div className={styles.banner}>
        <div className={styles['banner-inner']}>
          <div className={styles['banner-text']}>
            <h1>{selectedEvent.eventName}</h1>
            <p>
              {selectedEvent.startAt} → {selectedEvent.endAt}
              &nbsp;&nbsp;·&nbsp;&nbsp;
              <span style={{ textTransform: 'capitalize' }}>{selectedEvent.status}</span>
            </p>
          </div>
          <div className={styles['banner-actions']}>
            <button className={styles['btn-secondary']} onClick={() => navigate(`/organizer/events/${id}/edit`)}>
              Edit Event
            </button>
            <button className={styles['btn-primary']} onClick={() => navigate(`/organizer/analytics/${id}`)}>
              Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Portal sub-nav */}
      <div className={styles.subnav}>
        <div className={styles['subnav-inner']}>
          <NavLink to="/organizer/dashboard"    end className={navLink}>Dashboard</NavLink>
          <NavLink to="/organizer/events/create"    className={navLink}>Create Event</NavLink>
        </div>
      </div>

      <div className={styles.content}>
        {/* Within-page tab strip */}
        <div className={styles['tab-strip']}>
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              className={`${styles['tab-btn']}${activeTab === key ? ` ${styles.active}` : ''}`}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Overview ──────────────────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <>
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

            <div className={styles.card}>
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
                          <td>
                            <span className={`${styles.badge} ${SCHEDULE_BADGE[s.status] ?? styles['badge-draft']}`}>
                              {s.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Tickets ───────────────────────────────────────────────────────────── */}
        {activeTab === 'tickets' && (
          <div className={styles.card}>
            <div className={styles['panel-header']}>
              <h3 className={styles['panel-title']}>Tickets</h3>
              <button
                className={styles['btn-primary']}
                onClick={() => { setEditingTicket(null); setTicketModalOpen(true) }}
              >
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
                          <span className={`${styles.badge} ${t.status === 'ACTIVE' ? styles['badge-active'] : styles['badge-inactive']}`}>
                            {t.status}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actions}>
                            <button className={styles['btn-sm']} onClick={() => { setEditingTicket(t); setTicketModalOpen(true) }}>
                              Edit
                            </button>
                            <button className={styles['btn-danger']} onClick={() => dispatch(deleteTicket(t.ticketId))}>
                              Delete
                            </button>
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

        {/* ── Registrations ─────────────────────────────────────────────────────── */}
        {activeTab === 'registrations' && (
          <div className={styles.card}>
            <div className={styles['panel-header']}>
              <h3 className={styles['panel-title']}>Registrations</h3>
            </div>
            <div className={styles['filter-row']}>
              {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as RegFilter[]).map((f) => (
                <button
                  key={f}
                  className={`${styles.chip}${regFilter === f ? ` ${styles.active}` : ''}`}
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
                          <span className={`${styles.badge} ${REG_BADGE[r.status] ?? styles['badge-pending']}`}>
                            {r.status}
                          </span>
                        </td>
                        <td>
                          {r.status === 'PENDING' && (
                            <div className={styles.actions}>
                              <button
                                className={styles['btn-success']}
                                disabled={actionLoading === r.registrationId}
                                onClick={() => dispatch(approveRegistration(r.registrationId))}
                              >
                                Approve
                              </button>
                              <button
                                className={styles['btn-danger']}
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

        {/* ── Budget ────────────────────────────────────────────────────────────── */}
        {activeTab === 'budget' && (
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
              <div className={styles['panel-header']}>
                <h3 className={styles['panel-title']}>Expenses</h3>
                <button className={styles['btn-primary']} onClick={() => setShowExpenseForm((v) => !v)}>
                  {showExpenseForm ? 'Cancel' : '+ Add Expense'}
                </button>
              </div>

              {showExpenseForm && (
                <form onSubmit={handleCreateExpense} className={styles['expense-form']}>
                  {[
                    { label: 'Description', key: 'description', type: 'text', placeholder: 'Expense description' },
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
                            <span className={`${styles.badge} ${EXP_BADGE[exp.status ?? 'SUBMITTED'] ?? styles['badge-submitted']}`}>
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
          </>
        )}

      </div>

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
