import { useEffect, useState, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
  fetchBookingsByManager,
  updateBookingStatus,
  clearActionError,
  clearBookings,
} from '../../../store/slices/venue/venueSlice'
import type { BookingStatus } from '../../../types/venue'
import { approveRequestedAllocation } from '../../../store/slices/resourceSlice'
import {
  Container, Card, Table, Button, Alert, Badge, Form, InputGroup,
} from 'react-bootstrap'
import { PageBanner } from '../../elements/common/PageBanner'
import { ConfirmModal } from '../../elements/common/ConfirmModal'
import { Search } from 'react-bootstrap-icons'
import { TableRowsSkeleton } from '../../elements/skeletons/PageSkeleton'

/* ── Helpers ────────────────────────────────────────────────────────────────── */

const bookingBadgeClass = (status: BookingStatus): string => {
  if (status === 'CONFIRMED') return 'es-badge-approved'
  if (status === 'CANCELLED') return 'es-badge-cancelled'
  return 'es-badge-pending'
}

const formatDate = (d: string) => {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

/* ── Component ──────────────────────────────────────────────────────────────── */

export const VenueBookings = () => {
  const dispatch = useAppDispatch()
  const {
    bookings, bookingsLoading, bookingsError,
    actionError, actionLoading,
  } = useAppSelector((s) => s.venue)

  const [search, setSearch]                       = useState('')
  const [confirmCancelId, setConfirmCancelId]     = useState<string | null>(null)
  const [confirmApproveId, setConfirmApproveId]   = useState<{ bookingId: string; eventId?: string } | null>(null)

  useEffect(() => {
    dispatch(fetchBookingsByManager())
    return () => { dispatch(clearBookings()) }
  }, [dispatch])

  const filteredBookings = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return bookings
    return bookings.filter(b =>
      b.bookingId.toLowerCase().includes(q) || b.eventId.toLowerCase().includes(q)
    )
  }, [bookings, search])

  const handleStatusChange = (bookingId: string, status: BookingStatus, eventId?: string) => {
    dispatch(updateBookingStatus({ bookingId, status }))
    if (status === 'CONFIRMED' && eventId) {
      dispatch(approveRequestedAllocation(eventId))
    }
  }

  const handleConfirmApprove = () => {
    if (!confirmApproveId) return
    handleStatusChange(confirmApproveId.bookingId, 'CONFIRMED', confirmApproveId.eventId)
    setConfirmApproveId(null)
  }

  const handleConfirmCancel = () => {
    if (!confirmCancelId) return
    handleStatusChange(confirmCancelId, 'CANCELLED')
    setConfirmCancelId(null)
  }

  return (
    <div>
      <PageBanner title="Bookings" subtitle="View and manage booking requests for your venues" />

      <Container fluid className="px-3 px-md-4 py-4">
        {actionError && (
          <Alert variant="danger" className="py-2 mb-3" onClose={() => dispatch(clearActionError())} dismissible>
            {actionError}
          </Alert>
        )}

        {/* Search */}
        {bookings.length > 0 && (
          <InputGroup className="mb-3" style={{ maxWidth: 360 }}>
            <InputGroup.Text className="es-form-control border-end-0 rounded-start-3">
              <Search size={14} style={{ color: 'var(--text-secondary)' }} />
            </InputGroup.Text>
            <Form.Control
              className="es-form-control border-start-0 rounded-end-3"
              placeholder="Search by booking or event ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        )}

        {/* Bookings Table */}
        <Card className="es-card border shadow-sm">
          <Card.Body className="p-0">
            {bookings.length > 0 && (
              <div className="d-flex justify-content-end align-items-center px-3 pt-3 pb-2">
                <span className="small" style={{ color: 'var(--text-muted)' }}>
                  {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
            {bookingsError ? (
              <p className="text-center py-4 mb-0" style={{ color: 'var(--text-muted)' }}>{bookingsError}</p>
            ) : (!bookingsLoading && filteredBookings.length === 0) ? (
              <p className="text-center py-4 mb-0" style={{ color: 'var(--text-muted)' }}>
                {bookings.length === 0
                  ? 'No bookings found for your venues.'
                  : 'No bookings match your search.'}
              </p>
            ) : (
              <Table hover responsive className="mb-0" style={{ fontSize: '0.88rem' }}>
                <thead style={{ background: 'var(--bg-subtle)' }}>
                  <tr>
                    {['Booking ID', 'Event ID', 'Date', 'Resources', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="fw-semibold border-0 pb-2 px-3 pt-3" style={{ color: 'var(--text-primary)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookingsLoading ? <TableRowsSkeleton rows={5} cols={6} /> : filteredBookings.map((b) => (
                    <tr key={b.bookingId}>
                      <td className="align-middle px-3" style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-secondary)' }}>
                        {b.bookingId.slice(0, 8)}…
                      </td>
                      <td className="align-middle px-3" style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-secondary)' }}>
                        {b.eventId.slice(0, 8)}…
                      </td>
                      <td className="align-middle px-3" style={{ color: 'var(--text-secondary)' }}>{formatDate(b.date)}</td>
                      <td className="align-middle px-3">
                        {b.resourceList && b.resourceList.length > 0 ? (
                          <div className="d-flex flex-wrap gap-1">
                            {b.resourceList.map((r, i) => (
                              <Badge key={i} className="es-badge-draft border-0 fw-normal" style={{ fontSize: '0.7rem' }}>
                                {r.resourceName} ×{r.requestedQuantity}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>—</span>
                        )}
                      </td>
                      <td className="align-middle px-3">
                        <Badge className={`${bookingBadgeClass(b.status)} border-0`} style={{ fontSize: '0.7rem' }}>
                          {b.status.charAt(0) + b.status.slice(1).toLowerCase()}
                        </Badge>
                      </td>
                      <td className="align-middle px-3">
                        {b.status === 'PENDING' ? (
                          <div className="d-flex gap-2">
                            <Button
                              size="sm"
                              variant="outline-success"
                              className="rounded-2 fw-medium"
                              disabled={actionLoading}
                              onClick={() => setConfirmApproveId({ bookingId: b.bookingId, eventId: b.eventId })}
                            >
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              className="rounded-2 fw-medium"
                              disabled={actionLoading}
                              onClick={() => setConfirmCancelId(b.bookingId)}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </Container>

      <ConfirmModal
        show={!!confirmApproveId}
        title="Confirm Booking"
        message="Approve this booking request? The organizer will be notified."
        confirmLabel="Approve"
        variant="primary"
        loading={actionLoading}
        onConfirm={handleConfirmApprove}
        onCancel={() => setConfirmApproveId(null)}
      />

      <ConfirmModal
        show={!!confirmCancelId}
        title="Cancel Booking"
        message="Cancel this booking request? This action cannot be undone."
        confirmLabel="Cancel Booking"
        variant="danger"
        loading={actionLoading}
        onConfirm={handleConfirmCancel}
        onCancel={() => setConfirmCancelId(null)}
      />
    </div>
  )
}
