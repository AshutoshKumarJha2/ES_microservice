package com.cts.venue_manager.dto.booking;

import jakarta.validation.constraints.NotBlank;

/**
 * Request Dto for creating or updating a Booking
 *
 * @author 2479476
 * @version 1.0
 * @since 04-03-2026
 */
public record BookingRequestDto(
        @NotBlank(message = "Event ID is required")
        String eventId,

        @NotBlank(message = "Venue ID is required")
        String venueId
) {
}