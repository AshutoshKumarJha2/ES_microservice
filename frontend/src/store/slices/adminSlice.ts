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
  auditLogs: AuditState | null
  loadingUsers: boolean
  loadingLogs: boolean
  loadingMoreLogs: boolean
  error: string | null
}

const initialState: AdminState = {
  allUsers: [],
  auditLogs: null,
  loadingUsers: false,
  loadingLogs: false,
  loadingMoreLogs: false,
  error: null,
}

export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (params: { search?: string; role?: string; status?: string } = {}, { rejectWithValue }) => {
    try {
      return await adminService.searchUsers(params)
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
        state.allUsers = action.payload as UserResponseDto[]
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

      .addCase(fetchAuditLogs.pending, (state, action) => {
        const isFirstPage = (action.meta.arg?.page ?? 0) === 0
        if (isFirstPage) state.loadingLogs = true
        else state.loadingMoreLogs = true
        state.error = null
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        const isFirstPage = (action.meta.arg?.page ?? 0) === 0
        const { audits, totalElements, totalPages, page } = action.payload
        if (isFirstPage) {
          state.auditLogs = { audits, totalElements, totalPages, currentPage: page }
        } else if (state.auditLogs && page === state.auditLogs.currentPage + 1) {
          // Only append sequential pages — drop stale responses from previous filter queries
          state.auditLogs.audits.push(...audits)
          state.auditLogs.currentPage = page
        }
        state.loadingLogs = false
        state.loadingMoreLogs = false
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.loadingLogs = false
        state.loadingMoreLogs = false
        state.error = action.payload as string
      })
  },
})

export const { clearAdminError } = adminSlice.actions
export default adminSlice.reducer
