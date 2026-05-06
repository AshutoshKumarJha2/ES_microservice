package com.cts.venue_manager.dto.resource;

public record ResourceVenueManagerResponseDto(
        String resourceName,
        int requestedQuantity
) {
}
