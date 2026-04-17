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
import {
  Container, Button, Nav, Spinner,
} from 'react-bootstrap'
import { ArrowLeft } from 'react-bootstrap-icons'
import { EventStatusBadge } from '../../elements/events/EventStatusBadge'

type Tab = 'overview' | 'tickets' | 'registrations' | 'budget'

const TABS: { key: Tab; label: string }[] = [
  { key: 'overview',      label: 'Overview' },
  { key: 'tickets',       label: 'Tickets' },
  { key: 'registrations', label: 'Registrations' },
  { key: 'budget',        label: 'Budget' },
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
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '50vh' }}>
        <Spinner animation="border" style={{ color: 'var(--blue)' }} />
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      {/* Banner */}
      <div className="es-banner text-white">
        <Container fluid className="px-3 px-md-4 py-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <button
              onClick={() => navigate('/organizer/dashboard')}
              className="btn btn-link p-0 mb-2 d-flex align-items-center gap-1"
              style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem', textDecoration: 'none' }}
            >
              <ArrowLeft size={13} /> Dashboard
            </button>
            <h1 className="fw-bold fs-3 mb-1">{selectedEvent.eventName}</h1>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="text-white-50 small">
                {selectedEvent.startAt} → {selectedEvent.endAt}
              </span>
              <EventStatusBadge status={selectedEvent.status?.toLowerCase()} variant="event" />
            </div>
          </div>
          <Button variant="light" size="sm" className="fw-semibold rounded-3" onClick={() => navigate(`/organizer/analytics/${id}`)}>
            Analytics
          </Button>
        </Container>
      </div>

      {/* Tab navigation */}
      <div
        className="border-bottom"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)', transition: 'background 0.3s' }}
      >
        <Container fluid className="px-3 px-md-4">
          <Nav>
            {TABS.map(({ key, label }) => (
              <Nav.Link
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  color: activeTab === key ? 'var(--blue)' : 'var(--text-secondary)',
                  fontWeight: activeTab === key ? 600 : 400,
                  borderBottom: activeTab === key ? '2px solid var(--blue)' : '2px solid transparent',
                  paddingBottom: '0.6rem',
                  paddingTop: '0.6rem',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  marginRight: '0.25rem',
                }}
              >
                {label}
              </Nav.Link>
            ))}
          </Nav>
        </Container>
      </div>

      <Container fluid className="px-3 px-md-4 py-4">
        {activeTab === 'overview'      && <OverviewTab eventId={id!} eventStartAt={selectedEvent.startAt} />}
        {activeTab === 'tickets'       && <TicketsTab eventId={id!} />}
        {activeTab === 'registrations' && <RegistrationsTab />}
        {activeTab === 'budget'        && <BudgetTab eventId={id!} />}
      </Container>
    </div>
  )
}
