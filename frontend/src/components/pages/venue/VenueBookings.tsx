import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
  fetchAllVenues,
  fetchBookingsByVenue,
  updateBookingStatus,
  clearActionError,
  clearBookings,
} from '../../../store/slices/venue/venueSlice'
import type { BookingStatus } from '../../../types/venue'
import styles from '../../../css/venue/Venue.module.css'
import { approveRequestedAllocation } from '../../../store/slices/resourceSlice'
import { TableRowsSkeleton } from '../../elements/skeletons/PageSkeleton'

/* ── Helpers ────────────────────────────────────────────────────────────────── */

const bookingBadgeClass = (status: BookingStatus) => {
  if (status === 'CONFIRMED') return styles.badgeGreen
  if (status === 'CANCELLED') return styles.badgeRed
  return styles.badgeYellow
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
    venues, venuesLoading,
    bookings, bookingsLoading, bookingsError,
    actionError, actionLoading,
  } = useAppSelector((s) => s.venue)

  const [selectedVenueId, setSelectedVenueId] = useState<string>('')
  

  /* load venues once on mount */
  useEffect(() => {
    dispatch(fetchAllVenues())
    return () => { dispatch(clearBookings()) }
  }, [dispatch])

  /* fetch bookings whenever venue selection changes */
  useEffect(() => {
    if (selectedVenueId) dispatch(fetchBookingsByVenue(selectedVenueId))
    else dispatch(clearBookings())
  }, [selectedVenueId, dispatch])

  const handleStatusChange = (bookingId: string, status: BookingStatus, eventId?: string) => {
    dispatch(updateBookingStatus({ bookingId, status }));
    if (status === 'CONFIRMED' && eventId) {
      dispatch(approveRequestedAllocation(eventId))
    }
  }

  const selectedVenueName = venues.find((v) => v.id === selectedVenueId)?.name ?? ''

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Bookings</h1>
          <p className={styles.pageSubtitle}>View and manage booking requests for your venues</p>
        </div>
      </div>

      {actionError && (
        <div className={styles.errorBanner}>
          <span>{actionError}</span>
          <button className={styles.errorDismiss} onClick={() => dispatch(clearActionError())}>✕</button>
        </div>
      )}

      {/* ── Venue Selector ─────────────────────────────────────────────────── */}
      <div className={styles.selectorRow}>
        <span className={styles.selectorLabel}>Venue</span>
        {venuesLoading ? (
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Loading venues…</span>
        ) : (
          <select
            className={styles.selectorSelect}
            value={selectedVenueId}
            onChange={(e) => setSelectedVenueId(e.target.value)}
          >
            <option value="">— Select a venue —</option>
            {venues.map((v) => (
              <option key={v.id} value={v.id}>{v.name} ({v.location})</option>
            ))}
          </select>
        )}
      </div>

      {/* ── Bookings Table ─────────────────────────────────────────────────── */}
      {!selectedVenueId ? (
        <div className={`${styles.card} ${styles.cardNoPad}`}>
          <div className={styles.emptyState}>Select a venue above to view its bookings.</div>
        </div>
      ) : bookingsLoading ? (
        <div className={`${styles.card} ${styles.cardNoPad}`}>
          <table className={styles.table}>
            <thead>
              <tr><th>Booking ID</th><th>Event ID</th><th>Date</th><th>Resources</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody><TableRowsSkeleton rows={4} cols={6} /></tbody>
          </table>
        </div>
      ) : bookingsError ? (
        <div className={`${styles.card} ${styles.cardNoPad}`}>
          <div className={styles.loadingState}>{bookingsError}</div>
        </div>
      ) : bookings.length === 0 ? (
        <div className={`${styles.card} ${styles.cardNoPad}`}>
          <div className={styles.emptyState}>No bookings found for {selectedVenueName}.</div>
        </div>
      ) : (
        <div className={`${styles.card} ${styles.cardNoPad}`}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Event ID</th>
                <th>Date</th>
                <th>Resources</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.bookingId}>
                  <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{b.bookingId.slice(0, 8)}…</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{b.eventId.slice(0, 8)}…</td>
                  <td>{formatDate(b.date)}</td>
                  <td>
                    {b.resourceList && b.resourceList.length > 0 ? (
                      b.resourceList.map((r, i) => (
                        <span key={i} className={styles.resourceTag}>
                          {r.resourceName} ×{r.requestedQuantity}
                        </span>
                      ))
                    ) : (
                      <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>—</span>
                    )}
                  </td>
                  <td>
                    <span className={`${styles.badge} ${bookingBadgeClass(b.status)}`}>
                      {b.status.charAt(0) + b.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td>
                    {b.status === 'PENDING' ? (
                      <div className={styles.btnGroup}>
                        <button
                          className={`${styles.btn} ${styles.btnSm} ${styles.btnPrimary}`}
                          disabled={actionLoading}
                          onClick={() => handleStatusChange(b.bookingId, 'CONFIRMED', b.eventId)}
                        >
                          Confirm
                        </button>
                        <button
                          className={`${styles.btn} ${styles.btnSm} ${styles.btnDanger}`}
                          disabled={actionLoading}
                          onClick={() => handleStatusChange(b.bookingId, 'CANCELLED')}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
