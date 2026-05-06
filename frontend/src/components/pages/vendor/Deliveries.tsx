import { useEffect, useState, useMemo } from 'react'
import {
  Container, Card, Table, Button, Modal, Form,
  Spinner, Alert, Badge, InputGroup,
} from 'react-bootstrap'
import { PageBanner } from '../../elements/common/PageBanner'
import { Search } from 'react-bootstrap-icons'
import { toast } from 'react-toastify'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
  fetchAllDeliveries,
  fetchAllInvoices,
  createDelivery,
  updateDelivery,
  updateDeliveryStatus,
  deleteDelivery,
} from '../../../store/slices/vendor/vendorSlice'
import { TableRowsSkeleton } from '../../elements/skeletons/PageSkeleton'
import type { DeliveryResponseDto, DeliveryRequestDto, DeliveryStatus } from '../../../types/vendor'

const STATUSES: DeliveryStatus[] = ['SCHEDULED', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'CANCELLED']

const statusBadgeClass = (s: DeliveryStatus): string => {
  if (s === 'SCHEDULED')  return 'es-badge-pending'
  if (s === 'IN_TRANSIT') return 'es-badge-submitted'
  if (s === 'DELIVERED')  return 'es-badge-approved'
  if (s === 'FAILED')     return 'es-badge-suspended'
  if (s === 'CANCELLED')  return 'es-badge-cancelled'
  return 'es-badge-draft'
}

const toDatetimeLocal = (iso: string) => iso ? iso.slice(0, 16) : ''
const toLocalDT = (s: string) => s.length === 16 ? s + ':00' : s

const EMPTY_FORM: DeliveryRequestDto = {
  invoiceId: '', item: '', quantity: 1,
  deliveryDate: '', status: 'SCHEDULED', trackingNumber: '',
}

export const Deliveries = () => {
  const dispatch = useAppDispatch()
  const { deliveries, deliveriesLoading, deliveriesError, invoices } = useAppSelector((s) => s.vendor)
  const { user } = useAppSelector((s) => s.auth)

  // Role gates — mirrors DeliveryController @PreAuthorize rules:
  // POST /deliveries, PATCH /{id}/status, PUT /{id} → VENDOR
  // DELETE /{id} → VENDOR | ADMIN
  const isVendor  = user?.role === 'VENDOR'
  const canDelete = user?.role === 'VENDOR' || user?.role === 'ADMIN'

  const [search, setSearch]         = useState('')
  const [filter, setFilter]         = useState<DeliveryStatus | 'ALL'>('ALL')

  // Create / Edit modal
  const [showModal, setShowModal]   = useState(false)
  const [editing, setEditing]       = useState<DeliveryResponseDto | null>(null)
  const [form, setForm]             = useState<DeliveryRequestDto>(EMPTY_FORM)
  const [saving, setSaving]         = useState(false)

  // Delete modal
  const [showDelete, setShowDelete] = useState(false)
  const [target, setTarget]         = useState<DeliveryResponseDto | null>(null)

  useEffect(() => {
    dispatch(fetchAllDeliveries())
    dispatch(fetchAllInvoices())
  }, [dispatch])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return deliveries.filter(d => {
      const matchStatus = filter === 'ALL' || d.status === filter
      const matchSearch = !q || d.item.toLowerCase().includes(q) || d.trackingNumber.toLowerCase().includes(q)
      return matchStatus && matchSearch
    })
  }, [deliveries, search, filter])

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true) }
  const openEdit   = (d: DeliveryResponseDto) => {
    setEditing(d)
    setForm({
      invoiceId: d.invoiceId,
      item: d.item,
      quantity: d.quantity,
      deliveryDate: toDatetimeLocal(d.deliveryDate),
      status: d.status,
      trackingNumber: d.trackingNumber,
    })
    setShowModal(true)
  }
  const handleStatusChange = (deliveryId: string, status: DeliveryStatus) => {
    dispatch(updateDeliveryStatus({ deliveryId, status }))
  }
  const openDelete = (d: DeliveryResponseDto) => { setTarget(d); setShowDelete(true) }

  const handleSave = async () => {
    if (!form.invoiceId.trim() || !form.item.trim() || !form.deliveryDate || !form.trackingNumber.trim()) {
      toast.error('All fields are required.')
      return
    }
    setSaving(true)
    try {
      const payload = { ...form, deliveryDate: toLocalDT(form.deliveryDate) }
      if (editing) {
        await dispatch(updateDelivery({ deliveryId: editing.deliveryId, payload })).unwrap()
        toast.success('Delivery updated.')
      } else {
        await dispatch(createDelivery(payload)).unwrap()
        toast.success('Delivery logged.')
      }
      setShowModal(false)
    } catch {
      toast.error('Operation failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!target) return
    try {
      await dispatch(deleteDelivery(target.deliveryId)).unwrap()
      toast.success('Delivery deleted.')
      setShowDelete(false)
    } catch {
      toast.error('Delete failed.')
    }
  }

  return (
    <div>
      <PageBanner
        title="Deliveries"
        subtitle="Log and track goods & equipment deliveries"
        actions={
          isVendor
            ? <Button variant="light" size="sm" className="fw-semibold rounded-3" onClick={openCreate}>+ Log Delivery</Button>
            : undefined
        }
      />

      <Container fluid className="px-3 px-md-4 py-4">
        {deliveriesError && (
          <Alert variant="danger" className="py-2 mb-3">
            {deliveriesError}{' '}
            <Button variant="link" size="sm" className="p-0 align-baseline" onClick={() => dispatch(fetchAllDeliveries())}>
              Retry
            </Button>
          </Alert>
        )}

        {/* Search */}
        <InputGroup className="mb-3" style={{ maxWidth: 360 }}>
          <InputGroup.Text className="es-form-control border-end-0 rounded-start-3">
            <Search size={14} style={{ color: 'var(--text-secondary)' }} />
          </InputGroup.Text>
          <Form.Control
            className="es-form-control border-start-0 rounded-end-3"
            placeholder="Search by item or tracking number…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </InputGroup>

        {/* Filter chips */}
        <div className="d-flex flex-wrap gap-2 mb-3">
          {(['ALL', ...STATUSES] as const).map(s => (
            <Button
              key={s}
              size="sm"
              variant={filter === s ? 'primary' : 'outline-secondary'}
              className="rounded-pill"
              onClick={() => setFilter(s)}
            >
              {s === 'ALL' ? 'All' : s.replace('_', ' ')}
            </Button>
          ))}
        </div>

        {/* Deliveries Table */}
        <Card className="es-card border shadow-sm">
          <Card.Body className="p-0">
            <div className="d-flex justify-content-between align-items-center px-3 pt-3 pb-2">
              <span className="small fw-semibold" style={{ color: 'var(--text-primary)' }}>Deliveries</span>
              <span className="small" style={{ color: 'var(--text-muted)' }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
            </div>
            {(!deliveriesLoading && filtered.length === 0) ? (
              <p className="text-center py-4 mb-0" style={{ color: 'var(--text-muted)' }}>No deliveries found.</p>
            ) : (
              <Table hover responsive className="mb-0" style={{ fontSize: '0.88rem' }}>
                <thead style={{ background: 'var(--bg-subtle)' }}>
                  <tr>
                    {['Item', 'Qty', 'Tracking #', 'Delivery Date', 'Status', 'Actions'].map(h => (
                      <th key={h} className="fw-semibold border-0 pb-2 px-3 pt-3" style={{ color: 'var(--text-primary)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {deliveriesLoading ? (
                    <TableRowsSkeleton rows={5} cols={6} />
                  ) : filtered.map(d => (
                    <tr key={d.deliveryId}>
                      <td className="align-middle fw-semibold px-3" style={{ color: 'var(--text-primary)' }}>{d.item}</td>
                      <td className="align-middle px-3" style={{ color: 'var(--text-secondary)' }}>{d.quantity}</td>
                      <td className="align-middle px-3">
                        <code style={{ fontSize: 11 }}>{d.trackingNumber}</code>
                      </td>
                      <td className="align-middle px-3" style={{ color: 'var(--text-secondary)' }}>
                        {new Date(d.deliveryDate).toLocaleDateString()}
                      </td>
                      <td className="align-middle px-3">
                        <Badge className={`${statusBadgeClass(d.status)} border-0`} style={{ fontSize: '0.7rem' }}>
                          {d.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="align-middle px-3">
                        <div className="d-flex gap-1 flex-wrap align-items-center">
                          {isVendor && (
                            <>
                              <Form.Select
                                size="sm"
                                className="es-form-control rounded-2"
                                style={{ width: 'auto' }}
                                value={d.status}
                                onChange={e => handleStatusChange(d.deliveryId, e.target.value as DeliveryStatus)}
                              >
                                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                              </Form.Select>
                              <Button size="sm" variant="outline-secondary" className="rounded-2" onClick={() => openEdit(d)}>
                                Edit
                              </Button>
                            </>
                          )}
                          {canDelete && (
                            <Button size="sm" variant="outline-danger" className="rounded-2" onClick={() => openDelete(d)}>
                              Delete
                            </Button>
                          )}
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

      {/* Create / Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <Modal.Title className="fs-6 fw-semibold" style={{ color: 'var(--text-primary)' }}>
            {editing ? 'Edit Delivery' : 'Log Delivery'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'var(--bg-surface)' }}>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="es-label">Invoice *</Form.Label>
              <Form.Select
                className="es-form-control rounded-3"
                value={form.invoiceId}
                onChange={e => setForm(p => ({ ...p, invoiceId: e.target.value }))}
                disabled={invoices.length === 0}
              >
                <option value="">{invoices.length === 0 ? 'No invoices available' : '— Select invoice —'}</option>
                {invoices.map(i => (
                  <option key={i.invoiceId} value={i.invoiceId}>
                    ${Number(i.totalAmount).toLocaleString()} — Due {new Date(i.dueDate).toLocaleDateString()} ({i.status})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="es-label">Item Description *</Form.Label>
              <Form.Control
                className="es-form-control rounded-3"
                value={form.item}
                onChange={e => setForm(p => ({ ...p, item: e.target.value }))}
                placeholder="e.g. Chairs, Sound System"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="es-label">Quantity *</Form.Label>
              <Form.Control
                className="es-form-control rounded-3"
                type="number"
                min={1}
                value={form.quantity}
                onChange={e => setForm(p => ({ ...p, quantity: Number(e.target.value) }))}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="es-label">Tracking Number *</Form.Label>
              <Form.Control
                className="es-form-control rounded-3"
                value={form.trackingNumber}
                onChange={e => setForm(p => ({ ...p, trackingNumber: e.target.value }))}
                placeholder="e.g. TRK-20260420-001"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="es-label">Delivery Date *</Form.Label>
              <Form.Control
                className="es-form-control rounded-3"
                type="datetime-local"
                value={form.deliveryDate}
                onChange={e => setForm(p => ({ ...p, deliveryDate: e.target.value }))}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label className="es-label">Status</Form.Label>
              <Form.Select
                className="es-form-control rounded-3"
                value={form.status}
                onChange={e => setForm(p => ({ ...p, status: e.target.value as DeliveryStatus }))}
              >
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <Button variant="outline-secondary" size="sm" className="rounded-3" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" size="sm" className="fw-semibold rounded-3" onClick={handleSave} disabled={saving}>
            {saving ? <Spinner animation="border" size="sm" /> : editing ? 'Save Changes' : 'Log Delivery'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal show={showDelete} onHide={() => setShowDelete(false)} centered>
        <Modal.Header closeButton style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <Modal.Title className="fs-6 fw-semibold" style={{ color: 'var(--text-primary)' }}>Delete Delivery</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'var(--bg-surface)' }}>
          <p className="mb-0" style={{ color: 'var(--text-body)' }}>
            Delete delivery for <strong>{target?.item}</strong>? This cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <Button variant="outline-secondary" size="sm" className="rounded-3" onClick={() => setShowDelete(false)}>Cancel</Button>
          <Button variant="danger" size="sm" className="fw-semibold rounded-3" onClick={handleDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
