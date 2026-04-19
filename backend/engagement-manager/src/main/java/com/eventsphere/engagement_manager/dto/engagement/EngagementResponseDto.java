package com.eventsphere.engagement_manager.dto.engagement;

/**
 * EngagementResponseDto for representing engagement details
 *
 * @author 2480027
 * @version 1.0
 * @since 25-03-2026
 */

import com.eventsphere.engagement_manager.model.data.EngagementType;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record EngagementResponseDto(
        String engagementId,
        String eventId,
        String attendeeId,
        EngagementType activity,
        LocalDateTime activityTimestamp,
        String scheduleId
) {}
