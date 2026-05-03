import axiosInstance from '../../api/axiosInstance'
import type {
    VenueRequestDto,
    VenueResponseDto,
    AvailabilityStatus
} from '../../types/venue'

const BASE = '/api/v1/venue-manager'

export const venueService = {

    async addVenue(payload: VenueRequestDto): Promise<VenueResponseDto> {
        const { data } = await axiosInstance.post(`${BASE}/venues`, payload)
        return data
    },

    async getAllVenues(): Promise<VenueResponseDto[]> {
        const { data } = await axiosInstance.get(`${BASE}/venues`)
        return data
    },

    async updateVenue(venueId: string, payload: VenueRequestDto): Promise<VenueResponseDto> {
        const { data } = await axiosInstance.put(`${BASE}/venues/${venueId}`, payload)
        return data
    },

    async updateVenueStatus(venueId: string, status: AvailabilityStatus): Promise<VenueResponseDto> {
        const { data } = await axiosInstance.patch(`${BASE}/venues/${venueId}/status`, null, {
            params: { status },
        })
        return data
    },

    async deleteVenue(venueId: string): Promise<void> {
        await axiosInstance.delete(`${BASE}/venues/${venueId}`)
    },

    async getVenuesByLocation(location: string): Promise<VenueResponseDto[]> {
        const { data } = await axiosInstance.get(`${BASE}/venues/location/${location}`)
        return data
    },

    async getVenuesByCapacity(capacity: number): Promise<VenueResponseDto[]> {
        const { data } = await axiosInstance.get(`${BASE}/venues/capacity/${capacity}`)
        return data
    },

    async getVenuesByStatus(status: AvailabilityStatus): Promise<VenueResponseDto[]> {
        const { data } = await axiosInstance.get(`${BASE}/venues/status/${status}`)
        return data
    },

    async getVenuesByDate(date: string): Promise<VenueResponseDto[]> {
        const { data } = await axiosInstance.get(`${BASE}/venues/date/${date}`)
        return data
    },

    async getVenuesByManager(managerId: string): Promise<VenueResponseDto[]> {
        const { data } = await axiosInstance.get(`${BASE}/venues/manager/${managerId}`)
        return data
    },
}
