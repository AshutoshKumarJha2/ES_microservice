import { useEffect, useState, useMemo } from 'react'
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
import {
  Container, Row, Col, Card, Table, Button, Modal, Form,
  Spinner, Alert, Badge, InputGroup,
} from 'react-bootstrap'
import { Search } from 'react-bootstrap-icons'
import { TableRowsSkeleton } from '../../elements/skeletons/PageSkeleton'

/* ── Helpers ────────────────────────────────────────────────────────────────── */

const availabilityBadgeClass = (a: Availability): string => {
  if (a === 'AVAILABLE')   return 'es-badge-active'
  if (a === 'UNAVAILABLE') return 'es-badge-suspended'
  return 'es-badge-pending'
}

const availabilityLabel = (a: Availability) =>
  a === 'IN_USE' ? 'In Use' : a.charAt(0) + a.slice(1).toLowerCase()

const emptyForm = { name: '', type: 'EQUIPMENT' as ResourceType, costRate: '', unit: '' }

/* ── Component ──────────────────────────────────────────────────────────────── */

export const VenueResources = () => {
  const dispatch = useAppDispatch()
  const {
    venues, venuesLoading,
    resources, resourcesLoading, resourcesError,
    actionError, actionLoading,
  } = useAppSelector((s) => s.venue)

  const [selectedVenueId, setSelectedVenueId] = useState<string>('')
  const [search, setSearch]                   = useState('')
  const [showModal, setShowModal]             = useState(false)
  const [editingResource, setEditingResource] = useState<ResourceResponseDto | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [form, setForm]                       = useState(emptyForm)
  const [formError, setFormError]             = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchAllVenues())
    return () => { dispatch(clearResources()) }
  }, [dispatch])

  useEffect(() => {
    if (selectedVenueId) dispatch(fetchResourcesByVenue(selectedVenueId))
    else dispatch(clearResources())
    setSearch('')
  }, [selectedVenueId, dispatch])

  const filteredResources = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return resources
    return resources.filter(r => r.name.toLowerCase().includes(q))
  }, [resources, search])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const costRate = parseFloat(form.costRate)
    const unit     = parseInt(form.unit, 10)

    if (!form.name.trim())              { setFormError('Name is required.'); return }
    if (isNaN(costRate) || costRate < 0){ setFormError('Cost rate must be a non-negative number.'); return }
    if (!unit || unit < 1)              { setFormError('Unit must be at least 1.'); return }
    if (!selectedVenueId)               { setFormError('No venue selected.'); return }

    const payload = { name: form.name.trim(), type: form.type, costRate, unit }

    if (editingResource) {
      const result = await dispatch(updateResource({ resourceId: editingResource.resourceId, payload }))
      if (updateResource.fulfilled.match(result)) closeModal()
    } else {
      const result = await dispatch(createResource({ venueId: selectedVenueId, payload }))
      if (createResource.fulfilled.match(result)) closeModal()
    }
  }

  const handleDelete = async () => {
    if (!confirmDeleteId) return
    const result = await dispatch(deleteResource(confirmDeleteId))
    if (deleteResource.fulfilled.match(result)) setConfirmDeleteId(null)
  }

  const selectedVenueName = venues.find((v) => v.id === selectedVenueId)?.name ?? ''

  return (
    <div>
      {/* Banner */}
      <div className="es-banner text-white">
        <Container fluid className="px-3 px-md-4 py-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h1 className="fw-bold fs-3 mb-1">Resources</h1>
            <p className="mb-0 text-white-50 small">Manage equipment and staff resources per venue</p>
          </div>
          {selectedVenueId && (
            <Button variant="light" size="sm" className="fw-semibold rounded-3" onClick={openAddModal}>
              + Add Resource
            </Button>
          )}
        </Container>
      </div>

      <Container fluid className="px-3 px-md-4 py-4">
        {actionError && (
          <Alert variant="danger" className="py-2 mb-3" onClose={() => dispatch(clearActionError())} dismissible>
            {actionError}
          </Alert>
        )}

        {/* Venue Selector */}
        <Card className="es-card border shadow-sm mb-3">
          <Card.Body className="p-3 d-flex align-items-center gap-3 flex-wrap">
            <span className="fw-semibold small" style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Select Venue</span>
            {venuesLoading ? (
              <Spinner animation="border" size="sm" style={{ color: 'var(--blue)' }} />
            ) : (
              <Form.Select
                className="es-form-control rounded-3"
                style={{ maxWidth: 360 }}
                value={selectedVenueId}
                onChange={(e) => setSelectedVenueId(e.target.value)}
              >
                <option value="">— Select a venue —</option>
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>{v.name} ({v.location})</option>
                ))}
              </Form.Select>
            )}
          </Card.Body>
        </Card>

        {/* Search (shown only when a venue is selected and has resources) */}
        {selectedVenueId && resources.length > 0 && (
          <InputGroup className="mb-3" style={{ maxWidth: 360 }}>
            <InputGroup.Text className="es-form-control border-end-0 rounded-start-3">
              <Search size={14} style={{ color: 'var(--text-secondary)' }} />
            </InputGroup.Text>
            <Form.Control
              className="es-form-control border-start-0 rounded-end-3"
              placeholder="Search by resource name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        )}

        {/* Resources Table */}
        <Card className="es-card border shadow-sm">
          <Card.Body className="p-0">
            {selectedVenueId && resources.length > 0 && (
              <div className="d-flex justify-content-between align-items-center px-3 pt-3 pb-2">
                <span className="small fw-semibold" style={{ color: 'var(--text-primary)' }}>{selectedVenueName}</span>
                <span className="small" style={{ color: 'var(--text-muted)' }}>
                  {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
            {!selectedVenueId ? (
              <p className="text-center py-4 mb-0" style={{ color: 'var(--text-muted)' }}>
                Select a venue above to view its resources.
              </p>
            ) : resourcesError ? (
              <p className="text-center py-4 mb-0" style={{ color: 'var(--text-muted)' }}>{resourcesError}</p>
            ) : (!resourcesLoading && filteredResources.length === 0) ? (
              <p className="text-center py-4 mb-0" style={{ color: 'var(--text-muted)' }}>
                {resources.length === 0
                  ? `No resources for ${selectedVenueName}. Click "+ Add Resource" to create one.`
                  : 'No resources match your search.'}
              </p>
            ) : (
              <Table hover responsive className="mb-0" style={{ fontSize: '0.88rem' }}>
                <thead style={{ background: 'var(--bg-subtle)' }}>
                  <tr>
                    {['Name', 'Type', 'Cost Rate', 'Units', 'Availability', 'Actions'].map((h) => (
                      <th key={h} className="fw-semibold border-0 pb-2 px-3 pt-3" style={{ color: 'var(--text-primary)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {resourcesLoading ? <TableRowsSkeleton rows={5} cols={6} /> : filteredResources.map((r) => (
                    <tr key={r.resourceId}>
                      <td className="align-middle fw-semibold px-3" style={{ color: 'var(--text-primary)' }}>{r.name}</td>
                      <td className="align-middle px-3">
                        <Badge
                          className={`${r.type === 'EQUIPMENT' ? 'es-badge-finance' : 'es-badge-organizer'} border-0 fw-normal`}
                          style={{ fontSize: '0.7rem' }}
                        >
                          {r.type.charAt(0) + r.type.slice(1).toLowerCase()}
                        </Badge>
                      </td>
                      <td className="align-middle px-3" style={{ color: 'var(--text-secondary)' }}>
                        ${Number(r.costRate).toFixed(2)}/unit
                      </td>
                      <td className="align-middle px-3" style={{ color: 'var(--text-secondary)' }}>{r.unit}</td>
                      <td className="align-middle px-3">
                        <Badge
                          className={`${availabilityBadgeClass(r.availability)} border-0`}
                          style={{ fontSize: '0.7rem' }}
                        >
                          {availabilityLabel(r.availability)}
                        </Badge>
                      </td>
                      <td className="align-middle px-3">
                        <div className="d-flex gap-2">
                          <Button size="sm" variant="outline-secondary" className="rounded-2"
                            onClick={() => openEditModal(r)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="outline-danger" className="rounded-2"
                            onClick={() => { dispatch(clearActionError()); setConfirmDeleteId(r.resourceId) }}>
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
            {editingResource ? `Edit Resource — ${editingResource.name}` : `Add Resource to ${selectedVenueName}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'var(--bg-surface)' }}>
          {(formError || actionError) && (
            <Alert variant="danger" className="py-2 mb-3" onClose={() => { setFormError(null); dispatch(clearActionError()) }} dismissible>
              {formError ?? actionError}
            </Alert>
          )}
          <Form id="resource-form" onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="es-label">Resource Name</Form.Label>
                  <Form.Control
                    className="es-form-control rounded-3"
                    placeholder="e.g. Projector, Sound System"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col xs={12} sm={6}>
                <Form.Group>
                  <Form.Label className="es-label">Type</Form.Label>
                  <Form.Select
                    className="es-form-control rounded-3"
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as ResourceType }))}
                  >
                    <option value="EQUIPMENT">Equipment</option>
                    <option value="STAFF">Staff</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6}>
                <Form.Group>
                  <Form.Label className="es-label">Units Available</Form.Label>
                  <Form.Control
                    className="es-form-control rounded-3"
                    type="number"
                    placeholder="e.g. 10"
                    min={1}
                    value={form.unit}
                    onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="es-label">Cost Rate (per unit)</Form.Label>
                  <Form.Control
                    className="es-form-control rounded-3"
                    type="number"
                    placeholder="e.g. 25.00"
                    min={0}
                    step="0.01"
                    value={form.costRate}
                    onChange={(e) => setForm((f) => ({ ...f, costRate: e.target.value }))}
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
          <Button variant="primary" size="sm" className="fw-semibold rounded-3" type="submit" form="resource-form" disabled={actionLoading}>
            {actionLoading ? <><Spinner animation="border" size="sm" className="me-1" />Saving…</> : editingResource ? 'Save Changes' : 'Add Resource'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal show={!!confirmDeleteId} onHide={() => setConfirmDeleteId(null)} centered>
        <Modal.Header closeButton style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <Modal.Title className="fs-6 fw-semibold" style={{ color: 'var(--text-primary)' }}>Delete Resource</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'var(--bg-surface)' }}>
          {actionError && (
            <Alert variant="danger" className="py-2 mb-3" onClose={() => dispatch(clearActionError())} dismissible>
              {actionError}
            </Alert>
          )}
          <p className="mb-0" style={{ color: 'var(--text-body)' }}>
            Are you sure you want to delete{' '}
            <strong>{resources.find((r) => r.resourceId === confirmDeleteId)?.name}</strong>?
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
