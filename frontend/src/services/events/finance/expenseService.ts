import axiosInstance from '../../../api/axiosInstance'
import type { FinanceExpenseDto, PaymentResponseDto, PaymentMethod } from '../../../types/finance'

export const expenseService = {
  /** GET /expenses — all expenses (ADMIN, FINANCE_OFFICER) */
  async getAll(): Promise<FinanceExpenseDto[]> {
    const { data } = await axiosInstance.get('/api/v1/expense-manager/expenses')
    return data
  },

  /** PATCH /expenses/{id}/status?status=APPROVED|REJECTED */
  async updateStatus(expenseId: string, status: 'APPROVED' | 'REJECTED'): Promise<FinanceExpenseDto> {
    const { data } = await axiosInstance.patch(
      `/api/v1/expense-manager/expenses/${expenseId}/status`,
      null,
      { params: { status } },
    )
    return data
  },

  /** POST /expenses/{id}/payment */
  async processPayment(expenseId: string, method: PaymentMethod, amount: number): Promise<PaymentResponseDto> {
    const paymentDate = new Date().toISOString().slice(0, 19)
    const { data } = await axiosInstance.post(
      `/api/v1/expense-manager/expenses/${expenseId}/payment`,
      { amount, method, paymentDate },
    )
    return data
  },
}
