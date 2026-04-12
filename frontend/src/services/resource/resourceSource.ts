import axiosInstance from '../../api/axiosInstance'
import type {
    VenueRequestDto,
    VenueResponseDto,
    AvailabilityStatus,
    BookingRequestDto,
    BookingResponseDto,
    BookingResponseVenueManagerDto,
    BookingStatus,
    ResourceRequestDto,
    ResourceResponseDto,
    ResourceAllocationRequestDto,
    MessageResponseDto,
} from '../../types/venue'

const BASE = '/api/v1/venue-manager/api/v1'

export const resourceSource = {

        async createResource(venueId: string, payload: ResourceRequestDto): Promise<ResourceResponseDto> {
            const { data } = await axiosInstance.post(`${BASE}/venues/${venueId}/resources`, payload)
            return data
        },

        async getAllResources(): Promise<ResourceResponseDto[]> {
            const { data } = await axiosInstance.get(`${BASE}/resources`)
            return data
        },

        async getResourceById(resourceId: string): Promise<ResourceResponseDto> {
            const { data } = await axiosInstance.get(`${BASE}/resources/${resourceId}`)
            return data
        },

        async getResourcesByVenue(venueId: string): Promise<ResourceResponseDto[]> {
            const { data } = await axiosInstance.get(`${BASE}/venues/${venueId}/resources`)
            return data
        },

        async requestAllocation(payload: ResourceAllocationRequestDto): Promise<MessageResponseDto> {
            const { data } = await axiosInstance.post(`${BASE}/resources/allocation`, payload)
            return data
        },

        async approveAllocation(allocationId: string): Promise<MessageResponseDto> {
            const { data } = await axiosInstance.patch(`${BASE}/resources/allocation/${allocationId}/approve`)
            return data
        },

        async updateResource(resourceId: string, payload: ResourceRequestDto): Promise<ResourceResponseDto> {
            const { data } = await axiosInstance.put(`${BASE}/resources/${resourceId}`, payload)
            return data
        },

        async deleteResource(resourceId: string): Promise<void> {
            await axiosInstance.delete(`${BASE}/resources/${resourceId}`)
        }
    }