import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { registrationService } from '../../services/events/registrationService'
import type { RegistrationDto } from '../../types/events'

interface RegistrationsState {
  registrations: RegistrationDto[]
  totalElements: number
  loading: boolean
  actionLoading: string | null
  error: string | null
}

const initialState: RegistrationsState = {
  registrations: [],
  totalElements: 0,
  loading: false,
  actionLoading: null,
  error: null,
}

export const fetchRegistrationsByEvent = createAsyncThunk(
  'registrations/fetchByEvent',
  async (
    { eventId, status, page = 0, size = 10 }: { eventId: string; status?: string; page?: number; size?: number },
    { rejectWithValue }
  ) => {
    try {
      return await registrationService.getByEventId(eventId, status, page, size)
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message)
    }
  }
)

export const approveRegistration = createAsyncThunk(
  'registrations/approve',
  async (registrationId: string, { rejectWithValue }) => {
    try {
      await registrationService.approve(registrationId)
      return registrationId
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message)
    }
  }
)

export const rejectRegistration = createAsyncThunk(
  'registrations/reject',
  async (registrationId: string, { rejectWithValue }) => {
    try {
      await registrationService.reject(registrationId)
      return registrationId
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message)
    }
  }
)

const registrationsSlice = createSlice({
  name: 'registrations',
  initialState,
  reducers: {
    clearRegistrations(state) {
      state.registrations = []
      state.totalElements = 0
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRegistrationsByEvent.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchRegistrationsByEvent.fulfilled, (state, action) => {
        state.loading = false
        state.registrations = action.payload.registrations ?? []
        state.totalElements = action.payload.totalElements ?? 0
      })
      .addCase(fetchRegistrationsByEvent.rejected, (state, action) => { state.loading = false; state.error = action.payload as string })

      .addCase(approveRegistration.pending, (state, action) => { state.actionLoading = action.meta.arg })
      .addCase(approveRegistration.fulfilled, (state, action) => {
        state.actionLoading = null
        const reg = state.registrations.find((r) => r.registrationId === action.payload)
        if (reg) reg.status = 'APPROVED'
      })
      .addCase(approveRegistration.rejected, (state, action) => { state.actionLoading = null; state.error = action.payload as string })

      .addCase(rejectRegistration.pending, (state, action) => { state.actionLoading = action.meta.arg })
      .addCase(rejectRegistration.fulfilled, (state, action) => {
        state.actionLoading = null
        const reg = state.registrations.find((r) => r.registrationId === action.payload)
        if (reg) reg.status = 'REJECTED'
      })
      .addCase(rejectRegistration.rejected, (state, action) => { state.actionLoading = null; state.error = action.payload as string })
  },
})

export const { clearRegistrations } = registrationsSlice.actions
export default registrationsSlice.reducer
