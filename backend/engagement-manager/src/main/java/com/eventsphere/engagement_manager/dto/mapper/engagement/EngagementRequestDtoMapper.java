package com.eventsphere.engagement_manager.dto.mapper.engagement;
import com.eventsphere.engagement_manager.dto.engagement.EngagementRequestDto;
import com.eventsphere.engagement_manager.model.Engagement;
import org.springframework.stereotype.Component;

/**
 * DTO Mapper for Engagement Request DTO.
 * Converts incoming request data into the Engagement entity.
 *
 * @author 2480027
 * @version 1.0
 * @since 25-03-2026
 */
@Component
public class EngagementRequestDtoMapper {

    public static Engagement toEntity(EngagementRequestDto dto) {
        if (dto == null) {
            return null;
        }

        return Engagement.builder()
                .eventId(dto.eventId())
                .attendeeId(dto.attendeeId())
                .activity(dto.activity())
                .build();
    }
}