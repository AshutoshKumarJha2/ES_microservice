import axiosInstance from '../../api/axiosInstance'
import type { EngagementResponseDto, PageFeedbackResponseDto } from '../../types/events'

export const analyticsService = {
  async getEngagementsByEvent(eventId: string): Promise<EngagementResponseDto[]> {
    const { data } = await axiosInstance.get(`/api/v1/engagement-manager/engagements/event/${eventId}/log`)
    return data
  },

  async getFeedbackByEvent(eventId: string, page = 0, size = 20): Promise<PageFeedbackResponseDto> {
    const { data } = await axiosInstance.get(`/api/v1/engagement-manager/feedback/event/${eventId}`, {
      params: { page, size },
    })
    return data
  },
}
