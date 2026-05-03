package com.cts.venue_manager.dto.mapper.booking;

import com.cts.venue_manager.dto.booking.BookingResponseDto;
import com.cts.venue_manager.dto.resource.ResourceListElementDto;
import com.cts.venue_manager.dto.resource.ResourceVenueManagerResponseDto;
import com.cts.venue_manager.model.Booking;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Mapper to convert Booking Entity to BookingResponseDto
 *
 * @author 2479476
 * @version 1.0
 * @since 04-03-2026
 */
@Component
public class BookingResponseDtoMapper {

    /**
     * Maps Booking Entity to Response DTO.
     * * @param booking the booking entity from the database
     * @return a BookingResponseDto record
     */
    public BookingResponseDto toDto(Booking booking, List<ResourceVenueManagerResponseDto> resourceReqList) {
        if (booking == null) {
            return null;
        }

        return new BookingResponseDto(
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