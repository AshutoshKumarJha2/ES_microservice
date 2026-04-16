import axios from 'axios'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { UserResponseDto, UserRequestDto } from '../../types/events'
import axiosInstance from '../../api/axiosInstance'

interface AuthState {
  user: UserResponseDto | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('accessToken') || !!localStorage.getItem('refreshToken'),
  loading: false,
  error: null,
}

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data: tokens } = await axiosInstance.post(
        '/api/v1/auth-manager/auth/login',
        credentials
      )
      localStorage.setItem('accessToken', tokens.accessToken)
      localStorage.setItem('refreshToken', tokens.refreshToken)
      const { data: user } = await axiosInstance.get('/api/v1/auth-manager/me')
      // console.log({ tokens, user })
      return { tokens, user }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; error?: string } }; message?: string }
      return rejectWithValue(
        error.response?.data?.message || error.response?.data?.error || error.message || 'Login failed'
      )
    }
  }
)

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/api/v1/auth-manager/me')
      return data as UserResponseDto
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string }
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch user'
      )
    }
  }
)

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (payload: UserRequestDto, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState }
      const userId = state.auth.user?.userId
      if (!userId) throw new Error('Not authenticated')
      const { data } = await axiosInstance.put(
        `/api/v1/auth-manager/users/${userId}`,
        payload
      )
      return data as UserResponseDto
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string }
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update profile'
      )
    }
  }
)

export const refreshSession = createAsyncThunk(
  'auth/refreshSession',
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) return rejectWithValue('No refresh token available')
      const { data } = await axios.post(
        'http://localhost:6970/api/v1/auth-manager/auth/refresh',
        {},
        { headers: { Authorization: `Bearer ${refreshToken}` } }
      )
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      return { accessToken: data.accessToken as string, refreshToken: data.refreshToken as string }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string }
      return rejectWithValue(error.response?.data?.message || error.message || 'Session refresh failed')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.isAuthenticated = false
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    },
    clearAuthError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.accessToken = action.payload.tokens.accessToken
        state.refreshToken = action.payload.tokens.refreshToken
        state.user = action.payload.user
        state.isAuthenticated = true
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload
        state.loading = false
        state.error = null
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null
        state.accessToken = null
        localStorage.removeItem('accessToken')
        // Only fully sign out when the refresh token is also gone.
        // If the refresh token still exists, the interceptor will use it on the
        // next request — don't redirect the user yet.
        if (!localStorage.getItem('refreshToken')) {
          state.refreshToken = null
          state.isAuthenticated = false
        }
      })
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken
        state.refreshToken = action.payload.refreshToken
        state.isAuthenticated = true
      })
      .addCase(refreshSession.rejected, (state) => {
        state.user = null
        state.accessToken = null
        state.refreshToken = null
        state.isAuthenticated = false
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
      })
  },
})

export const { logout, clearAuthError } = authSlice.actions
export default authSlice.reducer
