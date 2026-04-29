package com.eventsphere.engagement_manager.service;



import com.eventsphere.engagement_manager.dto.client.EventAnalyticsDto;
import com.eventsphere.engagement_manager.dto.engagement.EngagementRequestDto;
import com.eventsphere.engagement_manager.dto.engagement.EngagementResponseDto;
import com.eventsphere.engagement_manager.dto.engagement.SessionAttendanceSummaryDto;
import com.eventsphere.engagement_manager.model.data.EngagementType;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service for Engagement Operations
 *
 * @author 2480027
 * @version 1.0
 * @since 26-03-2026
 */
public interface EngagementService {

    EngagementResponseDto recordEngagement(EngagementRequestDto engagementRequestDto);

    List<EngagementResponseDto> getByEvent(String eventId);

    List<EngagementResponseDto> getByActivityType(EngagementType activity);

    List<EngagementResponseDto> getFilteredEngagements(String eventId, EngagementType activity, LocalDateTime start, LocalDateTime end);

    /** Returns registration analytics from event-manager for the given event */
    EventAnalyticsDto getEventSummary(String eventId);

    /** Counts SESSION_JOIN engagements for a given schedule (session) */
    long getSessionJoinCount(String scheduleId);

    /** Returns all engagements recorded for a given schedule (session) */
    List<EngagementResponseDto> getByScheduleId(String scheduleId);

    /** Returns attendance summary (totalRegistrations, presentCount, absentCount) for a session */
    SessionAttendanceSummaryDto getSessionAttendanceSummary(String eventId, String scheduleId);
}