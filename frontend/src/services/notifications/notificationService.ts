import axiosInstance from '../../api/axiosInstance'
import type { AppNotification } from '../../types/events'

export const notificationService = {
  async getForUser(userId: string, limit = 20, lastTimestamp?: string, status?: string): Promise<AppNotification[]> {
    const { data } = await axiosInstance.get(
      `/api/v1/log-manager/notifications/${userId}/scroll`,
      {
        params: {
          limit,
          ...(lastTimestamp && { lastTimestamp }),
          ...(status && { status }),
        },
      }
    )
    return data
  },

  async markAsRead(notificationId: string): Promise<void> {
    await axiosInstance.patch(
      `/api/v1/log-manager/notifications/${notificationId}/read`
    )
  },

  async markAllAsRead(userId: string): Promise<void> {
    await axiosInstance.patch(
      `/api/v1/log-manager/notifications/${userId}/read-all`
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
