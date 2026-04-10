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
  id: string
  timestamp: string
  actorName: string
  actorRole: string
  action: string
  module: string
  entityId: string
  details: string
}

export interface AuditLogsPageDto {
  content: AuditLogDto[]
  totalElements: number
  totalPages: number
  number: number
}
