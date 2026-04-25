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
  fetchAllVendors,
  createVendor,
  updateVendor,
  deleteVendor,
} from '../../../store/slices/vendor/vendorSlice'
import type { VendorResponseDto, VendorRequestDto, VendorStatus } from '../../../types/vendor'

const STATUSES: VendorStatus[]        = ['ACTIVE', 'INACTIVE', 'BLACKLISTED']
const VENDOR_STATUSES: VendorStatus[] = ['ACTIVE', 'INACTIVE']

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
  const { user } = useAppSelector((s) => s.auth)

  const isVendor  = user?.role === 'VENDOR'
  // VENDOR or ADMIN can delete — mirrors @PreAuthorize("hasAnyRole('VENDOR','ADMIN')")
  const canDelete = user?.role === 'VENDOR' || user?.role === 'ADMIN'

  // VENDOR role: single registered profile (only one allowed)
  const profile: VendorResponseDto | null = isVendor ? (vendors[0] ?? null) : null

  // Shared form state
  const [form, setForm]     = useState<VendorRequestDto>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  // VENDOR role — profile view state
  const [editingProfile, setEditingProfile]       = useState(false)
  const [showDeleteProfile, setShowDeleteProfile] = useState(false)
  const [deleting, setDeleting]                   = useState(false)

  // Admin table view state
  const [search, setSearch]         = useState('')
  const [filter, setFilter]         = useState<VendorStatus | 'ALL'>('ALL')
  const [showDelete, setShowDelete] = useState(false)
  const [target, setTarget]         = useState<VendorResponseDto | null>(null)

  useEffect(() => { dispatch(fetchAllVendors()) }, [dispatch])

  // Pre-fill edit form when profile loads
  useEffect(() => {
    if (profile) {
      setForm({ name: profile.name, contactInfo: profile.contactInfo, status: profile.status })
    } else if (isVendor) {
      setForm(EMPTY_FORM)
    }
  }, [profile, isVendor])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return vendors.filter(v => {
      const matchStatus = filter === 'ALL' || v.status === filter
      const matchSearch = !q || v.name.toLowerCase().includes(q) || v.contactInfo.toLowerCase().includes(q)
      return matchStatus && matchSearch
    })
  }, [vendors, search, filter])

  // ── VENDOR role handlers ──────────────────────────────────────────────────
  const handleRegister = async () => {
    if (!form.name.trim() || !form.contactInfo.trim()) {
      toast.error('Name and contact info are required.')
      return
    }
    setSaving(true)
    try {
      await dispatch(createVendor(form)).unwrap()
      toast.success('Vendor registered successfully!')
    } catch {
      toast.error('Registration failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateProfile = async () => {
    if (!profile) return
    if (!form.name.trim() || !form.contactInfo.trim()) {
      toast.error('Name and contact info are required.')
      return
    }
    setSaving(true)
    try {
      await dispatch(updateVendor({ vendorId: profile.vendorId, payload: form })).unwrap()
      toast.success('Vendor updated.')
      setEditingProfile(false)
    } catch {
      toast.error('Update failed.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProfile = async () => {
    if (!profile) return
    setDeleting(true)
    try {
      await dispatch(deleteVendor(profile.vendorId)).unwrap()
      toast.success('Vendor deleted.')
      setShowDeleteProfile(false)
    } catch (err: any) {
      if (err.status === 409 || err.statusCode === 409) {
        toast.error('Cannot delete vendor: linked to active contracts. Remove contracts first.')
      } else if (err.status === 404) {
        toast.error('Vendor not found.')
      } else {
        toast.error('Delete failed. Please try again later.')
      }
    } finally {
      setDeleting(false)
    }
  }

  // ── Admin table handlers ──────────────────────────────────────────────────
  const openDelete = (v: VendorResponseDto) => { setTarget(v); setShowDelete(true) }

  const handleDelete = async () => {
    if (!target) return
    setSaving(true)
    try {
      await dispatch(deleteVendor(target.vendorId)).unwrap()
      toast.success('Vendor deleted successfully.')
      setShowDelete(false)
    } catch (err: any) {
      if (err.status === 409) {
        toast.error(`Cannot delete "${target.name}": linked to active contracts. Remove contracts first.`)
      } else if (err.status === 404 || err.statusCode === 404) {
        toast.error('Vendor not found. It may have already been deleted.')
        setShowDelete(false)
      } else {
        toast.error(err.message || 'Delete failed. Please try again later.')
      }
    } finally {
      setSaving(false)
    }
  }

  // ── VENDOR role: single registration / profile view ───────────────────────
  if (isVendor) {
    if (vendorsLoading) {
      return (
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" style={{ color: 'var(--blue)' }} />
        </div>
      )
    }

    // No vendor registered yet — show registration form
    if (!profile) {
      return (
        <div>
          <PageBanner title="Register Vendor" subtitle="Create your vendor profile to start receiving contracts" />
          <Container fluid className="px-3 px-md-4 py-4">
            <Card className="es-card border shadow-sm" style={{ maxWidth: 520 }}>
              <Card.Body className="p-4">
                <Form>
                  <Form.Group className="mb-4">
                    <Form.Label className="es-label">Business / Vendor Name *</Form.Label>
                    <Form.Control
                      className="es-form-control rounded-3"
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. AV Solutions Pvt. Ltd."
                    />
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label className="es-label">Contact Information *</Form.Label>
                    <Form.Control
                      className="es-form-control rounded-3"
                      as="textarea"
                      rows={2}
                      value={form.contactInfo}
                      onChange={e => setForm(p => ({ ...p, contactInfo: e.target.value }))}
                      placeholder="Email, phone number, or address"
                    />
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label className="es-label">Status</Form.Label>
                    <Form.Select
                      className="es-form-control rounded-3"
                      value={form.status}
                      onChange={e => setForm(p => ({ ...p, status: e.target.value as VendorStatus }))}
                    >
                      {VENDOR_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </Form.Select>
                  </Form.Group>
                  <Button variant="primary" size="sm" className="fw-semibold rounded-3" onClick={handleRegister} disabled={saving}>
                    {saving ? <Spinner animation="border" size="sm" /> : 'Register'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Container>
        </div>
      )
    }

    // Vendor registered — show profile card (no option to add another)
    return (
      <div>
        <PageBanner
          title="Vendor"
          subtitle="Your registered vendor profile"
          actions={!editingProfile ? (
            <>
              <Button variant="outline-light" size="sm" className="rounded-3" onClick={() => setShowDeleteProfile(true)}>
                Delete
              </Button>
              <Button variant="light" size="sm" className="fw-semibold rounded-3" onClick={() => setEditingProfile(true)}>
                Edit
              </Button>
            </>
          ) : undefined}
        />

        <Container fluid className="px-3 px-md-4 py-4">
          <Card className="es-card border shadow-sm" style={{ maxWidth: 520 }}>
            <Card.Body className="p-4">
              {editingProfile ? (
                <Form>
                  <Form.Group className="mb-4">
                    <Form.Label className="es-label">Business / Vendor Name *</Form.Label>
                    <Form.Control
                      className="es-form-control rounded-3"
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    />
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label className="es-label">Contact Information *</Form.Label>
                    <Form.Control
                      className="es-form-control rounded-3"
                      as="textarea"
                      rows={2}
                      value={form.contactInfo}
                      onChange={e => setForm(p => ({ ...p, contactInfo: e.target.value }))}
                    />
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label className="es-label">Status</Form.Label>
                    <Form.Select
                      className="es-form-control rounded-3"
                      value={form.status}
                      onChange={e => setForm(p => ({ ...p, status: e.target.value as VendorStatus }))}
                    >
                      {VENDOR_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </Form.Select>
                  </Form.Group>
                  <div className="d-flex gap-2">
                    <Button variant="primary" size="sm" className="fw-semibold rounded-3" onClick={handleUpdateProfile} disabled={saving}>
                      {saving ? <Spinner animation="border" size="sm" /> : 'Save Changes'}
                    </Button>
                    <Button variant="outline-secondary" size="sm" className="rounded-3" onClick={() => setEditingProfile(false)}>
                      Cancel
                    </Button>
                  </div>
                </Form>
              ) : (
                <>
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle fw-bold text-white"
                      style={{ width: 56, height: 56, flexShrink: 0, background: 'var(--blue)', fontSize: 20 }}
                    >
                      {profile.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="fw-bold mb-1" style={{ fontSize: 16, color: 'var(--text-primary)' }}>
                        {profile.name}
                      </div>
                      <Badge className={`${statusBadgeClass(profile.status)} border-0`} style={{ fontSize: '0.7rem' }}>
                        {profile.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="d-flex flex-column gap-3">
                    {[
                      { label: 'Vendor ID',     value: `VEN-${profile.vendorId.slice(0, 8).toUpperCase()}`,   mono: true },
                      { label: 'Contact Info',  value: profile.contactInfo            },
                      { label: 'Registered On', value: new Date(profile.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
                      { label: 'Last Updated',  value: new Date(profile.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
                    ].map(row => (
                      <div
                        key={row.label}
                        className="d-flex justify-content-between align-items-start pb-3"
                        style={{ borderBottom: '1px solid var(--border-color)', gap: 16 }}
                      >
                        <span className="small fw-semibold" style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>
                          {row.label}
                        </span>
                        <span
                          className="small text-end"
                          style={{ color: 'var(--text-primary)', fontFamily: row.mono ? 'monospace' : undefined, wordBreak: 'break-all' }}
                        >
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Container>

        <Modal show={showDeleteProfile} onHide={() => setShowDeleteProfile(false)} centered>
          <Modal.Header closeButton style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
            <Modal.Title className="fs-6 fw-semibold" style={{ color: 'var(--text-primary)' }}>Delete Vendor</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ background: 'var(--bg-surface)' }}>
            <p className="mb-0" style={{ color: 'var(--text-body)' }}>
              Are you sure you want to delete <strong>{profile.name}</strong>? This action cannot be undone.
            </p>
          </Modal.Body>
          <Modal.Footer style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
            <Button variant="outline-secondary" size="sm" className="rounded-3" onClick={() => setShowDeleteProfile(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" className="fw-semibold rounded-3" onClick={handleDeleteProfile} disabled={deleting}>
              {deleting ? <><Spinner animation="border" size="sm" className="me-1" />Deleting…</> : 'Delete'}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }

  // ── Non-VENDOR roles: table view — ADMIN can delete ───────────────────────
  return (
    <div>
      <PageBanner title="Vendors" subtitle="Manage registered vendor profiles" />

      <Container fluid className="px-3 px-md-4 py-4">
        {vendorsError && (
          <Alert variant="danger" className="py-2 mb-3">
            {vendorsError}{' '}
            <Button variant="link" size="sm" className="p-0 align-baseline" onClick={() => dispatch(fetchAllVendors())}>
              Retry
            </Button>
          </Alert>
        )}

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
                    {['Name', 'Contact Info', 'Status', 'Created', 'Actions'].map(h => (
                      <th key={h} className="fw-semibold border-0 pb-2 px-3 pt-3" style={{ color: 'var(--text-primary)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vendorsLoading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4">
                        <Spinner animation="border" size="sm" style={{ color: 'var(--blue)' }} />
                      </td>
                    </tr>
                  ) : filtered.map(v => (
                    <tr key={v.vendorId}>
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
                        {/* VENDOR or ADMIN can delete — @PreAuthorize("hasAnyRole('VENDOR','ADMIN')") */}
                        {canDelete && (
                          <Button size="sm" variant="outline-danger" className="rounded-2" onClick={() => openDelete(v)}>
                            Delete
                          </Button>
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
          <Button variant="danger" size="sm" className="fw-semibold rounded-3" onClick={handleDelete} disabled={saving}>
            {saving ? <Spinner animation="border" size="sm" /> : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
