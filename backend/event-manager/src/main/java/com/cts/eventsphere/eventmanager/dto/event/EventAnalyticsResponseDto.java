package com.cts.eventsphere.eventmanager.dto.event;

/**
 * DTO representing registration analytics for a specific event.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 13-04-2026
 */
public record EventAnalyticsResponseDto(
        String eventId,
        long totalRegistrations,
        long pending,
        long confirmed,
        long checkedIn,
        long cancelled
) {}
