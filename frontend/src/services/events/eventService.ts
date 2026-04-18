import axiosInstance from '../../api/axiosInstance'
import type { EventRequestDto, EventResponseDto, ScheduleRequestDto, ScheduleResponseDto } from '../../types/events'

export const eventService = {
  async getAll(): Promise<EventResponseDto[]> {
    const { data } = await axiosInstance.get('/api/v1/event-manager/events')
    return data
  },

  async getById(id: string): Promise<EventResponseDto> {
    const { data } = await axiosInstance.get(`/api/v1/event-manager/events/${id}`)
    return data
  },

  async create(payload: EventRequestDto): Promise<EventResponseDto> {
    const { data } = await axiosInstance.post('/api/v1/event-manager/events', payload)
    return data
  },

  async update(id: string, payload: EventRequestDto): Promise<EventResponseDto> {
    const { data } = await axiosInstance.put(`/api/v1/event-manager/events/${id}`, payload)
    return data
  },

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/api/v1/event-manager/events/${id}`)
  },

  async getSchedules(eventId: string): Promise<ScheduleResponseDto[]> {
    const { data } = await axiosInstance.get(`/api/v1/event-manager/events/${eventId}/schedules`)
    return data
  },

  async createSchedule(eventId: string, payload: ScheduleRequestDto): Promise<ScheduleResponseDto> {
    const { data } = await axiosInstance.post(`/api/v1/event-manager/events/${eventId}/schedules`, payload)
    return data
  },

  async updateSchedule(eventId: string, scheduleId: string, payload: ScheduleRequestDto): Promise<ScheduleResponseDto> {
    const { data } = await axiosInstance.put(`/api/v1/event-manager/events/${eventId}/schedules/${scheduleId}`, payload)
    return data
  },

  async deleteSchedule(eventId: string, scheduleId: string): Promise<void> {
    await axiosInstance.delete(`/api/v1/event-manager/events/${eventId}/schedules/${scheduleId}`)
  },
}
