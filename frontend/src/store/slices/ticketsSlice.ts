import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { ticketService } from '../../services/events/ticketService'
import type { TicketResponseDto, CreateTicketRequest } from '../../types/events'

interface TicketsState {
  tickets: TicketResponseDto[]
  totalElements: number
  loading: boolean
  error: string | null
}

const initialState: TicketsState = {
  tickets: [],
  totalElements: 0,
  loading: false,
  error: null,
}

export const fetchTicketsByEvent = createAsyncThunk(
  'tickets/fetchByEvent',
  async ({ eventId, page = 0, size = 10 }: { eventId: string; page?: number; size?: number }, { rejectWithValue }) => {
    try {
      return await ticketService.getByEventId(eventId, page, size)
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message)
    }
  }
)

export const createTicket = createAsyncThunk(
  'tickets/create',
  async ({ eventId, payload }: { eventId: string; payload: CreateTicketRequest }, { rejectWithValue }) => {
    try {
      await ticketService.create(eventId, payload)
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message)
    }
  }
)

export const updateTicket = createAsyncThunk(
  'tickets/update',
  async ({ ticketId, payload }: { ticketId: string; payload: CreateTicketRequest }, { rejectWithValue }) => {
    try {
      return await ticketService.update(ticketId, payload)
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message)
    }
  }
)

export const deleteTicket = createAsyncThunk('tickets/delete', async (ticketId: string, { rejectWithValue }) => {
  try {
    await ticketService.delete(ticketId)
    return ticketId
  } catch (err: unknown) {
    return rejectWithValue((err as Error).message)
  }
})

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    clearTickets(state) {
      state.tickets = []
      state.totalElements = 0
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTicketsByEvent.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchTicketsByEvent.fulfilled, (state, action) => {
        state.loading = false
        state.tickets = action.payload.tickets ?? []
        state.totalElements = action.payload.totalElements ?? 0
      })
      .addCase(fetchTicketsByEvent.rejected, (state, action) => { state.loading = false; state.error = action.payload as string })

      .addCase(updateTicket.fulfilled, (state, action) => {
        if (!action.payload) return
        const idx = state.tickets.findIndex((t) => t.ticketId === action.payload!.ticketId)
        if (idx !== -1) state.tickets[idx] = action.payload
      })

      .addCase(deleteTicket.fulfilled, (state, action) => {
        state.tickets = state.tickets.filter((t) => t.ticketId !== action.payload)
      })
  },
})

export const { clearTickets } = ticketsSlice.actions
export default ticketsSlice.reducer
