import type { UserResponseDto } from './events'

export type { UserResponseDto }

export interface UsersPageDto {
  content: UserResponseDto[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface AuditLogDto {
  auditId: string
  userId: string
  action: string
  entityId: string
  entityName: string
  timeStamp: string
}

export interface AuditLogsPageDto {
  audits: AuditLogDto[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}
