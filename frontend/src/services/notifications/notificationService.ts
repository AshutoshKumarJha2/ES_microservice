import axiosInstance from '../../api/axiosInstance'
import type { AppNotification } from '../../types/events'

export const notificationService = {
  async getForUser(userId: string, limit = 50): Promise<AppNotification[]> {
    const { data } = await axiosInstance.get(
      `/api/v1/log-manager/notifications/${userId}/scroll`,
      { params: { limit } }
    )
    return data
  },

  async markAsRead(notificationId: string): Promise<void> {
    await axiosInstance.patch(
      `/api/v1/log-manager/notifications/${notificationId}/read`
    )
  },

  async send(userId: string, message: string, category: string): Promise<void> {
    await axiosInstance.post(
      `/api/v1/log-manager/notifications/send`,
      null,
      { params: { userId, message, category } }
    )
  },
}
