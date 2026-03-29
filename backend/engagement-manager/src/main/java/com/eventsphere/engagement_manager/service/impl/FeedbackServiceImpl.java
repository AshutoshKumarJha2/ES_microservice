package com.eventsphere.engagement_manager.service.impl;

import com.eventsphere.engagement_manager.Exception.FeedbackNotFoundException;
import com.eventsphere.engagement_manager.auth.dto.UserPrincipal;
import com.eventsphere.engagement_manager.client.EventServiceClient;
import com.eventsphere.engagement_manager.client.LogServiceClient;
import com.eventsphere.engagement_manager.dto.audit.AuditAction;
import com.eventsphere.engagement_manager.dto.client.RegistrationStatusDto;
import com.eventsphere.engagement_manager.dto.feedback.FeedbackRequestDto;
import com.eventsphere.engagement_manager.dto.feedback.FeedbackResponseDto;
import com.eventsphere.engagement_manager.dto.mapper.feedback.FeedbackRequestDtoMapper;
import com.eventsphere.engagement_manager.dto.mapper.feedback.FeedbackResponseDtoMapper;
import com.eventsphere.engagement_manager.model.Feedback;
import com.eventsphere.engagement_manager.repository.FeedbackRepository;
import com.eventsphere.engagement_manager.service.AuditService;
import com.eventsphere.engagement_manager.service.FeedbackService;
import feign.FeignException;
import jakarta.persistence.EntityExistsException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Service implementation for Feedback management.
 * Integrates with AuditService for activity tracking and NotificationService for user alerts.
 *
 * @author 2480027
 * @version 1.1
 * @since 26-03-2026
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final EventServiceClient registrationServiceClient;
    private final AuditService auditService;
    private final LogServiceClient logServiceClient;

    private static final String NOTIFICATION_CATEGORY = "FEEDBACK";

    @Override
    public FeedbackResponseDto create(FeedbackRequestDto request, UserPrincipal userPrincipal) {
        log.info("Processing feedback creation for event: {}", request.eventId());

        validateRating(request.rating());
        ensureEligibleToSubmit(request.eventId(), userPrincipal);
        ensureNotDuplicate(request.eventId(), request.attendeeId());

        Feedback entity = FeedbackRequestDtoMapper.toEntity(request);
        Feedback saved = feedbackRepository.save(entity);
        log.info("Feedback saved with ID: {}", saved.getFeedbackId());

        auditService.logAudit(request.attendeeId(), AuditAction.CREATE, Feedback.class, saved.getFeedbackId());
        notifyUser(request.attendeeId(),
                "Thank you! Your feedback for event " + request.eventId() + " has been received.");

        return FeedbackResponseDtoMapper.toDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public FeedbackResponseDto getById(String feedbackId) {
        log.info("Fetching feedback: {}", feedbackId);
        return feedbackRepository.findById(feedbackId)
                .map(FeedbackResponseDtoMapper::toDTO)
                .orElseThrow(() -> new FeedbackNotFoundException(feedbackId));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<FeedbackResponseDto> listByEvent(String eventId, Pageable pageable) {
        return feedbackRepository.findByEventId(eventId, pageable)
                .map(FeedbackResponseDtoMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<FeedbackResponseDto> listByEventAndDateRange(
            String eventId, LocalDateTime start, LocalDateTime end, Pageable pageable) {
        return feedbackRepository.findByEventIdAndCreatedAtBetween(eventId, start, end, pageable)
                .map(FeedbackResponseDtoMapper::toDTO);
    }

    @Override
    public void delete(String feedbackId) {
        log.info("Deleting feedback: {}", feedbackId);
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new FeedbackNotFoundException(feedbackId));

        feedbackRepository.deleteById(feedbackId);

        auditService.logAudit(feedback.getAttendeeId(), AuditAction.DELETE, Feedback.class, feedbackId);
    }

    // ===================== HELPER METHODS =====================

    private void validateRating(int rating) {
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5.");
        }
    }

    private void ensureEligibleToSubmit(String eventId, UserPrincipal userPrincipal) {
        RegistrationStatusDto registration;
        try {
            registration = registrationServiceClient.getRegistrationStatus(eventId, userPrincipal);
        } catch (FeignException.NotFound e) {
            throw new IllegalStateException("Attendee is not registered for this event.");
        }

        String status = registration.status();
        if (!(status.equalsIgnoreCase("confirmed") || status.equalsIgnoreCase("checked_in"))) {
            throw new IllegalStateException("Only confirmed or checked-in attendees can provide feedback.");
        }
    }

    private void ensureNotDuplicate(String eventId, String attendeeId) {
        boolean exists = !feedbackRepository
                .findByEventIdAndAttendeeId(eventId, attendeeId, PageRequest.of(0, 1))
                .isEmpty();

        if (exists) {
            throw new EntityExistsException("Feedback already submitted for this event.");
        }
    }

    private void notifyUser(String userId, String message) {
        try {
            logServiceClient.sendNotification(userId, message, NOTIFICATION_CATEGORY);
        } catch (FeignException e) {
            log.warn("Failed to send notification to user {}: {}", userId, e.getMessage());
        }
    }
}
