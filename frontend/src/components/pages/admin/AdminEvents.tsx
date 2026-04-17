import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../../api/axiosInstance'
import { AdminSubNav } from '../../elements/admin/AdminSubNav'
import {
  Container, Card, Table, Badge, Button, Form, InputGroup, Row, Col, Spinner, Pagination,
} from 'react-bootstrap'
import { Search } from 'react-bootstrap-icons'

interface EventDto {
  id: string
  name: string
  organizerName?: string
  startDate?: string
  endDate?: string
  venueName?: string
  status?: string
}

const STATUSES = ['ALL', 'PUBLISHED', 'DRAFT', 'COMPLETED', 'CANCELLED']
const PAGE_SIZE = 10

const statusBadgeClass = (status: string) => {
  const map: Record<string, string> = {
    PUBLISHED: 'es-badge-published', DRAFT: 'es-badge-draft',
    COMPLETED: 'es-badge-completed', CANCELLED: 'es-badge-cancelled',
  }
  return map[status] ?? 'es-badge-draft'
}

const formatDate = (iso?: string) => {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
  catch { return iso }
}

export const AdminEvents: React.FC = () => {
  const navigate = useNavigate()
  const [allEvents, setAllEvents] = useState<EventDto[]>([])
  const [loading, setLoading]     = useState(false)
  const [search, setSearch]       = useState('')
  const [status, setStatus]       = useState('ALL')
  const [page, setPage]           = useState(0)

  useEffect(() => {
    setLoading(true)
    axiosInstance.get('/api/v1/event-manager/events')
      .then(({ data }) => setAllEvents(Array.isArray(data) ? data : (data.content ?? [])))
      .catch(() => setAllEvents([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return allEvents.filter((ev) => {
      const matchStatus = status === 'ALL' || ev.status === status
      const matchSearch = !q || ev.name.toLowerCase().includes(q) || ev.organizerName?.toLowerCase().includes(q)
      return matchStatus && matchSearch
    })
  }, [allEvents, search, status])

  useEffect(() => { setPage(0) }, [search, status])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageEvents = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      {/* Banner */}
      <div className="es-banner text-white">
        <Container fluid className="px-3 px-md-4 py-3">
          <h1 className="fw-bold fs-3 mb-1">All Events</h1>
          <p className="mb-0 text-white-50 small">Monitor every event on the platform</p>
        </Container>
      </div>

      <AdminSubNav />

      <Container fluid className="px-3 px-md-4 py-4">
        <Card className="es-card border shadow-sm">
          <Card.Body className="p-3 p-md-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Card.Title className="mb-0 fw-semibold" style={{ color: 'var(--text-primary)' }}>All Events</Card.Title>
              <span className="small" style={{ color: 'var(--text-muted)' }}>
                {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              </span>
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
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" style={{ color: 'var(--blue)' }} />
              </div>
            ) : (
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
                  {pageEvents.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-4" style={{ color: 'var(--text-muted)' }}>No events found</td></tr>
                  ) : pageEvents.map((ev) => (
                    <tr key={ev.id}>
                      <td className="align-middle fw-semibold" style={{ color: 'var(--text-primary)' }}>{ev.name}</td>
                      <td className="align-middle" style={{ color: 'var(--text-secondary)' }}>{ev.organizerName || '—'}</td>
                      <td className="align-middle" style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {formatDate(ev.startDate)}
                        {ev.endDate && ev.endDate !== ev.startDate ? ` – ${formatDate(ev.endDate)}` : ''}
                      </td>
                      <td className="align-middle" style={{ color: 'var(--text-secondary)' }}>{ev.venueName || '—'}</td>
                      <td className="align-middle">
                        {ev.status
                          ? <Badge className={`${statusBadgeClass(ev.status)} border-0`} style={{ fontSize: '0.7rem' }}>{ev.status}</Badge>
                          : '—'}
                      </td>
                      <td className="align-middle">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="rounded-3"
                          style={{ fontSize: '0.78rem' }}
                          onClick={() => navigate(`/organizer/events/${ev.id}`)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}

            {/* Pagination */}
            {filtered.length > PAGE_SIZE && (
              <div className="d-flex justify-content-between align-items-center mt-3">
                <small style={{ color: 'var(--text-muted)' }}>
                  Page {page + 1} of {totalPages} · {filtered.length} events
                </small>
                <Pagination size="sm" className="mb-0">
                  <Pagination.Prev disabled={page === 0} onClick={() => setPage((p) => p - 1)} />
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                    <Pagination.Item key={i} active={i === page} onClick={() => setPage(i)}>{i + 1}</Pagination.Item>
                  ))}
                  <Pagination.Next disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)} />
                </Pagination>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  )
}
