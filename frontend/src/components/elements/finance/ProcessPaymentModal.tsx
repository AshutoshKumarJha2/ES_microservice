import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
  closeProcessPaymentModal,
  setPaymentMethod,
  setTransactionRef,
  processPayment,
} from '../../../store/slices/Finance/financeSlice'
import type { PaymentMethod } from '../../../types/finance'
import styles from '../../../css/finance/Finance.module.css'

const METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'DEBIT_CARD', label: 'Debit Card' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CASH', label: 'Cash' },
  { value: 'UPI', label: 'UPI' },
  { value: 'PAYPAL', label: 'PayPal' },
]

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n)

export const ProcessPaymentModal = () => {
  const dispatch = useAppDispatch()
  const modal = useAppSelector((s) => s.finance.processPaymentModal)
  const actionError = useAppSelector((s) => s.finance.actionError)

  if (!modal.open) return null

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
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        <h3 className={styles.modalTitle}>
          Process Payment — {modal.expenseDescription} ({formatCurrency(modal.expenseAmount)})
        </h3>

        {actionError && <div className={styles.errorBanner}><span>{actionError}</span></div>}

        <div className={styles.modalGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Payment Method</label>
            <select
              className={styles.formField}
              value={modal.selectedMethod}
              onChange={(e) => dispatch(setPaymentMethod(e.target.value))}
            >
              <option value="">Select method…</option>
              {METHOD_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Transaction Reference</label>
            <input
              className={styles.formField}
              type="text"
              placeholder="TXN-XXXXXX"
              value={modal.transactionRef}
              onChange={(e) => dispatch(setTransactionRef(e.target.value))}
            />
          </div>
        </div>

        <div className={styles.btnGroup}>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={handleSubmit}
            disabled={!modal.selectedMethod}
          >
            Submit Payment
          </button>
          <button className={styles.btn} onClick={() => dispatch(closeProcessPaymentModal())}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
