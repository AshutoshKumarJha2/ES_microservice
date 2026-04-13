package com.eventsphere.engagement_manager.dto.client;

/**
 * Client DTO representing registration analytics returned from event-manager.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 13-04-2026
 */
public record EventAnalyticsDto(
        String eventId,
        long totalRegistrations,
        long pending,
        long confirmed,
        long checkedIn,
        long cancelled
) {}
