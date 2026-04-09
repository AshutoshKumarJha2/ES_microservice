import axiosInstance from '../../api/axiosInstance'
import type { CreateTicketRequest, TicketListResponseDto, TicketResponseDto } from '../../types/events'

export const ticketService = {
  async getByEventId(eventId: string, page = 0, size = 10): Promise<TicketListResponseDto> {
    const { data } = await axiosInstance.get(`/api/v1/event-manager/events/${eventId}/tickets`, {
      params: { page, size },
    })
    return data
  },

  async getById(ticketId: string): Promise<TicketResponseDto> {
    const { data } = await axiosInstance.get(`/api/v1/event-manager/tickets/${ticketId}`)
    return data
  },

  async create(eventId: string, payload: CreateTicketRequest): Promise<void> {
    await axiosInstance.post(`/api/v1/event-manager/events/${eventId}/tickets`, payload)
  },

  async update(ticketId: string, payload: CreateTicketRequest): Promise<TicketResponseDto> {
    const { data } = await axiosInstance.put(`/api/v1/event-manager/tickets/${ticketId}`, payload)
    return data
  },

  async delete(ticketId: string): Promise<void> {
    await axiosInstance.delete(`/api/v1/event-manager/tickets/${ticketId}`)
  },
}
