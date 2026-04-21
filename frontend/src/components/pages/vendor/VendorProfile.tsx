import { useEffect, useState } from 'react'
import { Form, Button, Spinner } from 'react-bootstrap'
import { BlockSkeleton } from '../../elements/skeletons/PageSkeleton'
import { toast } from 'react-toastify'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
  fetchAllVendors,
  createVendor,
  updateVendor,
} from '../../../store/slices/vendor/vendorSlice'
import type { VendorResponseDto, VendorRequestDto, VendorStatus } from '../../../types/vendor'
import styles from '../../../css/vendor/Vendor.module.css'

const STATUSES: VendorStatus[] = ['ACTIVE', 'INACTIVE']

const statusBadgeClass = (s: VendorStatus) => {
  if (s === 'ACTIVE')      return styles.badgeGreen
  if (s === 'INACTIVE')    return styles.badgeGray
  if (s === 'BLACKLISTED') return styles.badgeRed
  return styles.badgeGray
}

export const VendorProfile = () => {
  const dispatch = useAppDispatch()
  const { vendors, vendorsLoading } = useAppSelector((s) => s.vendor)

  // A vendor user sees their own profile — the first (and typically only) vendor record
  const profile: VendorResponseDto | null = vendors[0] ?? null

  const [editing, setEditing]   = useState(false)
  const [registering, setRegistering] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [form, setForm]         = useState<VendorRequestDto>({ name: '', contactInfo: '', status: 'ACTIVE' })

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

  if (vendorsLoading) {
    return <div style={{ padding: 24 }}><BlockSkeleton rows={6} /></div>
  }

  // ── No profile yet — show registration form ────────────────────────────────
  if (!profile || registering) {
    return (
      <div>
        <div className={styles.pageHeader}>
          <div>
            <div className={styles.pageTitle}>Register as Vendor</div>
            <div className={styles.pageSubtitle}>Create your vendor profile to start receiving contracts</div>
          </div>
        </div>

        <div className={styles.card} style={{ padding: 28, maxWidth: 520 }}>
          <Form>
            <Form.Group className="mb-4">
              <Form.Label className={styles.formLabel}>Business / Vendor Name *</Form.Label>
              <Form.Control
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. AV Solutions Pvt. Ltd."
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className={styles.formLabel}>Contact Information *</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={form.contactInfo}
                onChange={e => setForm(p => ({ ...p, contactInfo: e.target.value }))}
                placeholder="Email, phone number, or address"
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className={styles.formLabel}>Initial Status</Form.Label>
              <Form.Select
                value={form.status}
                onChange={e => setForm(p => ({ ...p, status: e.target.value as VendorStatus }))}
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </Form.Select>
            </Form.Group>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="primary" onClick={handleRegister} disabled={saving}>
                {saving ? <Spinner animation="border" size="sm" /> : 'Register Profile'}
              </Button>
              {profile && (
                <Button variant="outline-secondary" onClick={() => setRegistering(false)}>
                  Cancel
                </Button>
              )}
            </div>
          </Form>
        </div>
      </div>
    )
  }

  // ── Profile exists — show details ──────────────────────────────────────────
  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.pageTitle}>My Vendor Profile</div>
          <div className={styles.pageSubtitle}>Your registered vendor details</div>
        </div>
        {!editing && (
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setEditing(true)}>
            Edit Profile
          </button>
        )}
      </div>

      {editing ? (
        <div className={styles.card} style={{ padding: 28, maxWidth: 520 }}>
          <Form>
            <Form.Group className="mb-4">
              <Form.Label className={styles.formLabel}>Business / Vendor Name *</Form.Label>
              <Form.Control
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className={styles.formLabel}>Contact Information *</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={form.contactInfo}
                onChange={e => setForm(p => ({ ...p, contactInfo: e.target.value }))}
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className={styles.formLabel}>Status</Form.Label>
              <Form.Select
                value={form.status}
                onChange={e => setForm(p => ({ ...p, status: e.target.value as VendorStatus }))}
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </Form.Select>
            </Form.Group>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="primary" onClick={handleUpdate} disabled={saving}>
                {saving ? <Spinner animation="border" size="sm" /> : 'Save Changes'}
              </Button>
              <Button variant="outline-secondary" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </Form>
        </div>
      ) : (
        <div className={styles.card} style={{ padding: 28, maxWidth: 520 }}>
          {/* Avatar / header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
              color: '#e8a838', fontSize: 20, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Urbanist, sans-serif', flexShrink: 0,
            }}>
              {profile.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'Urbanist, sans-serif', color: 'var(--text-primary)' }}>
                {profile.name}
              </div>
              <span className={`${styles.badge} ${statusBadgeClass(profile.status)}`}>{profile.status}</span>
            </div>
          </div>

          {/* Details table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Vendor ID',       value: profile.vendorId, mono: true },
              { label: 'Contact Info',    value: profile.contactInfo },
              { label: 'Registered On',   value: new Date(profile.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
              { label: 'Last Updated',    value: new Date(profile.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
            ].map(row => (
              <div key={row.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                paddingBottom: 14, borderBottom: '1px solid var(--border-color)',
                gap: 16,
              }}>
                <span className={styles.formLabel} style={{ margin: 0, flexShrink: 0 }}>{row.label}</span>
                <span style={{
                  fontSize: 12, color: 'var(--text-primary)',
                  fontFamily: row.mono ? 'monospace' : 'Noto Sans, sans-serif',
                  textAlign: 'right', wordBreak: 'break-all',
                }}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
