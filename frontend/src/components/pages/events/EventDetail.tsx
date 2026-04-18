import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchEventById } from '../../../store/slices/eventsSlice'
import { fetchTicketsByEvent } from '../../../store/slices/ticketsSlice'
import { fetchRegistrationsByEvent } from '../../../store/slices/registrationsSlice'
import { fetchBudget, fetchExpenses } from '../../../store/slices/budgetSlice'
import { OverviewTab } from './tabs/OverviewTab'
import { TicketsTab } from './tabs/TicketsTab'
import { RegistrationsTab } from './tabs/RegistrationsTab'
import { BudgetTab } from './tabs/BudgetTab'
import styles from '../../../css/events/EventsPanel.module.css'
import BookingVenueAndResource from '../booking/BookingVenueAndResource'

type Tab = 'overview' | 'tickets' | 'registrations' | 'budget' | 'venue-and-resource'

const TABS: { key: Tab; label: string }[] = [
  { key: 'overview',      label: 'Overview' },
  { key: 'tickets',       label: 'Tickets' },
  { key: 'registrations', label: 'Registrations' },
  { key: 'budget',        label: 'Budget' },
  { key: 'venue-and-resource', label: 'Venue and Resource' }
]

export const EventDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { selectedEvent } = useAppSelector((s) => s.events)

  const [activeTab, setActiveTab] = useState<Tab>('overview')

  useEffect(() => {
    if (!id) return
    dispatch(fetchEventById(id))
    dispatch(fetchTicketsByEvent({ eventId: id }))
    dispatch(fetchRegistrationsByEvent({ eventId: id }))
    dispatch(fetchBudget(id))
    dispatch(fetchExpenses({ eventId: id }))
  }, [id, dispatch])

  if (!selectedEvent) {
    return <div className={styles.page}><p className={styles.loading}>Loading event…</p></div>
  }

  return (
    <div className={styles.page}>
      <div className={styles.banner}>
        <div className={styles['banner-inner']}>
          <div className={styles['banner-text']}>
            <button
              onClick={() => navigate('/organizer/dashboard')}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', cursor: 'pointer', padding: 0, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              ← Dashboard
            </button>
            <h1>{selectedEvent.eventName}</h1>
            <p>
              {selectedEvent.startAt} → {selectedEvent.endAt}
              &nbsp;&nbsp;·&nbsp;&nbsp;
              <span style={{ textTransform: 'capitalize' }}>{selectedEvent.status}</span>
            </p>
          </div>
          <div className={styles['banner-actions']}>
            <button className={styles['btn-primary']} onClick={() => navigate(`/organizer/analytics/${id}`)}>
              Analytics
            </button>
          </div>
        </div>
      </div>

      <div className={styles.content}>
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

        {activeTab === 'overview'      && <OverviewTab eventId={id!} eventStartAt={selectedEvent.startAt} />}
        {activeTab === 'tickets'       && <TicketsTab eventId={id!} />}
        {activeTab === 'registrations' && <RegistrationsTab />}
        {activeTab === 'venue-and-resource' && <BookingVenueAndResource eventId={id!} />}
        {activeTab === 'budget'        && <BudgetTab eventId={id!} />}
      </div>
    </div>
  )
}
