import axiosInstance from '../../api/axiosInstance'
import type { RegistrationListResponseDto } from '../../types/events'

export const registrationService = {
  async getByEventId(
    eventId: string,
    status?: string,
    statuses?: string,
    ticketType?: string,
    attendeeName?: string,
    page = 0,
    size = 10
  ): Promise<RegistrationListResponseDto> {
    const { data } = await axiosInstance.get(`/api/v1/event-manager/events/${eventId}/registrations`, {
      params: { status, statuses, ticketType, attendeeName, page, size },
    })
    return data
  },

  async approve(registrationId: string): Promise<void> {
    await axiosInstance.patch(`/api/v1/event-manager/registrations/${registrationId}/approve`)
  },

  async reject(registrationId: string): Promise<void> {
    await axiosInstance.patch(`/api/v1/event-manager/registrations/${registrationId}/reject`)
  },

  async checkIn(registrationId: string): Promise<void> {
    await axiosInstance.patch(`/api/v1/event-manager/registrations/${registrationId}/check-in`)
  },

  async cancel(registrationId: string): Promise<void> {
    await axiosInstance.patch(`/api/v1/event-manager/registrations/${registrationId}/cancel`)
  },
}
