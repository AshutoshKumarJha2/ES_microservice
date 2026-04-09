import { useState, useEffect } from 'react'
import type { CreateTicketRequest, TicketResponseDto } from '../../../types/events'
import styles from '../../../css/events/EventDetail.module.css'

interface Props {
  onClose: () => void
  onSave: (payload: CreateTicketRequest) => Promise<void>
  existing?: TicketResponseDto | null
}

export const TicketModal = ({ onClose, onSave, existing }: Props) => {
  const [form, setForm] = useState<CreateTicketRequest>({
    type: '',
    price: 0,
    status: 'ACTIVE',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (existing) {
      setForm({ type: existing.type, price: existing.price, status: existing.status })
    }
  }, [existing])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: name === 'price' ? Number(value) : value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onSave(form)
    setSaving(false)
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 460,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ fontFamily: 'Urbanist, sans-serif', fontWeight: 700, color: '#0f172a', margin: '0 0 1.25rem' }}>
          {existing ? 'Edit Ticket' : 'Add Ticket'}
        </h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className={styles.field}>
            <label>Ticket Type</label>
            <input name="type" value={form.type} onChange={handleChange} placeholder="e.g. General, VIP" required />
          </div>
          <div className={styles.field}>
            <label>Price (₹)</label>
            <input name="price" type="number" min={0} step={0.01} value={form.price} onChange={handleChange} required />
          </div>
          <div className={styles.field}>
            <label>Status</label>
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 1, fontFamily: 'Urbanist, sans-serif', fontWeight: 600, fontSize: '0.95rem',
                color: '#fff', background: '#1d4ed8', border: 'none', borderRadius: 10,
                padding: '0.65rem', cursor: 'pointer',
              }}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, fontFamily: 'Urbanist, sans-serif', fontWeight: 600, fontSize: '0.95rem',
                color: '#64748b', background: '#f1f5f9', border: 'none', borderRadius: 10,
                padding: '0.65rem', cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
