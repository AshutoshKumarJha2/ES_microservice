import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
  fetchAllVenues,
  createVenue,
  updateVenue,
  deleteVenue,
  updateVenueStatus,
  clearActionError,
} from '../../../store/slices/venue/venueSlice'
import type { AvailabilityStatus, VenueResponseDto } from '../../../types/venue'
import styles from '../../../css/venue/Venue.module.css'

/* ── Types ──────────────────────────────────────────────────────────────────── */

type FilterType = 'ALL' | AvailabilityStatus

const FILTERS: FilterType[] = ['ALL', 'AVAILABLE', 'UNAVAILABLE', 'MAINTENENCE']

const FILTER_LABELS: Record<FilterType, string> = {
  ALL: 'All',
  AVAILABLE: 'Available',
  UNAVAILABLE: 'Unavailable',
  MAINTENENCE: 'Maintenance',
}

const STATUS_OPTIONS: AvailabilityStatus[] = ['AVAILABLE', 'UNAVAILABLE', 'MAINTENENCE']

const emptyForm = { name: '', location: '', capacity: '' }

/* ── Helpers ────────────────────────────────────────────────────────────────── */

const statusBadgeClass = (status: AvailabilityStatus) => {
  if (status === 'AVAILABLE')   return styles.badgeGreen
  if (status === 'UNAVAILABLE') return styles.badgeRed
  return styles.badgeYellow
}

const statusLabel = (status: AvailabilityStatus) => {
  if (status === 'MAINTENENCE') return 'Maintenance'
  return status.charAt(0) + status.slice(1).toLowerCase()
}

/* ── Component ──────────────────────────────────────────────────────────────── */

export const Venues = () => {
  const dispatch = useAppDispatch()
  const { venues, venuesLoading, venuesError, actionError, actionLoading } =
    useAppSelector((s) => s.venue)

  const [filter, setFilter]               = useState<FilterType>('ALL')
  const [showModal, setShowModal]         = useState(false)
  const [editingVenue, setEditingVenue]   = useState<VenueResponseDto | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [form, setForm]                   = useState(emptyForm)
  const [formError, setFormError]         = useState<string | null>(null)

  useEffect(() => { dispatch(fetchAllVenues()) }, [dispatch])

  /* ── filtered list ──────────────────────────────────────────────────────── */
  const filtered = filter === 'ALL'
    ? venues
    : venues.filter((v) => v.availabilityStatus === filter)

  /* ── modal helpers ──────────────────────────────────────────────────────── */
  const openAddModal = () => {
    setEditingVenue(null)
    setForm(emptyForm)
    setFormError(null)
    dispatch(clearActionError())
    setShowModal(true)
  }

  const openEditModal = (venue: VenueResponseDto) => {
    setEditingVenue(venue)
    setForm({ name: venue.name, location: venue.location, capacity: String(venue.capacity) })
    setFormError(null)
    dispatch(clearActionError())
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setFormError(null) }

  /* ── form submit ────────────────────────────────────────────────────────── */
  const handleSubmit = async () => {
    const cap = parseInt(form.capacity, 10)
    if (!form.name.trim())     { setFormError('Name is required.'); return }
    if (!form.location.trim()) { setFormError('Location is required.'); return }
    if (!cap || cap < 1)       { setFormError('Capacity must be a positive number.'); return }

    const payload = { name: form.name.trim(), location: form.location.trim(), capacity: cap }

    if (editingVenue) {
      const result = await dispatch(updateVenue({ venueId: editingVenue.id, payload }))
      if (updateVenue.fulfilled.match(result)) closeModal()
    } else {
      const result = await dispatch(createVenue(payload))
      if (createVenue.fulfilled.match(result)) closeModal()
    }
  }

  /* ── delete ─────────────────────────────────────────────────────────────── */
  const handleDelete = async () => {
    if (!confirmDeleteId) return
    const result = await dispatch(deleteVenue(confirmDeleteId))
    if (deleteVenue.fulfilled.match(result)) setConfirmDeleteId(null)
  }

  /* ── status update ──────────────────────────────────────────────────────── */
  const handleStatusChange = (venueId: string, status: AvailabilityStatus) => {
    dispatch(updateVenueStatus({ venueId, status }))
  }

  const counts = {
    ALL: venues.length,
    AVAILABLE:   venues.filter((v) => v.availabilityStatus === 'AVAILABLE').length,
    UNAVAILABLE: venues.filter((v) => v.availabilityStatus === 'UNAVAILABLE').length,
    MAINTENENCE: venues.filter((v) => v.availabilityStatus === 'MAINTENENCE').length,
  }

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Venues</h1>
          <p className={styles.pageSubtitle}>Manage venue listings, capacity and availability</p>
        </div>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={openAddModal}>
          + Add Venue
        </button>
      </div>

      {(actionError || venuesError) && (
        <div className={styles.errorBanner}>
          <span>{actionError ?? venuesError}</span>
          <button className={styles.errorDismiss} onClick={() => dispatch(clearActionError())}>✕</button>
        </div>
      )}

      <div className={styles.filterRow}>
        {FILTERS.map((f) => (
          <div
            key={f}
            className={`${styles.filterChip} ${filter === f ? styles.filterChipActive : ''}`}
            onClick={() => setFilter(f)}
          >
            {FILTER_LABELS[f]} ({counts[f]})
          </div>
        ))}
      </div>

      <div className={`${styles.card} ${styles.cardNoPad}`}>
        {venuesLoading ? (
          <div className={styles.loadingState}>Loading venues…</div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyState}>No venues found.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Location</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((venue) => (
                <tr key={venue.id}>
                  <td style={{ fontWeight: 600 }}>{venue.name}</td>
                  <td>{venue.location}</td>
                  <td>{venue.capacity.toLocaleString()}</td>
                  <td>
                    <span className={`${styles.badge} ${statusBadgeClass(venue.availabilityStatus)}`}>
                      {statusLabel(venue.availabilityStatus)}
                    </span>
                  </td>
                  <td>
                    <div className={styles.btnGroup}>
                      <select
                        className={styles.statusSelect}
                        value={venue.availabilityStatus}
                        onChange={(e) => handleStatusChange(venue.id, e.target.value as AvailabilityStatus)}
                        title="Change status"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{statusLabel(s)}</option>
                        ))}
                      </select>
                      <button
                        className={`${styles.btn} ${styles.btnSm}`}
                        onClick={() => openEditModal(venue)}
                      >
                        Edit
                      </button>
                      <button
                        className={`${styles.btn} ${styles.btnSm} ${styles.btnDanger}`}
                        onClick={() => { dispatch(clearActionError()); setConfirmDeleteId(venue.id) }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Add / Edit Modal ──────────────────────────────────────────────── */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className={styles.modalBox}>
            <div className={styles.modalTitle}>
              {editingVenue ? 'Edit Venue' : 'Add New Venue'}
            </div>

            {(formError || actionError) && (
              <div className={styles.errorBanner} style={{ marginBottom: 12 }}>
                <span>{formError ?? actionError}</span>
                <button className={styles.errorDismiss} onClick={() => { setFormError(null); dispatch(clearActionError()) }}>✕</button>
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Venue Name</label>
              <input
                className={styles.formField}
                placeholder="e.g. Grand Ballroom"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Location</label>
              <input
                className={styles.formField}
                placeholder="e.g. 123 Main St, New York"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Capacity</label>
              <input
                className={styles.formField}
                type="number"
                placeholder="e.g. 500"
                min={1}
                value={form.capacity}
                onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
              />
            </div>

            <div className={styles.btnGroup} style={{ justifyContent: 'flex-end', marginTop: 8 }}>
              <button className={styles.btn} onClick={closeModal} disabled={actionLoading}>Cancel</button>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={handleSubmit}
                disabled={actionLoading}
              >
                {actionLoading ? 'Saving…' : editingVenue ? 'Save Changes' : 'Add Venue'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ──────────────────────────────────────────── */}
      {confirmDeleteId && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setConfirmDeleteId(null)}>
          <div className={styles.modalBox}>
            <div className={styles.modalTitle}>Delete Venue</div>
            <p className={styles.confirmText}>
              Are you sure you want to delete{' '}
              <strong>{venues.find((v) => v.id === confirmDeleteId)?.name}</strong>?
              This action cannot be undone.
            </p>
            {actionError && (
              <div className={styles.errorBanner} style={{ marginBottom: 12 }}>
                <span>{actionError}</span>
                <button className={styles.errorDismiss} onClick={() => dispatch(clearActionError())}>✕</button>
              </div>
            )}
            <div className={styles.btnGroup} style={{ justifyContent: 'flex-end' }}>
              <button className={styles.btn} onClick={() => setConfirmDeleteId(null)} disabled={actionLoading}>Cancel</button>
              <button
                className={`${styles.btn} ${styles.btnDanger}`}
                onClick={handleDelete}
                disabled={actionLoading}
              >
                {actionLoading ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
