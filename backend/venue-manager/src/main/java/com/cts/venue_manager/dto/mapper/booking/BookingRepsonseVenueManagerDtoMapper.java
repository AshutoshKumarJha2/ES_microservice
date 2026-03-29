package com.cts.venue_manager.dto.mapper.booking;

import com.cts.venue_manager.dto.booking.BookingResponseVenueManagerDto;
import com.cts.venue_manager.dto.resource.ResourceVenueManagerResponseDto;
import com.cts.venue_manager.model.Booking;
import org.springframework.stereotype.Component;

import java.util.List;
/**
 * Mapper component responsible for transforming Booking entities and associated resources
 * into specialized DTOs for venue management views.
 * This class ensures that event-specific booking details and allocated resources are
 * correctly aggregated for the venue manager's perspective.
 *
 * @author 2479476
 * @version 1.0
 * @since 2026-03-26
 */
@Component
public class BookingRepsonseVenueManagerDtoMapper {
    /**
     * Maps a Booking entity and a list of resource DTOs to a Venue Manager specific response.
     * Consolidates persistent booking data with calculated resource requirements
     * to provide a comprehensive view of a reservation.
     *
     * @param booking the persistent booking entity to be mapped
     * @param resourceReqList the list of resources associated with this specific booking
     * @return a populated BookingResponseVenueManagerDto, or null if the booking is null
     */
    public BookingResponseVenueManagerDto toDto(Booking booking, List<ResourceVenueManagerResponseDto> resourceReqList) {
        if (booking == null) {
            return null;
        }

        return new BookingResponseVenueManagerDto(
                booking.getBookingId(),
                booking.getEventId(),
                booking.getVenue().getVenueId(),
                booking.getDate(),
                booking.getStatus(),
                resourceReqList,
                booking.getCreatedAt(),
                booking.getUpdatedAt()
        );
    }
}
