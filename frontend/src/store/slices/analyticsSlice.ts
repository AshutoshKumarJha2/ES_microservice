import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { analyticsService } from '../../services/engagement/analyticsService'
import type {
  EngagementResponseDto,
  EventAnalyticsDto,
  FeedbackRequestDto, FeedbackResponseDto,
  RegistrationDto,
  ScheduleResponseDto,
} from '../../types/events'

interface AnalyticsState {
  engagements: EngagementResponseDto[]
  feedback: FeedbackResponseDto[]
  loading: boolean
  error: string | null
  submitLoading: boolean
  submitSuccess: boolean
  submitError: string | null
  myRegistration: RegistrationDto | null
  myRegistrationLoading: boolean
  myRegistrationError: string | null
  eventSummary: EventAnalyticsDto | null
  eventSummaryLoading: boolean
  schedules: ScheduleResponseDto[]
  schedulesLoading: boolean
}

const initialState: AnalyticsState = {
  engagements: [],
  feedback: [],
  loading: false,
  error: null,
  submitLoading: false,
  submitSuccess: false,
  submitError: null,
  myRegistration: null,
  myRegistrationLoading: false,
  myRegistrationError: null,
  eventSummary: null,
  eventSummaryLoading: false,
  schedules: [],
  schedulesLoading: false,
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

export const submitFeedback = createAsyncThunk(
  'analytics/submitFeedback',
  async (payload: FeedbackRequestDto, { rejectWithValue }) => {
    try {
      return await analyticsService.submitFeedback(payload)
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message)
    }
  }
)

export const fetchMyRegistration = createAsyncThunk(
  'analytics/fetchMyRegistration',
  async (eventId: string, { rejectWithValue }) => {
    try {
      return await analyticsService.getMyRegistration(eventId)
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message)
    }
  }
)

export const fetchEventSummary = createAsyncThunk(
  'analytics/fetchEventSummary',
  async (eventId: string, { rejectWithValue }) => {
    try {
      return await analyticsService.getEventSummary(eventId)
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message)
    }
  }
)

export const fetchSchedules = createAsyncThunk(
  'analytics/fetchSchedules',
  async (eventId: string, { rejectWithValue }) => {
    try {
      return await analyticsService.getSchedulesByEvent(eventId)
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
      state.eventSummary = null
      state.schedules = []
    },
    clearSubmitState(state) {
      state.submitLoading = false
      state.submitSuccess = false
      state.submitError = null
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

      .addCase(submitFeedback.pending, (state) => { state.submitLoading = true; state.submitSuccess = false; state.submitError = null })
      .addCase(submitFeedback.fulfilled, (state) => { state.submitLoading = false; state.submitSuccess = true })
      .addCase(submitFeedback.rejected, (state, action) => { state.submitLoading = false; state.submitError = action.payload as string })

      .addCase(fetchMyRegistration.pending, (state) => { state.myRegistrationLoading = true; state.myRegistrationError = null })
      .addCase(fetchMyRegistration.fulfilled, (state, action) => { state.myRegistrationLoading = false; state.myRegistration = action.payload })
      .addCase(fetchMyRegistration.rejected, (state, action) => { state.myRegistrationLoading = false; state.myRegistrationError = action.payload as string })

      .addCase(fetchEventSummary.pending, (state) => { state.eventSummaryLoading = true })
      .addCase(fetchEventSummary.fulfilled, (state, action) => { state.eventSummaryLoading = false; state.eventSummary = action.payload })
      .addCase(fetchEventSummary.rejected, (state) => { state.eventSummaryLoading = false })

      .addCase(fetchSchedules.pending, (state) => { state.schedulesLoading = true })
      .addCase(fetchSchedules.fulfilled, (state, action) => { state.schedulesLoading = false; state.schedules = action.payload })
      .addCase(fetchSchedules.rejected, (state) => { state.schedulesLoading = false })
  },
})

export const { clearAnalytics, clearSubmitState } = analyticsSlice.actions
export default analyticsSlice.reducer
