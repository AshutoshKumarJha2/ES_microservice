import { useEffect, useState, useMemo } from 'react'
import {
  Container, Card, Table, Button, Modal, Form,
  Spinner, Alert, Badge, InputGroup,
} from 'react-bootstrap'
import { PageBanner } from '../../elements/common/PageBanner'
import { Search } from 'react-bootstrap-icons'
import { TableRowsSkeleton } from '../../elements/skeletons/PageSkeleton'
import { toast } from 'react-toastify'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
  fetchAllVendors,
  createVendor,
  updateVendor,
  deleteVendor,
} from '../../../store/slices/vendor/vendorSlice'
import type { VendorResponseDto, VendorRequestDto, VendorStatus } from '../../../types/vendor'

const STATUSES: VendorStatus[] = ['ACTIVE', 'INACTIVE', 'BLACKLISTED']

const statusBadgeClass = (s: VendorStatus): string => {
  if (s === 'ACTIVE')      return 'es-badge-active'
  if (s === 'INACTIVE')    return 'es-badge-draft'
  if (s === 'BLACKLISTED') return 'es-badge-suspended'
  return 'es-badge-draft'
}

const EMPTY_FORM: VendorRequestDto = { name: '', contactInfo: '', status: 'ACTIVE' }

export const Vendors = () => {
  const dispatch = useAppDispatch()
  const { vendors, vendorsLoading, vendorsError } = useAppSelector((s) => s.vendor)

  const [search, setSearch]         = useState('')
  const [filter, setFilter]         = useState<VendorStatus | 'ALL'>('ALL')
  const [showModal, setShowModal]   = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [editing, setEditing]       = useState<VendorResponseDto | null>(null)
  const [target, setTarget]         = useState<VendorResponseDto | null>(null)
  const [form, setForm]             = useState<VendorRequestDto>(EMPTY_FORM)
  const [saving, setSaving]         = useState(false)

  useEffect(() => { dispatch(fetchAllVendors()) }, [dispatch])
  useEffect(() => {}, [search, filter])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return vendors.filter(v => {
      const matchStatus = filter === 'ALL' || v.status === filter
      const matchSearch = !q || v.name.toLowerCase().includes(q) || v.contactInfo.toLowerCase().includes(q)
      return matchStatus && matchSearch
    })
  }, [vendors, search, filter])

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
      <PageBanner
        title="Vendors"
        subtitle="Manage registered vendor profiles"
        actions={<Button variant="light" size="sm" className="fw-semibold rounded-3" onClick={openCreate}>+ Add Vendor</Button>}
      />

      <Container fluid className="px-3 px-md-4 py-4">
        {vendorsError && (
          <Alert variant="danger" className="py-2 mb-3">
            {vendorsError}{' '}
            <Button variant="link" size="sm" className="p-0 align-baseline" onClick={() => dispatch(fetchAllVendors())}>
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
            placeholder="Search by name or contact…"
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
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>

        {/* Vendors Table */}
        <Card className="es-card border shadow-sm">
          <Card.Body className="p-0">
            <div className="d-flex justify-content-between align-items-center px-3 pt-3 pb-2">
              <span className="small fw-semibold" style={{ color: 'var(--text-primary)' }}>Vendors</span>
              <span className="small" style={{ color: 'var(--text-muted)' }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
            </div>
            {(!vendorsLoading && filtered.length === 0) ? (
              <p className="text-center py-4 mb-0" style={{ color: 'var(--text-muted)' }}>No vendors found.</p>
            ) : (
              <Table hover responsive className="mb-0" style={{ fontSize: '0.88rem' }}>
                <thead style={{ background: 'var(--bg-subtle)' }}>
                  <tr>
                    {['Vendor ID', 'Name', 'Contact Info', 'Status', 'Created', 'Actions'].map(h => (
                      <th key={h} className="fw-semibold border-0 pb-2 px-3 pt-3" style={{ color: 'var(--text-primary)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vendorsLoading ? <TableRowsSkeleton rows={5} cols={6} /> : filtered.map(v => (
                    <tr key={v.vendorId}>
                      <td className="align-middle px-3" style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-secondary)' }}>
                        {v.vendorId.slice(0, 8)}…
                      </td>
                      <td className="align-middle fw-semibold px-3" style={{ color: 'var(--text-primary)' }}>{v.name}</td>
                      <td className="align-middle px-3" style={{ color: 'var(--text-secondary)' }}>{v.contactInfo}</td>
                      <td className="align-middle px-3">
                        <Badge className={`${statusBadgeClass(v.status)} border-0`} style={{ fontSize: '0.7rem' }}>
                          {v.status}
                        </Badge>
                      </td>
                      <td className="align-middle px-3" style={{ color: 'var(--text-secondary)' }}>
                        {new Date(v.createdAt).toLocaleDateString()}
                      </td>
                      <td className="align-middle px-3">
                        <div className="d-flex gap-2">
                          <Button size="sm" variant="outline-secondary" className="rounded-2" onClick={() => openEdit(v)}>Edit</Button>
                          <Button size="sm" variant="outline-danger" className="rounded-2" onClick={() => openDelete(v)}>Delete</Button>
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
            {editing ? 'Edit Vendor' : 'Add Vendor'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'var(--bg-surface)' }}>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="es-label">Name *</Form.Label>
              <Form.Control
                className="es-form-control rounded-3"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Vendor name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="es-label">Contact Info *</Form.Label>
              <Form.Control
                className="es-form-control rounded-3"
                value={form.contactInfo}
                onChange={e => setForm(p => ({ ...p, contactInfo: e.target.value }))}
                placeholder="Email, phone, or address"
              />
            </Form.Group>
            <Form.Group>
              <Form.Label className="es-label">Status *</Form.Label>
              <Form.Select
                className="es-form-control rounded-3"
                value={form.status}
                onChange={e => setForm(p => ({ ...p, status: e.target.value as VendorStatus }))}
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <Button variant="outline-secondary" size="sm" className="rounded-3" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" size="sm" className="fw-semibold rounded-3" onClick={handleSave} disabled={saving}>
            {saving ? <Spinner animation="border" size="sm" /> : editing ? 'Save Changes' : 'Create Vendor'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal show={showDelete} onHide={() => setShowDelete(false)} centered>
        <Modal.Header closeButton style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <Modal.Title className="fs-6 fw-semibold" style={{ color: 'var(--text-primary)' }}>Delete Vendor</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'var(--bg-surface)' }}>
          <p className="mb-0" style={{ color: 'var(--text-body)' }}>
            Are you sure you want to delete <strong>{target?.name}</strong>? This action cannot be undone.
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
