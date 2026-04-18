import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { UserResponseDto, UserRequestDto } from '../../types/events'
import axiosInstance from '../../api/axiosInstance'

interface AuthState {
  user: UserResponseDto | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  loading: boolean
  userLoading: boolean
  error: string | null
}

function loadUser(): UserResponseDto | null {
  try {
    const raw = localStorage.getItem('user')
    return raw ? (JSON.parse(raw) as UserResponseDto) : null
  } catch {
    return null
  }
}

const initialState: AuthState = {
  user: loadUser(),
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  loading: false,
  userLoading: false,
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
      localStorage.removeItem('user')
    },
    setTokens: (state, action: { payload: { accessToken: string; refreshToken: string } }) => {
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.isAuthenticated = true
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
        localStorage.setItem('user', JSON.stringify(action.payload.user))
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.userLoading = true
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.userLoading = false
        state.user = action.payload
        state.isAuthenticated = true
        localStorage.setItem('user', JSON.stringify(action.payload))
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload
        state.loading = false
        state.error = null
        localStorage.setItem('user', JSON.stringify(action.payload))
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
        state.userLoading = false
        if (!state.isAuthenticated) state.user = null
      })
  },
})

export const { logout, setTokens, clearAuthError } = authSlice.actions
export default authSlice.reducer
