import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { adminService } from '../../services/admin/adminService'
import type { UserResponseDto } from '../../types/events'
import type { AuditLogDto } from '../../types/admin'

interface AuditState {
  audits: AuditLogDto[]
  totalElements: number
  totalPages: number
  currentPage: number
}

interface AdminState {
  allUsers: UserResponseDto[]
  totalUsers: number
  totalUserPages: number
  auditLogs: AuditState | null
  loadingUsers: boolean
  loadingLogs: boolean
  error: string | null
}

const initialState: AdminState = {
  allUsers: [],
  totalUsers: 0,
  totalUserPages: 1,
  auditLogs: null,
  loadingUsers: false,
  loadingLogs: false,
  error: null,
}

export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (params: { search?: string; role?: string; status?: string; page?: number; size?: number } = {}, { rejectWithValue }) => {
    try {
      return await adminService.getUsers(params)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string }
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch users')
    }
  }
)

export const updateUserRole = createAsyncThunk(
  'admin/updateUserRole',
  async ({ userId, role }: { userId: string; role: UserResponseDto['role'] }, { rejectWithValue }) => {
    try {
      return await adminService.updateUserRole(userId, role)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string }
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update role')
    }
  }
)

export const updateUserStatus = createAsyncThunk(
  'admin/updateUserStatus',
  async ({ userId, status }: { userId: string; status: UserResponseDto['status'] }, { rejectWithValue }) => {
    try {
      return await adminService.updateUserStatus(userId, status)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string }
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update status')
    }
  }
)

export const fetchAuditLogs = createAsyncThunk(
  'admin/fetchAuditLogs',
  async (params: Parameters<typeof adminService.getAuditLogs>[0], { rejectWithValue }) => {
    try {
      return await adminService.getAuditLogs(params)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string }
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch audit logs')
    }
  }
)

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => { state.loadingUsers = true; state.error = null })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loadingUsers = false
        state.allUsers = action.payload.content ?? []
        state.totalUsers = action.payload.totalElements ?? 0
        state.totalUserPages = action.payload.totalPages ?? 1
      })
      .addCase(fetchUsers.rejected, (state, action) => { state.loadingUsers = false; state.error = action.payload as string })

      .addCase(updateUserRole.fulfilled, (state, action) => {
        const idx = state.allUsers.findIndex((u) => u.userId === action.payload.userId)
        if (idx !== -1) state.allUsers[idx] = action.payload
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const idx = state.allUsers.findIndex((u) => u.userId === action.payload.userId)
        if (idx !== -1) state.allUsers[idx] = action.payload
      })

      .addCase(fetchAuditLogs.pending, (state) => { state.loadingLogs = true; state.error = null })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        const { audits, totalElements, totalPages, page } = action.payload
        state.auditLogs = { audits, totalElements, totalPages, currentPage: page }
        state.loadingLogs = false
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.loadingLogs = false
        state.error = action.payload as string
      })
  },
})

export const { clearAdminError } = adminSlice.actions
export default adminSlice.reducer
