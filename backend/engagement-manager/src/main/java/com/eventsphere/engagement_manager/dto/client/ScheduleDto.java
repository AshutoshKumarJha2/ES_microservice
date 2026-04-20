package com.eventsphere.engagement_manager.dto.client;

/**
 * Client DTO representing a schedule returned from event-manager.
 *
 * @author 2480027
 * @version 1.0
 * @since 13-04-2026
 */
public record ScheduleDto(
        String scheduleId,
        String eventId,
        String date,
        String timeSlot,
        String activity,
        String status   // e.g. "DRAFT", "ACTIVE", "COMPLETED", "TERMINATED"
) {}