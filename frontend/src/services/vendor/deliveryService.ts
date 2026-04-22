import axiosInstance from '../../api/axiosInstance'
import type { DeliveryRequestDto, DeliveryResponseDto, DeliveryStatus } from '../../types/vendor'

const BASE = '/api/v1/vendor-manager/api/v1'

export const deliveryService = {
  async createDelivery(payload: DeliveryRequestDto): Promise<DeliveryResponseDto> {
    const { data } = await axiosInstance.post(`${BASE}/deliveries`, payload)
    return data
  },

  async getAllDeliveries(): Promise<DeliveryResponseDto[]> {
    const { data } = await axiosInstance.get(`${BASE}/deliveries`)
    return data
  },

  async getDeliveryById(deliveryId: string): Promise<DeliveryResponseDto> {
    const { data } = await axiosInstance.get(`${BASE}/deliveries/${deliveryId}`)
    return data
  },

  async updateDelivery(deliveryId: string, payload: DeliveryRequestDto): Promise<DeliveryResponseDto> {
    const { data } = await axiosInstance.put(`${BASE}/deliveries/${deliveryId}`, payload)
    return data
  },

  async updateDeliveryStatus(deliveryId: string, status: DeliveryStatus): Promise<DeliveryResponseDto> {
    const { data } = await axiosInstance.patch(`${BASE}/deliveries/${deliveryId}/status`, null, {
      params: { status },
    })
    return data
  },

  async deleteDelivery(deliveryId: string): Promise<void> {
    await axiosInstance.delete(`${BASE}/deliveries/${deliveryId}`)
  },
}
