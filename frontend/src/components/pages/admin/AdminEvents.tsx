import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../../api/axiosInstance'
import { AdminSubNav } from '../../elements/admin/AdminSubNav'
import { PageBanner } from '../../elements/common/PageBanner'
import { EventStatusBadge } from '../../elements/events/EventStatusBadge'
import { fmtDate } from '../../../utils/dateHelpers'
import {
  Container, Card, Table, Badge, Button, Form, InputGroup, Row, Col, Pagination,
} from 'react-bootstrap'
import { TableRowsSkeleton } from '../../elements/skeletons/PageSkeleton'
import { Search } from 'react-bootstrap-icons'
import type { EventResponseDto, EventPageDto } from '../../../types/events'

const STATUSES = ['ALL', 'PUBLISHED', 'DRAFT', 'COMPLETED', 'CANCELLED']
const PAGE_SIZE = 10

export const AdminEvents: React.FC = () => {
  const navigate = useNavigate()
  const [events, setEvents]         = useState<EventResponseDto[]>([])
  const [totalElements, setTotal]   = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading]       = useState(false)
  const [search, setSearch]         = useState('')
  const [status, setStatus]         = useState('ALL')
  const [page, setPage]             = useState(0)
  const isFirstRender = useRef(true)

  const fetchEvents = (q: string, s: string, p: number) => {
    setLoading(true)
    const params: Record<string, string | number> = { page: p, size: PAGE_SIZE }
    if (q) params.search = q
    if (s !== 'ALL') params.status = s
    axiosInstance.get<EventPageDto>('/api/v1/event-manager/events', { params })
      .then(({ data }) => {
        setEvents(data.events ?? [])
        setTotal(data.totalElements ?? 0)
        setTotalPages(data.totalPages ?? 1)
      })
      .catch(() => { setEvents([]); setTotal(0); setTotalPages(1) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchEvents('', 'ALL', 0) }, [])

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    setPage(0)
    const timer = setTimeout(() => fetchEvents(search, status, 0), 300)
    return () => clearTimeout(timer)
  }, [search, status])

  const handlePageChange = (p: number) => {
    setPage(p)
    fetchEvents(search, status, p)
  }

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <PageBanner title="All Events" subtitle="Monitor every event on the platform" />

      <AdminSubNav />

      <Container fluid className="px-3 px-md-4 py-4">
        <Card className="es-card border shadow-sm">
          <Card.Body className="p-3 p-md-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Card.Title className="mb-0 fw-semibold" style={{ color: 'var(--text-primary)' }}>All Events</Card.Title>
              <div className="d-flex align-items-center gap-3">
                <span className="small" style={{ color: 'var(--text-muted)' }}>
                  {totalElements} result{totalElements !== 1 ? 's' : ''}
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  className="rounded-3"
                  style={{ fontSize: '0.82rem' }}
                  onClick={() => navigate('/admin/events/create')}
                >
                  + Create Event
                </Button>
              </div>
            </div>

            {/* Toolbar */}
            <Row className="g-2 mb-3">
              <Col xs={12} sm>
                <InputGroup>
                  <InputGroup.Text style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                    <Search size={14} style={{ color: 'var(--text-muted)' }} />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search events…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="es-form-control"
                  />
                </InputGroup>
              </Col>
              <Col xs={12} sm="auto">
                <Form.Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="es-form-control"
                  style={{ minWidth: 160 }}
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s}</option>)}
                </Form.Select>
              </Col>
            </Row>

            {/* Table */}
            <Table hover responsive className="mb-0" style={{ fontSize: '0.88rem' }}>
              <thead style={{ background: 'var(--bg-subtle)' }}>
                <tr>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Event</th>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Organizer</th>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Dates</th>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Venue</th>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Status</th>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <TableRowsSkeleton rows={10} cols={6} colWidths={['68%','52%','48%','58%','38%','30%']} /> : events.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-4" style={{ color: 'var(--text-muted)' }}>No events found</td></tr>
                  ) : events.map((ev) => (
                    <tr key={ev.id}>
                      <td className="align-middle fw-semibold" style={{ color: 'var(--text-primary)' }}>{ev.eventName}</td>
                      <td className="align-middle" style={{ color: 'var(--text-secondary)' }}>
                        {ev.organizer ? (
                          <span title={ev.organizerId}>
                            <span style={{ color: 'var(--text-primary)' }}>{ev.organizer.name}</span>
                            <br />
                            <span style={{ fontSize: '0.78rem' }}>{ev.organizer.email}</span>
                          </span>
                        ) : ev.organizerId}
                      </td>
                      <td className="align-middle" style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {fmtDate(ev.startAt)}
                        {ev.endAt && ev.endAt !== ev.startAt ? ` – ${fmtDate(ev.endAt)}` : ''}
                      </td>
                      <td className="align-middle" style={{ color: 'var(--text-secondary)' }}>{ev.venue ? `${ev.venue.name}, ${ev.venue.location}` : '—'}</td>
                      <td className="align-middle">
                        {ev.status
                          ? <EventStatusBadge status={ev.status?.toLowerCase()} variant="event" />
                          : '—'}
                      </td>
                      <td className="align-middle">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="rounded-3"
                          style={{ fontSize: '0.78rem' }}
                          onClick={() => navigate(`/admin/events/${ev.id}`)}
                        >
                          Manage
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-3">
                <small style={{ color: 'var(--text-muted)' }}>
                  Page {page + 1} of {totalPages} · {totalElements} events
                </small>
                <Pagination size="sm" className="mb-0">
                  <Pagination.Prev disabled={page === 0} onClick={() => handlePageChange(page - 1)} />
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                    <Pagination.Item key={i} active={i === page} onClick={() => handlePageChange(i)}>{i + 1}</Pagination.Item>
                  ))}
                  <Pagination.Next disabled={page + 1 >= totalPages} onClick={() => handlePageChange(page + 1)} />
                </Pagination>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  )
}
