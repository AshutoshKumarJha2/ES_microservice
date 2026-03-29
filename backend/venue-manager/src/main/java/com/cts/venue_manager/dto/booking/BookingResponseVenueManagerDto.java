package com.cts.venue_manager.dto.booking;

import com.cts.venue_manager.dto.resource.ResourceVenueManagerResponseDto;
import com.cts.venue_manager.model.data.BookingStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record BookingResponseVenueManagerDto(
        String bookingId,
        String eventId,
        String venueId,
        LocalDate date,
        BookingStatus status,
        List<ResourceVenueManagerResponseDto> resourceList,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
