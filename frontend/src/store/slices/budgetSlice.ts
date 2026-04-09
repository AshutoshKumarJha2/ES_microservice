import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { budgetService } from '../../services/events/budgetService'
import type { BudgetResponseDto, ExpenseResponseDto, BudgetRequestDto, ExpenseRequestDto } from '../../types/events'

interface BudgetState {
  budget: BudgetResponseDto | null
  expenses: ExpenseResponseDto[]
  loading: boolean
  error: string | null
}

const initialState: BudgetState = {
  budget: null,
  expenses: [],
  loading: false,
  error: null,
}

export const fetchBudget = createAsyncThunk('budget/fetch', async (eventId: string, { rejectWithValue }) => {
  try {
    return await budgetService.getBudget(eventId)
  } catch (err: unknown) {
    return rejectWithValue((err as Error).message)
  }
})

export const setBudget = createAsyncThunk(
  'budget/set',
  async ({ eventId, payload }: { eventId: string; payload: BudgetRequestDto }, { rejectWithValue }) => {
    try {
      return await budgetService.setBudget(eventId, payload)
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message)
    }
  }
)

export const fetchExpenses = createAsyncThunk(
  'budget/fetchExpenses',
  async ({ eventId, page = 0, size = 10 }: { eventId: string; page?: number; size?: number }, { rejectWithValue }) => {
    try {
      return await budgetService.getExpenses(eventId, page, size)
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message)
    }
  }
)

export const createExpense = createAsyncThunk(
  'budget/createExpense',
  async ({ eventId, payload }: { eventId: string; payload: ExpenseRequestDto }, { rejectWithValue }) => {
    try {
      return await budgetService.createExpense(eventId, payload)
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message)
    }
  }
)

const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
    clearBudget(state) {
      state.budget = null
      state.expenses = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBudget.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchBudget.fulfilled, (state, action) => { state.loading = false; state.budget = action.payload })
      .addCase(fetchBudget.rejected, (state, action) => { state.loading = false; state.error = action.payload as string })

      .addCase(setBudget.fulfilled, (state, action) => { state.budget = action.payload })

      .addCase(fetchExpenses.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false
        state.expenses = action.payload.content ?? []
      })
      .addCase(fetchExpenses.rejected, (state, action) => { state.loading = false; state.error = action.payload as string })

      .addCase(createExpense.fulfilled, (state, action) => {
        state.expenses.unshift(action.payload)
      })
  },
})

export const { clearBudget } = budgetSlice.actions
export default budgetSlice.reducer
