package com.cts.eventsphere.eventmanager.dto.event;

import java.util.List;

/**
 * Paginated response DTO for a list of events.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-04-27
 */
public record EventPageResponseDto(
        List<EventResponseDto> events,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
}
