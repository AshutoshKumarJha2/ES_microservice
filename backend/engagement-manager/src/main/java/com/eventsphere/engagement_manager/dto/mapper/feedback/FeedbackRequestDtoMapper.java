package com.eventsphere.engagement_manager.dto.mapper.feedback;


import com.eventsphere.engagement_manager.dto.feedback.FeedbackRequestDto;
import com.eventsphere.engagement_manager.model.Feedback;
import org.springframework.stereotype.Component;

/**
 * DTO Mapper for Feedback Request DTO.
 *
 * @author 2480027
 * @version 1.0
 * @since 25-03-2026
 */
@Component
public class FeedbackRequestDtoMapper {

    public static Feedback toEntity(FeedbackRequestDto dto) {
        if (dto == null) {
            return null;
        }

        return Feedback.builder()
                .eventId(dto.eventId())
                .attendeeId(dto.attendeeId())
                .rating(dto.rating())
                .comments(dto.comments())
                .createdAt(dto.createdAt())
                .build();
    }
}