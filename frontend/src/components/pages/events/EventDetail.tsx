import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchEventById } from '../../../store/slices/eventsSlice'
import { fetchTicketsByEvent } from '../../../store/slices/ticketsSlice'
import { fetchBudget, fetchExpenses } from '../../../store/slices/budgetSlice'
import { OverviewTab } from './tabs/OverviewTab'
import { TicketsTab } from './tabs/TicketsTab'
import { RegistrationsTab } from './tabs/RegistrationsTab'
import { AttendeesTab } from './tabs/AttendeesTab'
import { BudgetTab } from './tabs/BudgetTab'
import {
  Container, Button, Nav,
} from 'react-bootstrap'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { ArrowLeft } from 'react-bootstrap-icons'
import { EventStatusBadge } from '../../elements/events/EventStatusBadge'
import BookingVenueAndResource from '../booking/BookingVenueAndResource'

type Tab = 'overview' | 'tickets' | 'registrations' | 'attendees' | 'budget' | 'venue-and-resource'

const TABS: { key: Tab; label: string }[] = [
  { key: 'overview',      label: 'Overview' },
  { key: 'tickets',       label: 'Tickets' },
  { key: 'registrations', label: 'Registrations' },
  { key: 'attendees',     label: 'Attendees' },
  { key: 'budget',        label: 'Budget' },
  { key: 'venue-and-resource', label: 'Venue and Resource' }
]

export const EventDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { selectedEvent, loading } = useAppSelector((s) => s.events)

  const isAdmin    = location.pathname.startsWith('/admin')
  const backPath   = isAdmin ? '/admin/events' : '/organizer/dashboard'
  const backLabel  = isAdmin ? 'All Events' : 'Dashboard'

  const [activeTab, setActiveTab] = useState<Tab>('overview')

  useEffect(() => {
    if (!id) return
    const timer = setTimeout(() => {
      dispatch(fetchEventById(id))
      dispatch(fetchTicketsByEvent({ eventId: id }))
      dispatch(fetchBudget(id))
      dispatch(fetchExpenses({ eventId: id }))
    }, 0)
    return () => clearTimeout(timer)
  }, [id, dispatch])

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      {/* Banner */}
      <div className="es-banner">
        <Container fluid className="px-3 px-md-4 py-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <button
              onClick={() => navigate(backPath)}
              className="btn btn-link p-0 mb-2 d-flex align-items-center gap-1"
              style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem', textDecoration: 'none' }}
            >
              <ArrowLeft size={13} /> {backLabel}
            </button>
            {loading ? (
              <SkeletonTheme baseColor="rgba(255,255,255,0.15)" highlightColor="rgba(255,255,255,0.28)">
                <Skeleton width="52%" height={26} borderRadius={6} style={{ marginBottom: 8, display: 'block' }} />
                <Skeleton width="32%" height={13} borderRadius={4} style={{ display: 'block' }} />
              </SkeletonTheme>
            ) : (
              <>
                <h1 className="fw-bold fs-3 mb-1">{selectedEvent?.eventName}</h1>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <span className="small" style={{ color: 'rgba(255,255,255,0.72)' }}>
                    {selectedEvent?.startAt} → {selectedEvent?.endAt}
                  </span>
                  <EventStatusBadge status={selectedEvent?.status?.toLowerCase() ?? ''} variant="event" />
                </div>
                {selectedEvent?.organizer && (
                  <p className="mb-0 mt-1 small" style={{ color: 'rgba(255,255,255,0.72)' }}>
                    Organizer: <span className="fw-semibold" style={{ color: '#fff' }}>{selectedEvent.organizer.name}</span>
                    <span className="ms-1">({selectedEvent.organizer.email})</span>
                  </p>
                )}
              </>
            )}
          </div>
          {!loading && (
            <div className="d-flex gap-2">
              {isAdmin && (
                <Button variant="outline-light" size="sm" className="fw-semibold rounded-3" onClick={() => navigate(`/admin/events/${id}/edit`)}>
                  Edit Event
                </Button>
              )}
              <Button variant="light" size="sm" className="fw-semibold rounded-3" onClick={() => navigate(`/organizer/analytics/${id}`)}>
                Analytics
              </Button>
            </div>
          )}
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
        {!loading && selectedEvent && (
          <>
            {activeTab === 'overview'      && <OverviewTab eventId={id!} eventStartAt={selectedEvent.startAt} eventEndAt={selectedEvent.endAt} />}
            {activeTab === 'tickets'       && <TicketsTab eventId={id!} />}
            {activeTab === 'registrations' && <RegistrationsTab />}
            {activeTab === 'attendees'     && <AttendeesTab />}
            {activeTab === 'venue-and-resource' && <BookingVenueAndResource eventId={id!} />}
            {activeTab === 'budget'        && <BudgetTab eventId={id!} />}
          </>
        )}
      </Container>
    </div>
  )
}
