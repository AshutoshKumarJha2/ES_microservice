package com.eventsphere.engagement_manager.dto.feedback;

import lombok.Builder;

import java.time.LocalDateTime;

/**
 * FeedbackResponseDto representing Feedback details
 *
 * @author 2480027
 * @version 1.0
 * @since 25-03-2026
 */
@Builder
public record FeedbackResponseDto(
        String feedbackId,
        String eventId,
        String attendeeId,
        int rating,
        String comments,
        LocalDateTime createdAt
) {}