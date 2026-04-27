import axiosInstance from '../../api/axiosInstance'
import type { VendorRequestDto, VendorResponseDto, VendorStatus } from '../../types/vendor'

const BASE = '/api/v1/vendor-manager'

export const vendorService = {
  async createVendor(payload: VendorRequestDto): Promise<VendorResponseDto> {
    const { data } = await axiosInstance.post(`${BASE}/vendors`, payload)
    return data
  },

  async getAllVendors(): Promise<VendorResponseDto[]> {
    const { data } = await axiosInstance.get(`${BASE}/vendors`)
    return data
  },

  async getVendorById(vendorId: string): Promise<VendorResponseDto> {
    const { data } = await axiosInstance.get(`${BASE}/vendors/${vendorId}`)
    return data
  },

  async updateVendor(vendorId: string, payload: VendorRequestDto): Promise<VendorResponseDto> {
    const { data } = await axiosInstance.put(`${BASE}/vendors/${vendorId}`, payload)
    return data
  },

  async deleteVendor(vendorId: string): Promise<void> {
    await axiosInstance.delete(`${BASE}/vendors/${vendorId}`)
  },
}

export type { VendorStatus }
