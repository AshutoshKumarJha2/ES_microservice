import { useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { registrationService } from '../../../../services/events/registrationService'
import { EventStatusBadge } from '../../../elements/events/EventStatusBadge'
import { PaginationBar } from '../../../elements/common/PaginationBar'
import { usePaginatedQuery } from '../../../../hooks/usePaginatedQuery'
import type { RegistrationDto } from '../../../../types/events'
import { Card, Table, Button, Spinner, Form, InputGroup, Badge } from 'react-bootstrap'
import { TableRowsSkeleton } from '../../../elements/skeletons/PageSkeleton'

const ATTENDEE_STATUSES = 'CONFIRMED,CHECKED_IN'

export const AttendeesTab = () => {
  const { id: eventId } = useParams<{ id: string }>()
  const [search, setSearch] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetcher = useCallback(
    (params: { search?: string; page: number; size: number }) =>
      registrationService.getByEventId(
        eventId!, undefined, ATTENDEE_STATUSES, undefined,
        params.search, params.page, params.size
      ),
    [eventId]
  )

  const { data: attendees, page, totalPages, loading, setPage, refetch } = usePaginatedQuery<RegistrationDto, { search?: string }>({
    fetcher,
    itemsKey: 'registrations',
    params: { search: search || undefined },
    size: 20,
  })

  const handleCheckIn = async (registrationId: string) => {
    setActionLoading(registrationId)
    try {
      await registrationService.checkIn(registrationId)
      refetch()
    } finally {
      setActionLoading(null)
    }
  }

  const checkedInCount = attendees.filter((r) => r.status === 'CHECKED_IN').length
  const confirmedCount = attendees.filter((r) => r.status === 'CONFIRMED').length

  return (
    <Card className="es-card border shadow-sm">
      <Card.Body className="p-3 p-md-4">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <Card.Title className="mb-0 fw-semibold" style={{ color: 'var(--text-primary)' }}>Attendees</Card.Title>
          <div className="d-flex gap-2">
            <Badge className="es-badge-approved rounded-pill border-0 px-3 py-2" style={{ fontSize: '0.78rem' }}>
              Checked In: {checkedInCount}
            </Badge>
            <Badge className="es-badge-submitted rounded-pill border-0 px-3 py-2" style={{ fontSize: '0.78rem' }}>
              Confirmed: {confirmedCount}
            </Badge>
          </div>
        </div>

        {/* Search */}
        <InputGroup className="mb-3" style={{ maxWidth: 340 }}>
          <Form.Control
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ fontSize: '0.85rem' }}
          />
          {search && (
            <Button variant="outline-secondary" onClick={() => setSearch('')} style={{ fontSize: '0.85rem' }}>
              ✕
            </Button>
          )}
        </InputGroup>

        <Table hover responsive className="mb-0" style={{ fontSize: '0.85rem' }}>
          <thead style={{ background: 'var(--bg-subtle)' }}>
            <tr>
              <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Attendee</th>
              <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Ticket Type</th>
              <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Status</th>
              <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <TableRowsSkeleton rows={5} cols={4} /> : attendees.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-3" style={{ color: 'var(--text-muted)' }}>No confirmed attendees found.</td></tr>
            ) : attendees.map((r) => (
                <tr key={r.registrationId}>
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
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>${r.ticketPrice.toFixed(2)}</div>
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
                    {r.status === 'CONFIRMED' && (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="rounded-3"
                        style={{ fontSize: '0.78rem' }}
                        disabled={actionLoading === r.registrationId}
                        onClick={() => handleCheckIn(r.registrationId)}
                      >
                        {actionLoading === r.registrationId
                          ? <Spinner animation="border" size="sm" />
                          : 'Check In'}
                      </Button>
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
