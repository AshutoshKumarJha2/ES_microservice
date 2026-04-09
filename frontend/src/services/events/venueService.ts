import axiosInstance from '../../api/axiosInstance'
import type { VenueResponseDto } from '../../types/events'

export const venueService = {
  async getAll(): Promise<VenueResponseDto[]> {
    const { data } = await axiosInstance.get('/api/v1/venue-manager/api/v1/venues')
    return data
  },
}
