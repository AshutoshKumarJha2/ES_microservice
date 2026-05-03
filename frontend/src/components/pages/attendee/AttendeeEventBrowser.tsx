import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap'
import { CardGridSkeleton } from '../../elements/skeletons/PageSkeleton'
import {
  CalendarEventFill, CalendarCheckFill, CheckCircleFill,
  BookmarkCheckFill, GeoAltFill,
} from 'react-bootstrap-icons'
import { eventService } from '../../../services/events/eventService'
import { registrationService } from '../../../services/events/registrationService'
import { EventStatusBadge } from '../../elements/events/EventStatusBadge'
import { StatCard } from '../../elements/common/StatCard'
import { PageBanner } from '../../elements/common/PageBanner'
import { PaginationBar } from '../../elements/common/PaginationBar'
import { usePaginatedQuery } from '../../../hooks/usePaginatedQuery'
import { fmtDate } from '../../../utils/dateHelpers'
import { EVENT_LABEL } from '../../../constants/eventConstants'
import type { EventResponseDto, RegistrationDto } from '../../../types/events'

type StatusFilter = 'ALL' | 'PUBLISHED' | 'COMPLETED' | 'REGISTERED'

const PAGE_SIZE = 12

export const AttendeeEventBrowser = () => {
  const navigate = useNavigate()
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState<StatusFilter>('PUBLISHED')
  const [regMap, setRegMap]   = useState<Map<string, RegistrationDto>>(new Map())

  const { data: events, page, totalPages, loading, setPage } = usePaginatedQuery<EventResponseDto, { search?: string }>({
    fetcher: (params) => eventService.getAll(params),
    itemsKey: 'events',
    params: { search: search || undefined },
    size: PAGE_SIZE,
  })

  // Load registrations once on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      registrationService.getMyRegistrations().then((res) => {
        const map = new Map<string, RegistrationDto>()
        res.registrations.forEach((r) => map.set(r.eventId, r))
        setRegMap(map)
      }).catch(() => {})
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const visibleEvents  = events.filter((e) => e.status !== 'CANCELLED')
  const published      = visibleEvents.filter((e) => e.status === 'PUBLISHED').length
  const completed      = visibleEvents.filter((e) => e.status === 'COMPLETED').length
  const myEventCount   = [...regMap.values()].filter((r) => r.status !== 'CANCELLED').length

  const filtered = visibleEvents.filter((e) => {
    return filter === 'ALL'        ? true :
           filter === 'REGISTERED' ? (regMap.has(e.id) && regMap.get(e.id)?.status !== 'CANCELLED') :
           e.status === filter
  })

  const STATS = [
    { label: 'Total Events', value: visibleEvents.length, accent: 'es-stat-card-orange',
      icon: <CalendarEventFill size={18} />, iconBg: 'var(--saffron-subtle)', iconColor: 'var(--saffron)' },
    { label: 'Upcoming',     value: published,             accent: 'es-stat-card-blue',
      icon: <CalendarCheckFill size={18} />, iconBg: 'var(--blue-subtle)', iconColor: 'var(--blue)' },
    { label: 'Completed',    value: completed,             accent: 'es-stat-card-green',
      icon: <CheckCircleFill size={18} />, iconBg: 'var(--green-subtle)', iconColor: 'var(--green)' },
    { label: 'My Events',    value: myEventCount,          accent: 'es-stat-card-amber',
      icon: <BookmarkCheckFill size={18} />, iconBg: 'var(--amber-subtle)', iconColor: 'var(--amber)' },
  ]

  const FILTERS: { label: string; value: StatusFilter }[] = [
    { label: 'All',        value: 'ALL'        },
    { label: 'Upcoming',   value: 'PUBLISHED'  },
    { label: 'Completed',  value: 'COMPLETED'  },
    { label: 'Registered', value: 'REGISTERED' },
  ]

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <PageBanner title="Browse Events" subtitle="Discover and register for upcoming events" />

      <Container fluid className="px-3 px-md-4 py-4">
        {/* Stats */}
        <Row className="g-3 mb-4">
          {STATS.map((s) => (
            <Col key={s.label} xs={6} lg={3}>
              <StatCard {...s} loading={loading} />
            </Col>
          ))}
        </Row>

        {/* Search & filter bar */}
        <div className="d-flex flex-wrap gap-2 align-items-center mb-4">
          <Form.Control
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events…"
            className="es-form-control rounded-3"
            style={{ maxWidth: 280 }}
          />
          <div className="d-flex gap-2 flex-wrap">
            {FILTERS.map((f) => (
              <Button
                key={f.value}
                size="sm"
                variant={filter === f.value ? 'primary' : 'outline-secondary'}
                className="rounded-3 fw-medium"
                style={{ fontSize: '0.82rem' }}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </Button>
            ))}
          </div>
          <span className="small ms-auto" style={{ color: 'var(--text-muted)' }}>
            {filtered.length} event{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Event cards */}
        {loading ? (
          <CardGridSkeleton count={6} cardHeight={180} />
        ) : filtered.length === 0 ? (
          <div className="text-center py-5 d-flex flex-column align-items-center gap-3">
            <div
              style={{
                width: 56, height: 56, borderRadius: 16,
                background: 'var(--blue-subtle)', color: 'var(--blue)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <CalendarEventFill size={24} />
            </div>
            <div>
              <div className="fw-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No events found</div>
              <div className="small" style={{ color: 'var(--text-muted)' }}>Try a different search or filter.</div>
            </div>
          </div>
        ) : (
          <Row className="g-3">
            {filtered.map((event) => {
              const venue           = event.venue ?? null
              const reg             = regMap.get(event.id)
              const isRegisterable  = event.status === 'PUBLISHED' && (!reg || reg.status === 'CANCELLED')
              return (
                <Col key={event.id} xs={12} md={6} lg={4}>
                  <Card className="es-card border shadow-sm h-100">
                    <Card.Body className="p-3 d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <Card.Title
                          className="fw-semibold mb-0 me-2"
                          style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.3 }}
                        >
                          {event.eventName}
                        </Card.Title>
                        <EventStatusBadge status={event.status?.toLowerCase()} variant="event" label={EVENT_LABEL[event.status] ?? event.status} />
                      </div>

                      <div className="small mb-1" style={{ color: 'var(--text-secondary)' }}>
                        {fmtDate(event.startAt)} — {fmtDate(event.endAt)}
                      </div>

                      {venue ? (
                        <div className="small mb-2 d-flex align-items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                          <GeoAltFill size={11} />
                          {venue.name}, {venue.location}
                        </div>
                      ) : (
                        <div className="mb-2" />
                      )}

                      {reg && reg.status !== 'CANCELLED' && (
                        <div className="mb-2">
                          <EventStatusBadge
                            variant="registration"
                            status={reg.status}
                            label={reg.status === 'CHECKED_IN' ? 'Checked In' : reg.status === 'CONFIRMED' ? 'Confirmed' : 'Registered'}
                          />
                        </div>
                      )}

                      <div className="mt-auto">
                        <Button
                          variant={isRegisterable ? 'primary' : 'outline-primary'}
                          size="sm"
                          className="rounded-3 w-100 fw-medium"
                          style={{ fontSize: '0.82rem' }}
                          onClick={() => navigate(`/attendee/events/${event.id}`)}
                        >
                          {isRegisterable ? 'Register' : 'View Details'}
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              )
            })}
          </Row>
        )}

        <PaginationBar page={page} totalPages={totalPages} onChange={setPage} className="justify-content-center" />
      </Container>
    </div>
  )
}
