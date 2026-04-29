import { useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { registrationService } from '../../../../services/events/registrationService'
import { usePaginatedQuery } from '../../../../hooks/usePaginatedQuery'
import { EventStatusBadge } from '../../../elements/events/EventStatusBadge'
import { PaginationBar } from '../../../elements/common/PaginationBar'
import type { RegistrationDto } from '../../../../types/events'
import { Card, Table, Button, ButtonGroup, Spinner, Form, InputGroup } from 'react-bootstrap'
import { TableRowsSkeleton } from '../../../elements/skeletons/PageSkeleton'

type RegFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'

export const RegistrationsTab = () => {
  const { id: eventId } = useParams<{ id: string }>()

  const [regFilter, setRegFilter]           = useState<RegFilter>('ALL')
  const [ticketTypeFilter, setTicketTypeFilter] = useState<string>('ALL')
  const [attendeeSearch, setAttendeeSearch] = useState<string>('')
  const [actionLoading, setActionLoading]   = useState<string | null>(null)

  const fetcher = useCallback(
    (params: { status?: string; ticketType?: string; attendeeName?: string; page: number; size: number }) =>
      registrationService.getByEventId(
        eventId!,
        params.status,
        undefined,
        params.ticketType,
        params.attendeeName,
        params.page,
        params.size
      ),
    [eventId]
  )

  const { data: registrations, page, totalPages, loading, setPage, refetch } =
    usePaginatedQuery<RegistrationDto, { status?: string; ticketType?: string; attendeeName?: string }>({
      fetcher,
      itemsKey: 'registrations',
      params: {
        status:       regFilter       !== 'ALL' ? regFilter       : undefined,
        ticketType:   ticketTypeFilter !== 'ALL' ? ticketTypeFilter : undefined,
        attendeeName: attendeeSearch.trim() || undefined,
      },
      size: 10,
      debounceMs: 300,
    })

  const uniqueTicketTypes = [...new Set(registrations.map((r) => r.ticketType).filter(Boolean))] as string[]

  const handleApprove = async (registrationId: string) => {
    setActionLoading(registrationId)
    try { await registrationService.approve(registrationId); refetch() }
    finally { setActionLoading(null) }
  }

  const handleReject = async (registrationId: string) => {
    setActionLoading(registrationId)
    try { await registrationService.reject(registrationId); refetch() }
    finally { setActionLoading(null) }
  }

  return (
    <Card className="es-card border shadow-sm">
      <Card.Body className="p-3 p-md-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Card.Title className="mb-0 fw-semibold" style={{ color: 'var(--text-primary)' }}>Registrations</Card.Title>
        </div>

        {/* Participant search */}
        <InputGroup className="mb-3" style={{ maxWidth: 340 }}>
          <Form.Control
            placeholder="Search by name or email..."
            value={attendeeSearch}
            onChange={(e) => setAttendeeSearch(e.target.value)}
            style={{ fontSize: '0.85rem' }}
          />
          {attendeeSearch && (
            <Button variant="outline-secondary" onClick={() => setAttendeeSearch('')} style={{ fontSize: '0.85rem' }}>
              ✕
            </Button>
          )}
        </InputGroup>

        {/* Status filter */}
        <div className="mb-2">
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: 8 }}>Status</span>
          <ButtonGroup className="flex-wrap gap-1">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as RegFilter[]).map((f) => (
              <Button
                key={f}
                size="sm"
                variant={regFilter === f ? 'primary' : 'outline-secondary'}
                className="rounded-pill"
                onClick={() => setRegFilter(f)}
                style={{ fontSize: '0.78rem' }}
              >
                {f}
              </Button>
            ))}
          </ButtonGroup>
        </div>

        {/* Ticket type filter */}
        {uniqueTicketTypes.length > 0 && (
          <div className="mb-3">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: 8 }}>Ticket Type</span>
            <ButtonGroup className="flex-wrap gap-1">
              <Button
                size="sm"
                variant={ticketTypeFilter === 'ALL' ? 'primary' : 'outline-secondary'}
                className="rounded-pill"
                onClick={() => setTicketTypeFilter('ALL')}
                style={{ fontSize: '0.78rem' }}
              >
                ALL
              </Button>
              {uniqueTicketTypes.map((t) => (
                <Button
                  key={t}
                  size="sm"
                  variant={ticketTypeFilter === t ? 'primary' : 'outline-secondary'}
                  className="rounded-pill"
                  onClick={() => setTicketTypeFilter(t)}
                  style={{ fontSize: '0.78rem', textTransform: 'capitalize' }}
                >
                  {t}
                </Button>
              ))}
            </ButtonGroup>
          </div>
        )}

        <Table hover responsive className="mb-0" style={{ fontSize: '0.85rem' }}>
          <thead style={{ background: 'var(--bg-subtle)' }}>
            <tr>
              <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Registration ID</th>
              <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Attendee</th>
              <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Ticket Type</th>
              <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Status</th>
              <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <TableRowsSkeleton rows={5} cols={5} /> : registrations.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-3" style={{ color: 'var(--text-muted)' }}>No registrations found.</td></tr>
            ) : registrations.map((r) => (
                <tr key={r.registrationId}>
                  <td className="align-middle" style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {r.registrationId}
                  </td>
                  <td className="align-middle">
                    {r.attendeeDetails ? (
                      <div>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{r.attendeeDetails.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.attendeeDetails.email}</div>
                      </div>
                    ) : (
                      <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{r.attendeeId}</span>
                    )}
                  </td>
                  <td className="align-middle">
                    {r.ticketType ? (
                      <div>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{r.ticketType}</div>
                        {r.ticketPrice != null && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>₹{r.ticketPrice.toFixed(2)}</div>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                  <td className="align-middle">
                    <EventStatusBadge status={r.status} variant="registration" />
                  </td>
                  <td className="align-middle">
                    {r.status === 'PENDING' && (
                      <div className="d-flex gap-1">
                        <Button
                          variant="outline-success" size="sm" className="rounded-3" style={{ fontSize: '0.78rem' }}
                          disabled={actionLoading === r.registrationId}
                          onClick={() => handleApprove(r.registrationId)}
                        >
                          {actionLoading === r.registrationId ? <Spinner animation="border" size="sm" /> : 'Approve'}
                        </Button>
                        <Button
                          variant="outline-danger" size="sm" className="rounded-3" style={{ fontSize: '0.78rem' }}
                          disabled={actionLoading === r.registrationId}
                          onClick={() => handleReject(r.registrationId)}
                        >
                          {actionLoading === r.registrationId ? <Spinner animation="border" size="sm" /> : 'Reject'}
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>

        <PaginationBar page={page} totalPages={totalPages} onChange={setPage} />
      </Card.Body>
    </Card>
  )
}
