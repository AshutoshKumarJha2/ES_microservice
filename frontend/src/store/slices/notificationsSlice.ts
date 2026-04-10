import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { notificationService } from '../../services/notifications/notificationService'
import type { AppNotification } from '../../types/events'
import type { RootState } from '../store'

interface NotificationsState {
  notifications: AppNotification[]
  loading: boolean
  sending: boolean
  error: string | null
}

const initialState: NotificationsState = {
  notifications: [],
  loading: false,
  sending: false,
  error: null,
}

export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState
      const userId = state.auth.user?.userId
      if (!userId) return []
      return await notificationService.getForUser(userId)
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message)
    }
  }
)

export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await notificationService.markAsRead(notificationId)
      return notificationId
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message)
    }
  }
)

export const sendNotification = createAsyncThunk(
  'notifications/send',
  async (
    payload: { userId: string; message: string; category: string },
    { rejectWithValue }
  ) => {
    try {
      await notificationService.send(payload.userId, payload.message, payload.category)
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message)
    }
  }
)

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    markAllReadLocally(state) {
      state.notifications.forEach((n) => { n.status = 'READ' })
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending,   (state) => { state.loading = true;  state.error = null })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false
        state.notifications = action.payload
      })
      .addCase(fetchNotifications.rejected,  (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const n = state.notifications.find((n) => n.notificationId === action.payload)
        if (n) n.status = 'READ'
      })

      .addCase(sendNotification.pending,   (state) => { state.sending = true;  state.error = null })
      .addCase(sendNotification.fulfilled, (state) => { state.sending = false })
      .addCase(sendNotification.rejected,  (state, action) => {
        state.sending = false
        state.error = action.payload as string
      })
  },
})

export const { markAllReadLocally } = notificationsSlice.actions
export default notificationsSlice.reducer
