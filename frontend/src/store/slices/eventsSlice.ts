import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { eventService } from '../../services/events/eventService'
import type { EventResponseDto, EventRequestDto } from '../../types/events'

function extractMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data
    return data?.message ?? data?.error ?? data?.detail ?? err.message
  }
  return (err as Error).message
}

interface EventsState {
  events: EventResponseDto[]
  selectedEvent: EventResponseDto | null
  loading: boolean
  error: string | null
}

const initialState: EventsState = {
  events: [],
  selectedEvent: null,
  loading: false,
  error: null,
}

export const fetchAllEvents = createAsyncThunk('events/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await eventService.getAll()
  } catch (err: unknown) {
    return rejectWithValue(extractMessage(err))
  }
})

export const fetchEventById = createAsyncThunk('events/fetchById', async (id: string, { rejectWithValue }) => {
  try {
    return await eventService.getById(id)
  } catch (err: unknown) {
    return rejectWithValue(extractMessage(err))
  }
})

export const createEvent = createAsyncThunk('events/create', async (payload: EventRequestDto, { rejectWithValue }) => {
  try {
    return await eventService.create(payload)
  } catch (err: unknown) {
    return rejectWithValue(extractMessage(err))
  }
})

export const updateEvent = createAsyncThunk(
  'events/update',
  async ({ id, payload }: { id: string; payload: EventRequestDto }, { rejectWithValue }) => {
    try {
      return await eventService.update(id, payload)
    } catch (err: unknown) {
      return rejectWithValue(extractMessage(err))
    }
  }
)

export const deleteEvent = createAsyncThunk('events/delete', async (id: string, { rejectWithValue }) => {
  try {
    await eventService.delete(id)
    return id
  } catch (err: unknown) {
    return rejectWithValue(extractMessage(err))
  }
})

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    clearSelectedEvent(state) {
      state.selectedEvent = null
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllEvents.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchAllEvents.fulfilled, (state, action) => { state.loading = false; state.events = action.payload })
      .addCase(fetchAllEvents.rejected, (state, action) => { state.loading = false; state.error = action.payload as string })

      .addCase(fetchEventById.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchEventById.fulfilled, (state, action) => { state.loading = false; state.selectedEvent = action.payload })
      .addCase(fetchEventById.rejected, (state, action) => { state.loading = false; state.error = action.payload as string })

      .addCase(createEvent.pending, (state) => { state.loading = true; state.error = null })
      .addCase(createEvent.fulfilled, (state, action) => { state.loading = false; state.events.push(action.payload) })
      .addCase(createEvent.rejected, (state, action) => { state.loading = false; state.error = action.payload as string })

      .addCase(updateEvent.fulfilled, (state, action) => {
        const idx = state.events.findIndex((e) => e.id === action.payload.id)
        if (idx !== -1) state.events[idx] = action.payload
        state.selectedEvent = action.payload
      })

      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.events = state.events.filter((e) => e.id !== action.payload)
      })
  },
})

export const { clearSelectedEvent, clearError } = eventsSlice.actions
export default eventsSlice.reducer
