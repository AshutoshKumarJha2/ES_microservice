package com.cts.eventsphere.eventmanager.dto.engagement;

import java.time.LocalDateTime;

/**
 * DTO used to log engagement activities to engagement-manager via Feign.
 * Fields match engagement-manager's EngagementRequestDto exactly.
 *
 * @author 2480027
 * @version 1.0
 * @since 18-04-2026
 */
public record EngagementLogDto(
        String eventId,
        String attendeeId,
        String activity,
        LocalDateTime activityTimestamp,
        String scheduleId
) {}
