package com.cts.eventsphere.eventmanager.dto.venue;

/**
 * Projection of venue information embedded in event responses.
 * Populated via a bulk service-to-service call to venue-manager.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-04-19
 */
public record VenueDetailsDto(
        String id,
        String name,
        String location,
        int capacity,
        String availabilityStatus
) {}
