package com.eventsphere.engagement_manager.dto.client;

import java.util.List;

/**
 * Request DTO for bulk schedule retrieval from event-manager.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 13-04-2026
 */
public record ScheduleBulkRequestDto(
        List<String> ids
) {}
