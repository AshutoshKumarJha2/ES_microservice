package com.eventsphere.engagement_manager.service;



import com.eventsphere.engagement_manager.dto.engagement.EngagementRequestDto;
import com.eventsphere.engagement_manager.dto.engagement.EngagementResponseDto;
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
}