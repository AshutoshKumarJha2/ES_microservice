import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { notificationService } from '../../services/notifications/notificationService'
import type { AppNotification } from '../../types/events'
import type { RootState } from '../store'

interface NotificationsState {
  notifications: AppNotification[]
  hasMore: boolean
  loadingMore: boolean
  loading: boolean
  sending: boolean
  error: string | null
}

const initialState: NotificationsState = {
  notifications: [],
  hasMore: false,
  loadingMore: false,
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
      if (!userId) return { items: [] as AppNotification[], hasMore: false }
      const items = await notificationService.getForUser(userId, 20)
      return { items, hasMore: items.length === 20 }
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message)
    }
  }
)

export const loadMoreNotifications = createAsyncThunk(
  'notifications/loadMore',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState
      const userId = state.auth.user?.userId
      const { notifications } = state.notifications
      if (!userId || notifications.length === 0) return { items: [] as AppNotification[], hasMore: false }
      const lastTimestamp = notifications[notifications.length - 1].createdAt
      const items = await notificationService.getForUser(userId, 20, lastTimestamp)
      return { items, hasMore: items.length === 20 }
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

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { getState, rejectWithValue }) => {
    try {
      const userId = (getState() as RootState).auth.user?.userId
      if (!userId) return
      await notificationService.markAllAsRead(userId)
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
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending,   (state) => { state.loading = true; state.error = null })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false
        state.notifications = action.payload.items
        state.hasMore = action.payload.hasMore
      })
      .addCase(fetchNotifications.rejected,  (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      .addCase(loadMoreNotifications.pending,   (state) => { state.loadingMore = true })
      .addCase(loadMoreNotifications.fulfilled, (state, action) => {
        state.loadingMore = false
        state.notifications.push(...action.payload.items)
        state.hasMore = action.payload.hasMore
      })
      .addCase(loadMoreNotifications.rejected,  (state) => { state.loadingMore = false })

      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const n = state.notifications.find((n) => n.notificationId === action.payload)
        if (n) n.status = 'READ'
      })

      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.notifications.forEach((n) => { n.status = 'READ' })
      })

      .addCase(sendNotification.pending,   (state) => { state.sending = true;  state.error = null })
      .addCase(sendNotification.fulfilled, (state) => { state.sending = false })
      .addCase(sendNotification.rejected,  (state, action) => {
        state.sending = false
        state.error = action.payload as string
      })
  },
})

export default notificationsSlice.reducer
