import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { expenseService } from '../../../services/events/finance/expenseService'
import { budgetService } from '../../../services/events/budgetService'
import { eventService } from '../../../services/events/eventService'

import type {
  FinanceExpenseDto,
  PaymentResponseDto,
  FinanceBudgetDto,
  ExpenseStatus,
  PaymentMethod,
  ProcessPaymentModalState,
} from '../../../types/finance'

/* ── State ──────────────────────────────────────────────────────────────────── */
interface FinanceState {
  expenses: FinanceExpenseDto[]
  expensesLoading: boolean
  expensesError: string | null
  activeStatusFilter: ExpenseStatus

  paymentsByExpenseId: Record<string, PaymentResponseDto>
  transactionRefByExpenseId: Record<string, string>

  budgets: FinanceBudgetDto[]
  budgetsLoading: boolean
  budgetsError: string | null
  budgetSortAsc: boolean

  processPaymentModal: ProcessPaymentModalState
  actionError: string | null
}

const initialState: FinanceState = {
  expenses: [],
  expensesLoading: false,
  expensesError: null,
  activeStatusFilter: 'SUBMITTED',

  paymentsByExpenseId: {},
  transactionRefByExpenseId: {},

  budgets: [],
  budgetsLoading: false,
  budgetsError: null,
  budgetSortAsc: true,

  processPaymentModal: {
    open: false,
    expenseId: null,
    expenseDescription: '',
    expenseAmount: 0,
    selectedMethod: '',
    transactionRef: '',
  },

  actionError: null,
}

/* ── Async Thunks ───────────────────────────────────────────────────────────── */

export const fetchAllExpenses = createAsyncThunk('finance/fetchAllExpenses', async (_, { rejectWithValue }) => {
  try {
    return await expenseService.getAll()
  } catch (err: unknown) {
    return rejectWithValue((err as Error).message)
  }
})

export const approveExpense = createAsyncThunk('finance/approveExpense', async (expenseId: string, { rejectWithValue }) => {
  try {
    return await expenseService.updateStatus(expenseId, 'APPROVED')
  } catch (err: unknown) {
    return rejectWithValue((err as Error).message)
  }
})

export const rejectExpense = createAsyncThunk('finance/rejectExpense', async (expenseId: string, { rejectWithValue }) => {
  try {
    return await expenseService.updateStatus(expenseId, 'REJECTED')
  } catch (err: unknown) {
    return rejectWithValue((err as Error).message)
  }
})

interface ProcessPaymentArgs {
  expenseId: string
  method: PaymentMethod
  amount: number
  transactionRef: string
}

export const processPayment = createAsyncThunk(
  'finance/processPayment',
  async ({ expenseId, method, amount, transactionRef }: ProcessPaymentArgs, { rejectWithValue }) => {
    try {
      const payment = await expenseService.processPayment(expenseId, method, amount)
      return { payment, expenseId, transactionRef }
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message)
    }
  },
)

export const fetchBudgets = createAsyncThunk('finance/fetchBudgets', async (_, { rejectWithValue }) => {
  try {
    const expenses = await expenseService.getAll()
    const uniqueEventIds = [...new Set(expenses.map((e) => e.eventId))]

    const results = await Promise.all(
      uniqueEventIds.map(async (eventId) => {
        const [budget, event] = await Promise.all([
          budgetService.getBudget(eventId).catch(() => null),
          eventService.getById(eventId).catch(() => null),
        ])
        if (!budget) return null
        return {
          ...budget,
          createdAt: '',
          updatedAt: '',
          eventName: event?.eventName ?? eventId,
        } as FinanceBudgetDto
      }),
    )

    return results.filter((b): b is FinanceBudgetDto => b !== null)
  } catch (err: unknown) {
    return rejectWithValue((err as Error).message)
  }
})

/* ── Slice ──────────────────────────────────────────────────────────────────── */

const financeSlice = createSlice({
  name: 'finance',
  initialState,
  reducers: {
    setActiveStatusFilter(state, action: PayloadAction<ExpenseStatus>) {
      state.activeStatusFilter = action.payload
    },
    openProcessPaymentModal(
      state,
      action: PayloadAction<{ expenseId: string; expenseDescription: string; expenseAmount: number }>,
    ) {
      state.processPaymentModal = { open: true, ...action.payload, selectedMethod: '', transactionRef: '' }
      state.actionError = null
    },
    closeProcessPaymentModal(state) {
      state.processPaymentModal = { open: false, expenseId: null, expenseDescription: '', expenseAmount: 0, selectedMethod: '', transactionRef: '' }
    },
    setPaymentMethod(state, action: PayloadAction<string>) {
      state.processPaymentModal.selectedMethod = action.payload
    },
    setTransactionRef(state, action: PayloadAction<string>) {
      state.processPaymentModal.transactionRef = action.payload
    },
    toggleBudgetSort(state) {
      state.budgetSortAsc = !state.budgetSortAsc
    },
    clearActionError(state) {
      state.actionError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllExpenses.pending, (state) => { state.expensesLoading = true; state.expensesError = null })
      .addCase(fetchAllExpenses.fulfilled, (state, action) => { state.expensesLoading = false; state.expenses = action.payload })
      .addCase(fetchAllExpenses.rejected, (state, action) => { state.expensesLoading = false; state.expensesError = action.payload as string })

      .addCase(approveExpense.pending, (state) => { state.actionError = null })
      .addCase(approveExpense.fulfilled, (state, action) => {
        const idx = state.expenses.findIndex((e) => e.expenseId === action.payload.expenseId)
        if (idx !== -1) state.expenses[idx] = action.payload
      })
      .addCase(approveExpense.rejected, (state, action) => { state.actionError = action.payload as string })

      .addCase(rejectExpense.pending, (state) => { state.actionError = null })
      .addCase(rejectExpense.fulfilled, (state, action) => {
        const idx = state.expenses.findIndex((e) => e.expenseId === action.payload.expenseId)
        if (idx !== -1) state.expenses[idx] = action.payload
      })
      .addCase(rejectExpense.rejected, (state, action) => { state.actionError = action.payload as string })

      .addCase(processPayment.pending, (state) => { state.actionError = null })
      .addCase(processPayment.fulfilled, (state, action) => {
        const { payment, expenseId, transactionRef } = action.payload
        state.paymentsByExpenseId[expenseId] = payment
        state.transactionRefByExpenseId[expenseId] = transactionRef
        const idx = state.expenses.findIndex((e) => e.expenseId === expenseId)
        if (idx !== -1) state.expenses[idx].status = 'PAID'
        state.processPaymentModal = { open: false, expenseId: null, expenseDescription: '', expenseAmount: 0, selectedMethod: '', transactionRef: '' }
      })
      .addCase(processPayment.rejected, (state, action) => { state.actionError = action.payload as string })

      .addCase(fetchBudgets.pending, (state) => { state.budgetsLoading = true; state.budgetsError = null })
      .addCase(fetchBudgets.fulfilled, (state, action) => { state.budgetsLoading = false; state.budgets = action.payload })
      .addCase(fetchBudgets.rejected, (state, action) => { state.budgetsLoading = false; state.budgetsError = action.payload as string })
  },
})

export const {
  setActiveStatusFilter,
  openProcessPaymentModal,
  closeProcessPaymentModal,
  setPaymentMethod,
  setTransactionRef,
  toggleBudgetSort,
  clearActionError,
} = financeSlice.actions

export default financeSlice.reducer
