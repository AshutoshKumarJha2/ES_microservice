import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
  closeProcessPaymentModal,
  setPaymentMethod,
  setTransactionRef,
  processPayment,
} from '../../../store/slices/Finance/financeSlice'
import type { PaymentMethod } from '../../../types/finance'
import { Modal, Form, Button, Row, Col } from 'react-bootstrap'

const METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'CREDIT_CARD',   label: 'Credit Card'   },
  { value: 'DEBIT_CARD',    label: 'Debit Card'    },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CASH',          label: 'Cash'          },
  { value: 'UPI',           label: 'UPI'           },
  { value: 'PAYPAL',        label: 'PayPal'        },
]

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n)

export const ProcessPaymentModal = () => {
  const dispatch = useAppDispatch()
  const modal      = useAppSelector((s) => s.finance.processPaymentModal)
  const actionError = useAppSelector((s) => s.finance.actionError)

  const handleSubmit = () => {
    if (!modal.expenseId || !modal.selectedMethod) return
    dispatch(processPayment({
      expenseId: modal.expenseId,
      method: modal.selectedMethod as PaymentMethod,
      amount: modal.expenseAmount,
      transactionRef: modal.transactionRef,
    }))
  }

  return (
    <Modal
      show={modal.open}
      onHide={() => dispatch(closeProcessPaymentModal())}
      centered
    >
      <Modal.Header closeButton style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <Modal.Title className="fs-6 fw-semibold" style={{ color: 'var(--text-primary)' }}>
          Process Payment — {modal.expenseDescription} ({formatCurrency(modal.expenseAmount)})
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ background: 'var(--bg-surface)' }}>
        {actionError && (
          <div className="alert alert-danger py-2 mb-3" style={{ fontSize: '0.85rem' }}>{actionError}</div>
        )}
        <Row className="g-3">
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="es-label">Payment Method</Form.Label>
              <Form.Select
                className="es-form-control"
                value={modal.selectedMethod}
                onChange={(e) => dispatch(setPaymentMethod(e.target.value))}
              >
                <option value="">Select method…</option>
                {METHOD_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="es-label">Transaction Reference</Form.Label>
              <Form.Control
                className="es-form-control"
                type="text"
                placeholder="TXN-XXXXXX"
                value={modal.transactionRef}
                onChange={(e) => dispatch(setTransactionRef(e.target.value))}
              />
            </Form.Group>
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <Button variant="outline-secondary" size="sm" className="rounded-3" onClick={() => dispatch(closeProcessPaymentModal())}>
          Cancel
        </Button>
        <Button
          variant="primary" size="sm" className="rounded-3 fw-semibold"
          onClick={handleSubmit}
          disabled={!modal.selectedMethod}
        >
          Submit Payment
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
