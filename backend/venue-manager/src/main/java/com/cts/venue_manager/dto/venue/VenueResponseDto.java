package com.cts.venue_manager.dto.venue;

import com.cts.venue_manager.model.data.AvailabilityStatus;

/**
 * DTO for Response of Venue
 *
 * @author 2479476
 * @version 1.0
 * @since 2-03-2026
 */
public record VenueResponseDto(
        String id,
        String name,
        String location,
        int capacity,
        AvailabilityStatus availabilityStatus
) {
}