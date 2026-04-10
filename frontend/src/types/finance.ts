/* ── Enums — match backend exactly ──────────────────────────────────────────── */
export type ExpenseStatus = 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAID'
export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'CASH' | 'UPI' | 'PAYPAL'
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'

/* ── Response DTOs — match backend ExpenseResponseDto / PaymentResponseDto ─── */
export interface FinanceExpenseDto {
  expenseId: string
  eventId: string
  description: string
  amount: number
  date: string
  approvedBy: string | null
  status: ExpenseStatus
  createdAt: string
  updatedAt: string
}

export interface PaymentResponseDto {
  paymentId: string
  expenseId: string | null
  invoiceId: string | null
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  paymentDate: string
  createdAt: string
  updatedAt: string
}

export interface FinanceBudgetDto {
  budgetId: string
  eventId: string
  plannedAmount: number
  actualAmount: number
  variance: number
  createdAt: string
  updatedAt: string
  eventName: string
}

/* ── Request DTOs ───────────────────────────────────────────────────────────── */
export interface PaymentRequestDto {
  amount: number
  method: PaymentMethod
  paymentDate: string
}

/* ── Modal state ────────────────────────────────────────────────────────────── */
export interface ProcessPaymentModalState {
  open: boolean
  expenseId: string | null
  expenseDescription: string
  expenseAmount: number
  selectedMethod: string
  transactionRef: string
}
