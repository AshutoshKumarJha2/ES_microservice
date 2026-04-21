import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
  fetchAllVenues,
  fetchResourcesByVenue,
  createResource,
  updateResource,
  deleteResource,
  clearActionError,
  clearResources,
} from '../../../store/slices/venue/venueSlice'
import type { ResourceResponseDto, ResourceType, Availability } from '../../../types/venue'
import styles from '../../../css/venue/Venue.module.css'
import { TableRowsSkeleton } from '../../elements/skeletons/PageSkeleton'

/* ── Helpers ────────────────────────────────────────────────────────────────── */

const availabilityBadgeClass = (a: Availability) => {
  if (a === 'AVAILABLE')   return styles.badgeGreen
  if (a === 'UNAVAILABLE') return styles.badgeRed
  return styles.badgeYellow
}

const availabilityLabel = (a: Availability) =>
  a === 'IN_USE' ? 'In Use' : a.charAt(0) + a.slice(1).toLowerCase()

const typeBadgeClass = (t: ResourceType) =>
  t === 'EQUIPMENT' ? styles.badgeBlue : styles.badgeGray

const emptyForm = { name: '', type: 'EQUIPMENT' as ResourceType, costRate: '', unit: '' }


export const VenueResources = () => {
  const dispatch = useAppDispatch()
  const {
    venues, venuesLoading,
    resources, resourcesLoading, resourcesError,
    actionError, actionLoading,
  } = useAppSelector((s) => s.venue)

  const [selectedVenueId, setSelectedVenueId]     = useState<string>('')
  const [showModal, setShowModal]                 = useState(false)
  const [editingResource, setEditingResource]     = useState<ResourceResponseDto | null>(null)
  const [confirmDeleteId, setConfirmDeleteId]     = useState<string | null>(null)
  const [form, setForm]                           = useState(emptyForm)
  const [formError, setFormError]                 = useState<string | null>(null)

  /* load venues once on mount */
  useEffect(() => {
    dispatch(fetchAllVenues())
    return () => { dispatch(clearResources()) }
  }, [dispatch])

  /* fetch resources whenever venue selection changes */
  useEffect(() => {
    if (selectedVenueId) dispatch(fetchResourcesByVenue(selectedVenueId))
    else dispatch(clearResources())
  }, [selectedVenueId, dispatch])

  /* ── modal helpers ──────────────────────────────────────────────────────── */
  const openAddModal = () => {
    setEditingResource(null)
    setForm(emptyForm)
    setFormError(null)
    dispatch(clearActionError())
    setShowModal(true)
  }

  const openEditModal = (resource: ResourceResponseDto) => {
    setEditingResource(resource)
    setForm({
      name: resource.name,
      type: resource.type,
      costRate: String(resource.costRate),
      unit: String(resource.unit),
    })
    setFormError(null)
    dispatch(clearActionError())
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setFormError(null) }

  /* ── form submit ────────────────────────────────────────────────────────── */
  const handleSubmit = async () => {
    const costRate = parseFloat(form.costRate)
    const unit     = parseInt(form.unit, 10)

    if (!form.name.trim())       { setFormError('Name is required.'); return }
    if (isNaN(costRate) || costRate < 0) { setFormError('Cost rate must be a non-negative number.'); return }
    if (!unit || unit < 1)       { setFormError('Unit must be at least 1.'); return }
    if (!selectedVenueId)        { setFormError('No venue selected.'); return }

    const payload = { name: form.name.trim(), type: form.type, costRate, unit }

    if (editingResource) {
      const result = await dispatch(updateResource({ resourceId: editingResource.resourceId, payload }))
      if (updateResource.fulfilled.match(result)) closeModal()
    } else {
      const result = await dispatch(createResource({ venueId: selectedVenueId, payload }))
      if (createResource.fulfilled.match(result)) closeModal()
    }
  }

  /* ── delete ─────────────────────────────────────────────────────────────── */
  const handleDelete = async () => {
    if (!confirmDeleteId) return
    const result = await dispatch(deleteResource(confirmDeleteId))
    if (deleteResource.fulfilled.match(result)) setConfirmDeleteId(null)
  }

  const selectedVenueName = venues.find((v) => v.id === selectedVenueId)?.name ?? ''

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Resources</h1>
          <p className={styles.pageSubtitle}>Manage equipment and staff resources per venue</p>
        </div>
        {selectedVenueId && (
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={openAddModal}>
            + Add Resource
          </button>
        )}
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

      {/* ── Resources Table ────────────────────────────────────────────────── */}
      {!selectedVenueId ? (
        <div className={`${styles.card} ${styles.cardNoPad}`}>
          <div className={styles.emptyState}>Select a venue above to view its resources.</div>
        </div>
      ) : resourcesLoading ? (
        <div className={`${styles.card} ${styles.cardNoPad}`}>
          <table className={styles.table}>
            <thead>
              <tr><th>Name</th><th>Type</th><th>Cost Rate</th><th>Units</th><th>Availability</th><th>Actions</th></tr>
            </thead>
            <tbody><TableRowsSkeleton rows={4} cols={6} /></tbody>
          </table>
        </div>
      ) : resourcesError ? (
        <div className={`${styles.card} ${styles.cardNoPad}`}>
          <div className={styles.loadingState}>{resourcesError}</div>
        </div>
      ) : resources.length === 0 ? (
        <div className={`${styles.card} ${styles.cardNoPad}`}>
          <div className={styles.emptyState}>
            No resources for {selectedVenueName}. Click "+ Add Resource" to create one.
          </div>
        </div>
      ) : (
        <div className={`${styles.card} ${styles.cardNoPad}`}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Cost Rate</th>
                <th>Units</th>
                <th>Availability</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((r) => (
                <tr key={r.resourceId}>
                  <td style={{ fontWeight: 600 }}>{r.name}</td>
                  <td>
                    <span className={`${styles.badge} ${typeBadgeClass(r.type)}`}>
                      {r.type.charAt(0) + r.type.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td>${Number(r.costRate).toFixed(2)}/unit</td>
                  <td>{r.unit}</td>
                  <td>
                    <span className={`${styles.badge} ${availabilityBadgeClass(r.availability)}`}>
                      {availabilityLabel(r.availability)}
                    </span>
                  </td>
                  <td>
                    <div className={styles.btnGroup}>
                      <button
                        className={`${styles.btn} ${styles.btnSm}`}
                        onClick={() => openEditModal(r)}
                      >
                        Edit
                      </button>
                      <button
                        className={`${styles.btn} ${styles.btnSm} ${styles.btnDanger}`}
                        onClick={() => { dispatch(clearActionError()); setConfirmDeleteId(r.resourceId) }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Add / Edit Modal ──────────────────────────────────────────────── */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className={styles.modalBox}>
            <div className={styles.modalTitle}>
              {editingResource ? `Edit Resource — ${editingResource.name}` : `Add Resource to ${selectedVenueName}`}
            </div>

            {(formError || actionError) && (
              <div className={styles.errorBanner} style={{ marginBottom: 12 }}>
                <span>{formError ?? actionError}</span>
                <button className={styles.errorDismiss} onClick={() => { setFormError(null); dispatch(clearActionError()) }}>✕</button>
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Resource Name</label>
              <input
                className={styles.formField}
                placeholder="e.g. Projector, Sound System"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className={styles.modalGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Type</label>
                <select
                  className={styles.formField}
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as ResourceType }))}
                >
                  <option value="EQUIPMENT">Equipment</option>
                  <option value="STAFF">Staff</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Units Available</label>
                <input
                  className={styles.formField}
                  type="number"
                  placeholder="e.g. 10"
                  min={1}
                  value={form.unit}
                  onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                />
              </div>

              <div className={`${styles.formGroup} ${styles.modalGridFull}`}>
                <label className={styles.formLabel}>Cost Rate (per unit)</label>
                <input
                  className={styles.formField}
                  type="number"
                  placeholder="e.g. 25.00"
                  min={0}
                  step="0.01"
                  value={form.costRate}
                  onChange={(e) => setForm((f) => ({ ...f, costRate: e.target.value }))}
                />
              </div>
            </div>

            <div className={styles.btnGroup} style={{ justifyContent: 'flex-end', marginTop: 4 }}>
              <button className={styles.btn} onClick={closeModal} disabled={actionLoading}>Cancel</button>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={handleSubmit}
                disabled={actionLoading}
              >
                {actionLoading ? 'Saving…' : editingResource ? 'Save Changes' : 'Add Resource'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ──────────────────────────────────────────── */}
      {confirmDeleteId && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setConfirmDeleteId(null)}>
          <div className={styles.modalBox}>
            <div className={styles.modalTitle}>Delete Resource</div>
            <p className={styles.confirmText}>
              Are you sure you want to delete{' '}
              <strong>{resources.find((r) => r.resourceId === confirmDeleteId)?.name}</strong>?
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
