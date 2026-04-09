import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { analyticsService } from '../../services/events/analyticsService'
import type { EngagementResponseDto, FeedbackResponseDto } from '../../types/events'

interface AnalyticsState {
  engagements: EngagementResponseDto[]
  feedback: FeedbackResponseDto[]
  loading: boolean
  error: string | null
}

const initialState: AnalyticsState = {
  engagements: [],
  feedback: [],
  loading: false,
  error: null,
}

export const fetchEngagements = createAsyncThunk(
  'analytics/fetchEngagements',
  async (eventId: string, { rejectWithValue }) => {
    try {
      return await analyticsService.getEngagementsByEvent(eventId)
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message)
    }
  }
)

export const fetchFeedback = createAsyncThunk(
  'analytics/fetchFeedback',
  async ({ eventId, page = 0, size = 10 }: { eventId: string; page?: number; size?: number }, { rejectWithValue }) => {
    try {
      return await analyticsService.getFeedbackByEvent(eventId, page, size)
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message)
    }
  }
)

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearAnalytics(state) {
      state.engagements = []
      state.feedback = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEngagements.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchEngagements.fulfilled, (state, action) => { state.loading = false; state.engagements = action.payload })
      .addCase(fetchEngagements.rejected, (state, action) => { state.loading = false; state.error = action.payload as string })

      .addCase(fetchFeedback.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchFeedback.fulfilled, (state, action) => {
        state.loading = false
        state.feedback = action.payload.content ?? []
      })
      .addCase(fetchFeedback.rejected, (state, action) => { state.loading = false; state.error = action.payload as string })
  },
})

export const { clearAnalytics } = analyticsSlice.actions
export default analyticsSlice.reducer
