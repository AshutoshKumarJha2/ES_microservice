package com.cts.venue_manager.dto.resource;

public record ResourceVenueManagerResponseDto(
        String allocationId,
        String resourceName,
        int requestedQuantity
) {
}
