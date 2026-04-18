import axiosInstance from '../../api/axiosInstance'
import type {
  EngagementRequestDto, EngagementResponseDto,
  EventAnalyticsDto,
  FeedbackRequestDto, FeedbackResponseDto, PageFeedbackResponseDto,
  RegistrationDto, ScheduleResponseDto,
} from '../../types/events'

export const analyticsService = {
  async getEngagementsByEvent(eventId: string): Promise<EngagementResponseDto[]> {
    try {
      const { data } = await axiosInstance.get(`/api/v1/engagement-manager/engagements/event/${eventId}/log`)
      return data
    } catch (err: unknown) {
      // Backend returns 404 when no engagements exist yet — treat as empty list
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 404) return []
      throw err
    }
  },

  async getFeedbackByEvent(eventId: string, page = 0, size = 20): Promise<PageFeedbackResponseDto> {
    const { data } = await axiosInstance.get(`/api/v1/engagement-manager/feedback/event/${eventId}`, {
      params: { page, size },
    })
    return data
  },

  async submitFeedback(payload: FeedbackRequestDto): Promise<FeedbackResponseDto> {
    const { data } = await axiosInstance.post('/api/v1/engagement-manager/feedback', payload)
    return data
  },

  async getMyRegistration(eventId: string): Promise<RegistrationDto> {
    const { data } = await axiosInstance.get(`/api/v1/event-manager/events/${eventId}/my-registration`)
    return data
  },

  async logEngagement(payload: EngagementRequestDto): Promise<void> {
    // Fire-and-forget — never let a logging failure break the main user flow
    try {
      await axiosInstance.post('/api/v1/engagement-manager/engagements/log', payload)
    } catch {
      // intentionally swallowed — engagement logging is non-critical
    }
  },

  /** Fetches registration + check-in analytics from event-manager (via engagement-manager proxy) */
  async getEventSummary(eventId: string): Promise<EventAnalyticsDto> {
    try {
      const { data } = await axiosInstance.get(
        `/api/v1/engagement-manager/engagements/event/${eventId}/summary`
      )
      return data
    } catch {
      return { eventId, totalRegistrations: 0, pending: 0, confirmed: 0, checkedIn: 0, cancelled: 0 }
    }
  },

  /** Fetches the list of scheduled sessions for an event from event-manager */
  async getSchedulesByEvent(eventId: string): Promise<ScheduleResponseDto[]> {
    try {
      const { data } = await axiosInstance.get(
        `/api/v1/event-manager/events/${eventId}/schedules`
      )
      // event-manager may return a Page wrapper or a plain array
      return Array.isArray(data) ? data : (data.content ?? [])
    } catch {
      return []
    }
  },
}
