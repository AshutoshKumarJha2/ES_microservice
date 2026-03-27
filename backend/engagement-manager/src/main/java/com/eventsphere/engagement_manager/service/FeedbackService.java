package com.eventsphere.engagement_manager.service;

/**
 *Service class for feedback entity
 *
 * @author 2480027
 * @version 1.0
 * @since 26-03-2026
 */



import com.eventsphere.engagement_manager.dto.feedback.FeedbackRequestDto;
import com.eventsphere.engagement_manager.dto.feedback.FeedbackResponseDto;
import org.springframework.data.domain.Page;

import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;

public interface FeedbackService {

    FeedbackResponseDto create(FeedbackRequestDto request);

    FeedbackResponseDto getById(String feedbackId);

    Page<FeedbackResponseDto> listByEvent(String eventId, Pageable pageable);

    Page<FeedbackResponseDto> listByEventAndDateRange(String eventId, LocalDateTime start, LocalDateTime end, Pageable pageable);

    void delete(String feedbackId);
}