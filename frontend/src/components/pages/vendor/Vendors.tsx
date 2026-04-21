import { useEffect, useState } from 'react'
import { Modal, Button, Form, Spinner } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
  fetchAllVendors,
  createVendor,
  updateVendor,
  deleteVendor,
} from '../../../store/slices/vendor/vendorSlice'
import type { VendorResponseDto, VendorRequestDto, VendorStatus } from '../../../types/vendor'
import styles from '../../../css/vendor/Vendor.module.css'
import { TableRowsSkeleton } from '../../elements/skeletons/PageSkeleton'

const STATUSES: VendorStatus[] = ['ACTIVE', 'INACTIVE', 'BLACKLISTED']

const statusBadgeClass = (s: VendorStatus) => {
  if (s === 'ACTIVE')      return styles.badgeGreen
  if (s === 'INACTIVE')    return styles.badgeGray
  if (s === 'BLACKLISTED') return styles.badgeRed
  return styles.badgeGray
}

const EMPTY_FORM: VendorRequestDto = { name: '', contactInfo: '', status: 'ACTIVE' }

export const Vendors = () => {
  const dispatch = useAppDispatch()
  const { vendors, vendorsLoading, vendorsError } = useAppSelector((s) => s.vendor)

  const [filter, setFilter]         = useState<VendorStatus | 'ALL'>('ALL')
  const [showModal, setShowModal]   = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [editing, setEditing]       = useState<VendorResponseDto | null>(null)
  const [target, setTarget]         = useState<VendorResponseDto | null>(null)
  const [form, setForm]             = useState<VendorRequestDto>(EMPTY_FORM)
  const [saving, setSaving]         = useState(false)

  useEffect(() => { dispatch(fetchAllVendors()) }, [dispatch])

  const filtered = filter === 'ALL' ? vendors : vendors.filter(v => v.status === filter)

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true) }
  const openEdit   = (v: VendorResponseDto) => {
    setEditing(v)
    setForm({ name: v.name, contactInfo: v.contactInfo, status: v.status })
    setShowModal(true)
  }
  const openDelete = (v: VendorResponseDto) => { setTarget(v); setShowDelete(true) }

  const handleSave = async () => {
    if (!form.name.trim() || !form.contactInfo.trim()) {
      toast.error('Name and contact info are required.')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await dispatch(updateVendor({ vendorId: editing.vendorId, payload: form })).unwrap()
        toast.success('Vendor updated.')
      } else {
        await dispatch(createVendor(form)).unwrap()
        toast.success('Vendor created.')
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
      await dispatch(deleteVendor(target.vendorId)).unwrap()
      toast.success('Vendor deleted.')
      setShowDelete(false)
    } catch {
      toast.error('Delete failed.')
    }
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.pageTitle}>Vendors</div>
          <div className={styles.pageSubtitle}>Manage registered vendor profiles</div>
        </div>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={openCreate}>
          + Add Vendor
        </button>
      </div>

      {vendorsError && (
        <div className={styles.errorBanner}>
          <span>{vendorsError}</span>
          <button onClick={() => dispatch(fetchAllVendors())} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Retry</button>
        </div>
      )}

      <div className={styles.filterRow}>
        {(['ALL', ...STATUSES] as const).map(s => (
          <button
            key={s}
            className={`${styles.filterChip} ${filter === s ? styles.filterChipActive : ''}`}
            onClick={() => setFilter(s)}
          >
            {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Vendor ID</th>
              <th>Name</th>
              <th>Contact Info</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendorsLoading ? <TableRowsSkeleton rows={8} cols={6} /> : filtered.length === 0 ? (
              <tr><td colSpan={6} className={styles.emptyCell}>No vendors found.</td></tr>
            ) : filtered.map(v => (
                <tr key={v.vendorId}>
                  <td><span className={styles.idCell}>{v.vendorId}</span></td>
                  <td><strong>{v.name}</strong></td>
                  <td>{v.contactInfo}</td>
                  <td><span className={`${styles.badge} ${statusBadgeClass(v.status)}`}>{v.status}</span></td>
                  <td>{new Date(v.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className={styles.actionRow}>
                      <button className={`${styles.btn} ${styles.btnSmall}`} onClick={() => openEdit(v)}>Edit</button>
                      <button className={`${styles.btn} ${styles.btnDanger} ${styles.btnSmall}`} onClick={() => openDelete(v)}>Delete</button>
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
          <Modal.Title>{editing ? 'Edit Vendor' : 'Add Vendor'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className={styles.formLabel}>Name *</Form.Label>
              <Form.Control
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Vendor name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className={styles.formLabel}>Contact Info *</Form.Label>
              <Form.Control
                value={form.contactInfo}
                onChange={e => setForm(p => ({ ...p, contactInfo: e.target.value }))}
                placeholder="Email, phone, or address"
              />
            </Form.Group>
            <Form.Group>
              <Form.Label className={styles.formLabel}>Status *</Form.Label>
              <Form.Select
                value={form.status}
                onChange={e => setForm(p => ({ ...p, status: e.target.value as VendorStatus }))}
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? <Spinner animation="border" size="sm" /> : editing ? 'Save Changes' : 'Create Vendor'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Delete Confirm Modal ─────────────────────────────────────────────── */}
      <Modal show={showDelete} onHide={() => setShowDelete(false)} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title>Delete Vendor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete <strong>{target?.name}</strong>? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDelete(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
