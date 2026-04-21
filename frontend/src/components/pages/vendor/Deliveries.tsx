import { useEffect, useState } from 'react'
import { Modal, Button, Form, Spinner } from 'react-bootstrap'
import { TableRowsSkeleton } from '../../elements/skeletons/PageSkeleton'
import { toast } from 'react-toastify'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
  fetchAllDeliveries,
  createDelivery,
  updateDelivery,
  updateDeliveryStatus,
  deleteDelivery,
} from '../../../store/slices/vendor/vendorSlice'
import type { DeliveryResponseDto, DeliveryRequestDto, DeliveryStatus } from '../../../types/vendor'
import styles from '../../../css/vendor/Vendor.module.css'

const STATUSES: DeliveryStatus[] = ['SCHEDULED', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'CANCELLED']

const statusBadgeClass = (s: DeliveryStatus) => {
  if (s === 'SCHEDULED')  return styles.badgePurple
  if (s === 'IN_TRANSIT') return styles.badgeYellow
  if (s === 'DELIVERED')  return styles.badgeGreen
  if (s === 'FAILED')     return styles.badgeRed
  if (s === 'CANCELLED')  return styles.badgeGray
  return styles.badgeGray
}

const toDatetimeLocal = (iso: string) => iso ? iso.slice(0, 16) : ''

const EMPTY_FORM: DeliveryRequestDto = {
  invoiceId: '', item: '', quantity: 1,
  deliveryDate: '', status: 'SCHEDULED', trackingNumber: '',
}

export const Deliveries = () => {
  const dispatch = useAppDispatch()
  const { deliveries, deliveriesLoading, deliveriesError } = useAppSelector((s) => s.vendor)

  const [filter, setFilter]         = useState<DeliveryStatus | 'ALL'>('ALL')
  const [showModal, setShowModal]   = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [editing, setEditing]       = useState<DeliveryResponseDto | null>(null)
  const [target, setTarget]         = useState<DeliveryResponseDto | null>(null)
  const [form, setForm]             = useState<DeliveryRequestDto>(EMPTY_FORM)
  const [saving, setSaving]         = useState(false)

  useEffect(() => { dispatch(fetchAllDeliveries()) }, [dispatch])

  const filtered = filter === 'ALL' ? deliveries : deliveries.filter(d => d.status === filter)

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
  const openDelete = (d: DeliveryResponseDto) => { setTarget(d); setShowDelete(true) }

  const handleSave = async () => {
    if (!form.invoiceId.trim() || !form.item.trim() || !form.deliveryDate || !form.trackingNumber.trim()) {
      toast.error('All fields are required.')
      return
    }
    setSaving(true)
    try {
      const payload = { ...form, deliveryDate: new Date(form.deliveryDate).toISOString() }
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

  const handleStatusChange = async (deliveryId: string, status: DeliveryStatus) => {
    try {
      await dispatch(updateDeliveryStatus({ deliveryId, status })).unwrap()
      toast.success('Status updated.')
    } catch {
      toast.error('Status update failed.')
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
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.pageTitle}>Deliveries</div>
          <div className={styles.pageSubtitle}>Log and track goods & equipment deliveries</div>
        </div>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={openCreate}>
          + Log Delivery
        </button>
      </div>

      {deliveriesError && (
        <div className={styles.errorBanner}>
          <span>{deliveriesError}</span>
          <button onClick={() => dispatch(fetchAllDeliveries())} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Retry</button>
        </div>
      )}

      <div className={styles.filterRow}>
        {(['ALL', ...STATUSES] as const).map(s => (
          <button
            key={s}
            className={`${styles.filterChip} ${filter === s ? styles.filterChipActive : ''}`}
            onClick={() => setFilter(s)}
          >
            {s === 'ALL' ? 'All' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Delivery ID</th>
              <th>Item</th>
              <th>Qty</th>
              <th>Tracking #</th>
              <th>Delivery Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {deliveriesLoading ? <TableRowsSkeleton rows={5} cols={7} /> : filtered.length === 0 ? (
              <tr><td colSpan={7} className={styles.emptyCell}>No deliveries found.</td></tr>
            ) : filtered.map(d => (
                <tr key={d.deliveryId}>
                  <td><span className={styles.idCell}>{d.deliveryId}</span></td>
                  <td><strong>{d.item}</strong></td>
                  <td>{d.quantity}</td>
                  <td><code style={{ fontSize: 11 }}>{d.trackingNumber}</code></td>
                  <td>{new Date(d.deliveryDate).toLocaleDateString()}</td>
                  <td>
                    <select
                      className={styles.statusSelect}
                      value={d.status}
                      onChange={e => handleStatusChange(d.deliveryId, e.target.value as DeliveryStatus)}
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                  </td>
                  <td>
                    <div className={styles.actionRow}>
                      <button className={`${styles.btn} ${styles.btnSmall}`} onClick={() => openEdit(d)}>Edit</button>
                      <button className={`${styles.btn} ${styles.btnDanger} ${styles.btnSmall}`} onClick={() => openDelete(d)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* ── Create / Edit Modal ──────────────────────────────────────────────── */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editing ? 'Edit Delivery' : 'Log Delivery'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className={styles.formLabel}>Invoice ID *</Form.Label>
              <Form.Control
                value={form.invoiceId}
                onChange={e => setForm(p => ({ ...p, invoiceId: e.target.value }))}
                placeholder="Paste the Invoice UUID from your Invoices tab"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className={styles.formLabel}>Item Description *</Form.Label>
              <Form.Control
                value={form.item}
                onChange={e => setForm(p => ({ ...p, item: e.target.value }))}
                placeholder="e.g. Chairs, Sound System"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className={styles.formLabel}>Quantity *</Form.Label>
              <Form.Control
                type="number"
                min={1}
                value={form.quantity}
                onChange={e => setForm(p => ({ ...p, quantity: Number(e.target.value) }))}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className={styles.formLabel}>Tracking Number *</Form.Label>
              <Form.Control
                value={form.trackingNumber}
                onChange={e => setForm(p => ({ ...p, trackingNumber: e.target.value }))}
                placeholder="e.g. TRK-20260420-001"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className={styles.formLabel}>Delivery Date *</Form.Label>
              <Form.Control
                type="datetime-local"
                value={form.deliveryDate}
                onChange={e => setForm(p => ({ ...p, deliveryDate: e.target.value }))}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label className={styles.formLabel}>Status</Form.Label>
              <Form.Select
                value={form.status}
                onChange={e => setForm(p => ({ ...p, status: e.target.value as DeliveryStatus }))}
              >
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? <Spinner animation="border" size="sm" /> : editing ? 'Save Changes' : 'Log Delivery'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Delete Confirm ───────────────────────────────────────────────────── */}
      <Modal show={showDelete} onHide={() => setShowDelete(false)} centered size="sm">
        <Modal.Header closeButton><Modal.Title>Delete Delivery</Modal.Title></Modal.Header>
        <Modal.Body>Delete delivery for <strong>{target?.item}</strong>? This cannot be undone.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDelete(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
