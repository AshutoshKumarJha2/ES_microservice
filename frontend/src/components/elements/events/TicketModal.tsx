import { useState, useEffect } from 'react'
import type { CreateTicketRequest, TicketResponseDto } from '../../../types/events'
import {
  Modal, Form, Button, Spinner, Row, Col,
} from 'react-bootstrap'

interface Props {
  onClose: () => void
  onSave: (payload: CreateTicketRequest) => Promise<void>
  existing?: TicketResponseDto | null
}

export const TicketModal = ({ onClose, onSave, existing }: Props) => {
  const [form, setForm] = useState<CreateTicketRequest>({ type: '', price: 0, status: 'ACTIVE' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (existing) setForm({ type: existing.type, price: existing.price, status: existing.status })
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
    <Modal show onHide={onClose} centered>
      <Modal.Header closeButton style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <Modal.Title className="fs-6 fw-semibold" style={{ color: 'var(--text-primary)' }}>
          {existing ? 'Edit Ticket' : 'Add Ticket'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ background: 'var(--bg-surface)' }}>
        <Form id="ticket-form" onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col xs={12}>
              <Form.Group>
                <Form.Label className="es-label">Ticket Type</Form.Label>
                <Form.Control
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  placeholder="e.g. General, VIP"
                  required
                  className="es-form-control rounded-3"
                />
              </Form.Group>
            </Col>
            <Col xs={12} sm={6}>
              <Form.Group>
                <Form.Label className="es-label">Price (₹)</Form.Label>
                <Form.Control
                  name="price"
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.price}
                  onChange={handleChange}
                  required
                  className="es-form-control rounded-3"
                />
              </Form.Group>
            </Col>
            <Col xs={12} sm={6}>
              <Form.Group>
                <Form.Label className="es-label">Status</Form.Label>
                <Form.Select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="es-form-control rounded-3"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <Button variant="outline-secondary" size="sm" className="rounded-3" onClick={onClose}>Cancel</Button>
        <Button variant="primary" size="sm" className="rounded-3 fw-semibold" type="submit" form="ticket-form" disabled={saving}>
          {saving ? <><Spinner animation="border" size="sm" className="me-1" />Saving…</> : 'Save'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
