package com.eventsphere.engagement_manager.dto.mapper.feedback;

import com.eventsphere.engagement_manager.dto.feedback.FeedbackResponseDto;
import com.eventsphere.engagement_manager.model.Feedback;
import org.springframework.stereotype.Component;

/**
 * DTO Mapper for Feedback Response DTO.
 *
 * @author 2480027
 * @version 1.0
 * @since 26-02-2026
 */
@Component
public class FeedbackResponseDtoMapper {

    public static FeedbackResponseDto toDTO(Feedback entity) {
        if (entity == null) {
            return null;
        }

        return FeedbackResponseDto.builder()
                .feedbackId(entity.getFeedbackId())
                .eventId(entity.getEventId())
                .attendeeId(entity.getAttendeeId())
                .rating(entity.getRating())
                .comments(entity.getComments())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}