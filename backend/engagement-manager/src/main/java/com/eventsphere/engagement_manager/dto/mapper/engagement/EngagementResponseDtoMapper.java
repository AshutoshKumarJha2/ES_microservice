package com.eventsphere.engagement_manager.dto.mapper.engagement;

import com.eventsphere.engagement_manager.dto.engagement.EngagementResponseDto;
import com.eventsphere.engagement_manager.model.Engagement;
import org.springframework.stereotype.Component;

/**
 * DTO Mapper for Engagement Response DTO.
 *
// * @author 2480027
 * @version 1.0
 * @since 25-03-2026
 */

@Component
public  class EngagementResponseDtoMapper {

    public static EngagementResponseDto toDTO(Engagement entity) {
        if (entity == null) {
            return null;
        }

        return EngagementResponseDto.builder()
                .engagementId(entity.getEngagementId())
                .eventId(entity.getEventId())
                .attendeeId(entity.getAttendeeId())
                .activity(entity.getActivity())
                .activityTimestamp(entity.getCreatedAt())
                .scheduleId(entity.getScheduleId())
                .build();
    }
}