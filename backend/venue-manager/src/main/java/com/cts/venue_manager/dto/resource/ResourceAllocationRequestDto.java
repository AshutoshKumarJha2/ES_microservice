package com.cts.venue_manager.dto.resource;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

/**
 * Data Transfer Object representing a specific resource allocation request.
 */
public record ResourceAllocationRequestDto(
        @NotBlank(message = "Event ID cannot be blank")
        String eventId,

        @NotBlank(message = "Venue ID cannot be blank")
        String venueId,

        @NotBlank(message = "Booking ID cannot be blank")
        String bookingId,

        List<ResourceListElementDto> resourceListElement
) {
}