import axiosInstance from '../../api/axiosInstance'
import type { BudgetRequestDto, BudgetResponseDto, ExpenseRequestDto, ExpenseResponseDto, PageExpenseResponseDto } from '../../types/events'

export const budgetService = {
  async getBudget(eventId: string): Promise<BudgetResponseDto> {
    const { data } = await axiosInstance.get(`/api/v1/expense-manager/events/${eventId}/budget`)
    return data
  },

  async setBudget(eventId: string, payload: BudgetRequestDto): Promise<BudgetResponseDto> {
    const { data } = await axiosInstance.post(`/api/v1/expense-manager/events/${eventId}/budget`, payload)
    return data
  },

  async getExpenses(eventId: string, page = 0, size = 10): Promise<PageExpenseResponseDto> {
    const { data } = await axiosInstance.get(`/api/v1/expense-manager/events/${eventId}/expenses`, {
      params: { page, size, sort: 'date,desc' },
    })
    return data
  },

  async createExpense(eventId: string, payload: ExpenseRequestDto): Promise<ExpenseResponseDto> {
    const { data } = await axiosInstance.post(`/api/v1/expense-manager/events/${eventId}/expenses`, payload)
    return data
  },

  async deleteExpense(expenseId: string): Promise<void> {
    await axiosInstance.delete(`/api/v1/expense-manager/expenses/${expenseId}`)
  },
}
