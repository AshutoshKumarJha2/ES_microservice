import { useState, useEffect } from 'react'
import type { CreateTicketRequest, TicketResponseDto } from '../../../types/events'
import styles from '../../../css/events/EventsPanel.module.css'

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
    <div className={styles['modal-backdrop']} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles['modal-title']}>
          {existing ? 'Edit Ticket' : 'Add Ticket'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className={styles['modal-field']}>
            <label className={styles['modal-label']}>Ticket Type</label>
            <input
              className={styles['modal-input']}
              name="type"
              value={form.type}
              onChange={handleChange}
              placeholder="e.g. General, VIP"
              required
            />
          </div>
          <div className={styles['modal-field']}>
            <label className={styles['modal-label']}>Price (₹)</label>
            <input
              className={styles['modal-input']}
              name="price"
              type="number"
              min={0}
              step={0.01}
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles['modal-field']}>
            <label className={styles['modal-label']}>Status</label>
            <select
              className={styles['modal-select']}
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <div className={styles['modal-footer']}>
            <button type="submit" className={styles['modal-btn-primary']} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" className={styles['modal-btn-cancel']} onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
