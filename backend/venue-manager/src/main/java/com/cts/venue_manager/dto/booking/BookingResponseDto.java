package com.cts.venue_manager.dto.booking;

import com.cts.venue_manager.dto.resource.ResourceListElementDto;
import com.cts.venue_manager.model.data.BookingStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Response Dto for returning Booking details
 *
 * @author 2479476
 * @version 1.0
 * @since 04-03-2026
 */
public record BookingResponseDto(
        String bookingId,
        String eventId,
        String venueId,
        LocalDate date,
        BookingStatus status,
        List<ResourceListElementDto> resourceList,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}