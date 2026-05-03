package com.eventsphere.engagement_manager.dto.engagement;

/**
 * Summary of attendance for a single session (schedule).
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 29-04-2026
 */
public record SessionAttendanceSummaryDto(
        String scheduleId,
        long totalRegistrations,
        long presentCount,
        long absentCount
) {}
