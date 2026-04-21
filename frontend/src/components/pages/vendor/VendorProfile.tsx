import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Card, Form, Button, Spinner, Badge, Modal } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
  fetchAllVendors,
  createVendor,
  updateVendor,
  deleteVendor,
} from '../../../store/slices/vendor/vendorSlice'
import type { VendorResponseDto, VendorRequestDto, VendorStatus } from '../../../types/vendor'

const STATUSES: VendorStatus[] = ['ACTIVE', 'INACTIVE']

const statusBadgeClass = (s: VendorStatus): string => {
  if (s === 'ACTIVE')      return 'es-badge-active'
  if (s === 'INACTIVE')    return 'es-badge-draft'
  if (s === 'BLACKLISTED') return 'es-badge-suspended'
  return 'es-badge-draft'
}

export const VendorProfile = () => {
  const dispatch   = useAppDispatch()
  const navigate   = useNavigate()
  const { vendors, vendorsLoading } = useAppSelector((s) => s.vendor)

  // A vendor user sees their own profile — the first (and typically only) vendor record
  const profile: VendorResponseDto | null = vendors[0] ?? null

  const [editing, setEditing]         = useState(false)
  const [registering, setRegistering] = useState(false)
  const [saving, setSaving]           = useState(false)
  const [showDelete, setShowDelete]   = useState(false)
  const [deleting, setDeleting]       = useState(false)
  const [form, setForm]               = useState<VendorRequestDto>({ name: '', contactInfo: '', status: 'ACTIVE' })

  useEffect(() => { dispatch(fetchAllVendors()) }, [dispatch])

  // Pre-fill form when profile loads
  useEffect(() => {
    if (profile) {
      setForm({ name: profile.name, contactInfo: profile.contactInfo, status: profile.status })
    }
  }, [profile])

  const handleRegister = async () => {
    if (!form.name.trim() || !form.contactInfo.trim()) {
      toast.error('Name and contact info are required.')
      return
    }
    setSaving(true)
    try {
      await dispatch(createVendor(form)).unwrap()
      toast.success('Vendor profile created successfully!')
      setRegistering(false)
    } catch {
      toast.error('Registration failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async () => {
    if (!profile) return
    if (!form.name.trim() || !form.contactInfo.trim()) {
      toast.error('Name and contact info are required.')
      return
    }
    setSaving(true)
    try {
      await dispatch(updateVendor({ vendorId: profile.vendorId, payload: form })).unwrap()
      toast.success('Profile updated.')
      setEditing(false)
    } catch {
      toast.error('Update failed.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!profile) return
    setDeleting(true)
    try {
      await dispatch(deleteVendor(profile.vendorId)).unwrap()
      toast.success('Vendor profile deleted.')
      setShowDelete(false)
      navigate('/vendor/dashboard')
    } catch {
      toast.error('Delete failed. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  if (vendorsLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" style={{ color: 'var(--blue)' }} />
      </div>
    )
  }

  // ── No profile yet — show registration form ────────────────────────────────
  if (!profile || registering) {
    return (
      <div>
        <div className="es-banner text-white">
          <Container fluid className="px-3 px-md-4 py-3">
            <h1 className="fw-bold fs-3 mb-1">Register as Vendor</h1>
            <p className="mb-0 text-white-50 small">Create your vendor profile to start receiving contracts</p>
          </Container>
        </div>

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
                  <Form.Label className="es-label">Initial Status</Form.Label>
                  <Form.Select
                    className="es-form-control rounded-3"
                    value={form.status}
                    onChange={e => setForm(p => ({ ...p, status: e.target.value as VendorStatus }))}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </Form.Select>
                </Form.Group>
                <div className="d-flex gap-2">
                  <Button variant="primary" size="sm" className="fw-semibold rounded-3" onClick={handleRegister} disabled={saving}>
                    {saving ? <Spinner animation="border" size="sm" /> : 'Register Profile'}
                  </Button>
                  {profile && (
                    <Button variant="outline-secondary" size="sm" className="rounded-3" onClick={() => setRegistering(false)}>
                      Cancel
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Container>
      </div>
    )
  }

  // ── Profile exists — show details ──────────────────────────────────────────
  return (
    <div>
      <div className="es-banner text-white">
        <Container fluid className="px-3 px-md-4 py-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h1 className="fw-bold fs-3 mb-1">My Vendor Profile</h1>
            <p className="mb-0 text-white-50 small">Your registered vendor details</p>
          </div>
          {!editing && (
            <div className="d-flex gap-2">
              <Button variant="outline-light" size="sm" className="rounded-3" onClick={() => setShowDelete(true)}>
                Delete Profile
              </Button>
              <Button variant="light" size="sm" className="fw-semibold rounded-3" onClick={() => setEditing(true)}>
                Edit Profile
              </Button>
            </div>
          )}
        </Container>
      </div>

      <Container fluid className="px-3 px-md-4 py-4">
        <Card className="es-card border shadow-sm" style={{ maxWidth: 520 }}>
          <Card.Body className="p-4">
            {editing ? (
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
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </Form.Select>
                </Form.Group>
                <div className="d-flex gap-2">
                  <Button variant="primary" size="sm" className="fw-semibold rounded-3" onClick={handleUpdate} disabled={saving}>
                    {saving ? <Spinner animation="border" size="sm" /> : 'Save Changes'}
                  </Button>
                  <Button variant="outline-secondary" size="sm" className="rounded-3" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </Form>
            ) : (
              <>
                {/* Avatar / header */}
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle fw-bold"
                    style={{
                      width: 56, height: 56, flexShrink: 0,
                      background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
                      color: '#e8a838', fontSize: 20,
                    }}
                  >
                    {profile.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="fw-bold mb-1" style={{ fontSize: 16, color: 'var(--text-primary)' }}>
                      {profile.name}
                    </div>
                    <Badge className={`${statusBadgeClass(profile.status)} border-0`} style={{ fontSize: '0.7rem' }}>{profile.status}</Badge>
                  </div>
                </div>

                {/* Details */}
                <div className="d-flex flex-column gap-3">
                  {[
                    { label: 'Vendor ID',     value: profile.vendorId,   mono: true },
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
                        style={{
                          color: 'var(--text-primary)',
                          fontFamily: row.mono ? 'monospace' : undefined,
                          wordBreak: 'break-all',
                        }}
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

      {/* Delete Confirm Modal */}
      <Modal show={showDelete} onHide={() => setShowDelete(false)} centered>
        <Modal.Header closeButton style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <Modal.Title className="fs-6 fw-semibold" style={{ color: 'var(--text-primary)' }}>Delete Vendor Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'var(--bg-surface)' }}>
          <p className="mb-0" style={{ color: 'var(--text-body)' }}>
            Are you sure you want to delete your profile as <strong>{profile?.name}</strong>? This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <Button variant="outline-secondary" size="sm" className="rounded-3" onClick={() => setShowDelete(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" className="fw-semibold rounded-3" onClick={handleDelete} disabled={deleting}>
            {deleting ? <><Spinner animation="border" size="sm" className="me-1" />Deleting…</> : 'Delete Profile'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
