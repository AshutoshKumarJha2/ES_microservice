import { useEffect, useState, useMemo } from 'react'
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
import {
  Container, Row, Col, Card, Table, Button, Modal, Form,
  Spinner, Alert, Badge, InputGroup,
} from 'react-bootstrap'
import { Search } from 'react-bootstrap-icons'
import { TableRowsSkeleton } from '../../elements/skeletons/PageSkeleton'

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

const statusBadgeClass = (status: AvailabilityStatus): string => {
  if (status === 'AVAILABLE')   return 'es-badge-active'
  if (status === 'UNAVAILABLE') return 'es-badge-suspended'
  return 'es-badge-pending'
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

  const [search, setSearch]               = useState('')
  const [filter, setFilter]               = useState<FilterType>('ALL')
  const [showModal, setShowModal]         = useState(false)
  const [editingVenue, setEditingVenue]   = useState<VenueResponseDto | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [form, setForm]                   = useState(emptyForm)
  const [formError, setFormError]         = useState<string | null>(null)

  useEffect(() => { dispatch(fetchAllVenues()) }, [dispatch])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return venues.filter(v => {
      const matchStatus = filter === 'ALL' || v.availabilityStatus === filter
      const matchSearch = !q || v.name.toLowerCase().includes(q) || v.location.toLowerCase().includes(q)
      return matchStatus && matchSearch
    })
  }, [venues, search, filter])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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

  const handleDelete = async () => {
    if (!confirmDeleteId) return
    const result = await dispatch(deleteVenue(confirmDeleteId))
    if (deleteVenue.fulfilled.match(result)) setConfirmDeleteId(null)
  }

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
    <div>
      {/* Banner */}
      <div className="es-banner text-white">
        <Container fluid className="px-3 px-md-4 py-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h1 className="fw-bold fs-3 mb-1">Venues</h1>
            <p className="mb-0 text-white-50 small">Manage venue listings, capacity and availability</p>
          </div>
          <Button variant="light" size="sm" className="fw-semibold rounded-3" onClick={openAddModal}>
            + Add Venue
          </Button>
        </Container>
      </div>

      <Container fluid className="px-3 px-md-4 py-4">
        {(actionError || venuesError) && (
          <Alert variant="danger" className="py-2 mb-3" onClose={() => dispatch(clearActionError())} dismissible>
            {actionError ?? venuesError}
          </Alert>
        )}

        {/* Search */}
        <InputGroup className="mb-3" style={{ maxWidth: 360 }}>
          <InputGroup.Text className="es-form-control border-end-0 rounded-start-3">
            <Search size={14} style={{ color: 'var(--text-secondary)' }} />
          </InputGroup.Text>
          <Form.Control
            className="es-form-control border-start-0 rounded-end-3"
            placeholder="Search by name or location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>

        {/* Filter chips */}
        <div className="d-flex flex-wrap gap-2 mb-3">
          {FILTERS.map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? 'primary' : 'outline-secondary'}
              className="rounded-pill"
              onClick={() => setFilter(f)}
            >
              {FILTER_LABELS[f]} ({counts[f]})
            </Button>
          ))}
        </div>

        {/* Venues Table */}
        <Card className="es-card border shadow-sm">
          <Card.Body className="p-0">
            <div className="d-flex justify-content-between align-items-center px-3 pt-3 pb-2">
              <span className="small fw-semibold" style={{ color: 'var(--text-primary)' }}>Venues</span>
              <span className="small" style={{ color: 'var(--text-muted)' }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
            </div>
            {(!venuesLoading && filtered.length === 0) ? (
              <p className="text-center py-4 mb-0" style={{ color: 'var(--text-muted)' }}>No venues found.</p>
            ) : (
              <Table hover responsive className="mb-0" style={{ fontSize: '0.88rem' }}>
                <thead style={{ background: 'var(--bg-subtle)' }}>
                  <tr>
                    {['Name', 'Location', 'Capacity', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="fw-semibold border-0 pb-2 px-3 pt-3" style={{ color: 'var(--text-primary)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {venuesLoading ? <TableRowsSkeleton rows={5} cols={5} /> : filtered.map((venue) => (
                    <tr key={venue.id}>
                      <td className="align-middle fw-semibold px-3" style={{ color: 'var(--text-primary)' }}>{venue.name}</td>
                      <td className="align-middle px-3" style={{ color: 'var(--text-secondary)' }}>{venue.location}</td>
                      <td className="align-middle px-3" style={{ color: 'var(--text-secondary)' }}>{venue.capacity.toLocaleString()}</td>
                      <td className="align-middle px-3">
                        <Badge
                          className={`${statusBadgeClass(venue.availabilityStatus)} border-0`}
                          style={{ fontSize: '0.7rem' }}
                        >
                          {statusLabel(venue.availabilityStatus)}
                        </Badge>
                      </td>
                      <td className="align-middle px-3">
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <Form.Select
                            size="sm"
                            className="es-form-control rounded-2"
                            style={{ width: 'auto' }}
                            value={venue.availabilityStatus}
                            onChange={(e) => handleStatusChange(venue.id, e.target.value as AvailabilityStatus)}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>{statusLabel(s)}</option>
                            ))}
                          </Form.Select>
                          <Button size="sm" variant="outline-secondary" className="rounded-2"
                            onClick={() => openEditModal(venue)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="outline-danger" className="rounded-2"
                            onClick={() => { dispatch(clearActionError()); setConfirmDeleteId(venue.id) }}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </Container>

      {/* Add / Edit Modal */}
      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <Modal.Title className="fs-6 fw-semibold" style={{ color: 'var(--text-primary)' }}>
            {editingVenue ? 'Edit Venue' : 'Add New Venue'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'var(--bg-surface)' }}>
          {(formError || actionError) && (
            <Alert variant="danger" className="py-2 mb-3" onClose={() => { setFormError(null); dispatch(clearActionError()) }} dismissible>
              {formError ?? actionError}
            </Alert>
          )}
          <Form id="venue-form" onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="es-label">Venue Name</Form.Label>
                  <Form.Control
                    className="es-form-control rounded-3"
                    placeholder="e.g. Grand Ballroom"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="es-label">Location</Form.Label>
                  <Form.Control
                    className="es-form-control rounded-3"
                    placeholder="e.g. 123 Main St, New York"
                    value={form.location}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="es-label">Capacity</Form.Label>
                  <Form.Control
                    className="es-form-control rounded-3"
                    type="number"
                    placeholder="e.g. 500"
                    min={1}
                    value={form.capacity}
                    onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <Button variant="outline-secondary" size="sm" className="rounded-3" onClick={closeModal} disabled={actionLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" className="fw-semibold rounded-3" type="submit" form="venue-form" disabled={actionLoading}>
            {actionLoading ? <><Spinner animation="border" size="sm" className="me-1" />Saving…</> : editingVenue ? 'Save Changes' : 'Add Venue'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal show={!!confirmDeleteId} onHide={() => setConfirmDeleteId(null)} centered>
        <Modal.Header closeButton style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <Modal.Title className="fs-6 fw-semibold" style={{ color: 'var(--text-primary)' }}>Delete Venue</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'var(--bg-surface)' }}>
          {actionError && (
            <Alert variant="danger" className="py-2 mb-3" onClose={() => dispatch(clearActionError())} dismissible>
              {actionError}
            </Alert>
          )}
          <p className="mb-0" style={{ color: 'var(--text-body)' }}>
            Are you sure you want to delete{' '}
            <strong>{venues.find((v) => v.id === confirmDeleteId)?.name}</strong>?
            This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <Button variant="outline-secondary" size="sm" className="rounded-3" onClick={() => setConfirmDeleteId(null)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" className="fw-semibold rounded-3" onClick={handleDelete} disabled={actionLoading}>
            {actionLoading ? <><Spinner animation="border" size="sm" className="me-1" />Deleting…</> : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
