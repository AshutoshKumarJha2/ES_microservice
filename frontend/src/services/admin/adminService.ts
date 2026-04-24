import axiosInstance from '../../api/axiosInstance'
import type { UserResponseDto } from '../../types/events'
import type { UsersPageDto, AuditLogsPageDto } from '../../types/admin'

export const adminService = {
  async getUsers(params?: {
    role?: string
    status?: string
    search?: string
    page?: number
    size?: number
  }): Promise<UsersPageDto> {
    const { data } = await axiosInstance.get('/api/v1/auth-manager/users', { params })
    if (Array.isArray(data)) {
      return { content: data, totalElements: data.length, totalPages: 1, number: 0, size: data.length }
    }
    return data
  },

  async searchUsers(params: { search?: string; role?: string; status?: string }): Promise<UserResponseDto[]> {
    const { data } = await axiosInstance.get('/api/v1/auth-manager/users/search', { params })
    return Array.isArray(data) ? data : (data.content ?? [])
  },

  async updateUserRole(userId: string, role: UserResponseDto['role']): Promise<UserResponseDto> {
    const { data } = await axiosInstance.patch(`/api/v1/auth-manager/users/${userId}/role`, null, { params: { role } })
    return data
  },

  async updateUserStatus(userId: string, status: UserResponseDto['status']): Promise<UserResponseDto> {
    const { data } = await axiosInstance.patch(`/api/v1/auth-manager/users/${userId}/status`, null, { params: { status } })
    return data
  },

  async getAuditLogs(params?: {
    page?: number
    size?: number
  }): Promise<AuditLogsPageDto> {
    const { data } = await axiosInstance.get('/api/v1/log-manager/audits', { params })
    if (Array.isArray(data)) {
      return { audits: data, totalElements: data.length, totalPages: 1, page: 0, size: data.length }
    }
    return data
  },
}
