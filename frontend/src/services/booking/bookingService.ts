import axiosInstance from '../../api/axiosInstance'
import type {

    BookingRequestDto,
    BookingResponseDto,
    BookingResponseVenueManagerDto,
    BookingStatus,
    
} from '../../types/venue'

const BASE = '/api/v1/venue-manager/api/v1'

export const bookingService = {

    async createBooking(payload: BookingRequestDto): Promise<BookingResponseDto> {
            const { data } = await axiosInstance.post(`${BASE}/bookings`, payload)
            return data
        },

        async getAllBookings(): Promise<BookingResponseDto[]> {
            const { data } = await axiosInstance.get(`${BASE}/bookings`)
            return data
        },

        async getBookingsByVenue(venueId: string): Promise<BookingResponseVenueManagerDto[]> {
            const { data } = await axiosInstance.get(`${BASE}/venues/${venueId}/bookings`)
            return data
        },

        async getBookingsByEvent(eventId: string): Promise<BookingResponseDto[]> {
            const { data } = await axiosInstance.get(`${BASE}/bookings/events/${eventId}`)
            return data
        },

        async updateBookingStatus(bookingId: string, newStatus: BookingStatus): Promise<BookingResponseDto> {
            const { data } = await axiosInstance.patch(`${BASE}/bookings/${bookingId}/status`, null, {
                params: { newStatus },
            })
            return data
        },

        async deleteBooking(bookingId: string): Promise<void> {
            await axiosInstance.delete(`${BASE}/bookings/${bookingId}`)
        }
    }