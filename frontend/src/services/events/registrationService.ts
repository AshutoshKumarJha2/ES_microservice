import axiosInstance from '../../api/axiosInstance'
import type { RegistrationDto, RegistrationListResponseDto } from '../../types/events'

export const registrationService = {
  async register(eventId: string, ticketId: string): Promise<RegistrationDto> {
    const { data } = await axiosInstance.post(`/api/v1/event-manager/events/${eventId}/registrations`, { ticketId })
    return data
  },

  async getMyRegistrations(page = 0, size = 100): Promise<RegistrationListResponseDto> {
    const { data } = await axiosInstance.get('/api/v1/event-manager/my-registrations', { params: { page, size } })
    return data
  },

  async getMyRegistration(eventId: string): Promise<RegistrationDto> {
    const { data } = await axiosInstance.get(`/api/v1/event-manager/events/${eventId}/my-registration`)
    return data
  },

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
