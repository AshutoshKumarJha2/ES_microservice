package com.eventsphere.engagement_manager.service.impl;

import com.eventsphere.engagement_manager.Exception.EngagementNotFoundException;
import com.eventsphere.engagement_manager.Exception.InvalidEngagementException;
import com.eventsphere.engagement_manager.auth.dto.UserPrincipal;
import com.eventsphere.engagement_manager.client.EventServiceClient;
import com.eventsphere.engagement_manager.client.LogServiceClient;
import com.eventsphere.engagement_manager.dto.audit.AuditAction;
import com.eventsphere.engagement_manager.dto.client.EventAnalyticsDto;
import com.eventsphere.engagement_manager.dto.engagement.EngagementRequestDto;
import com.eventsphere.engagement_manager.dto.engagement.EngagementResponseDto;
import com.eventsphere.engagement_manager.dto.mapper.engagement.EngagementRequestDtoMapper;
import com.eventsphere.engagement_manager.dto.mapper.engagement.EngagementResponseDtoMapper;
import com.eventsphere.engagement_manager.model.Engagement;
import com.eventsphere.engagement_manager.model.data.EngagementType;
import com.eventsphere.engagement_manager.repository.EngagementRepository;
import com.eventsphere.engagement_manager.service.AuditService;
import com.eventsphere.engagement_manager.service.EngagementService;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service implementation for Engagement management.
 * Provides logic for recording activities, tracking audit logs, and sending notifications.
 *
 * @author 2480027
 * @version 1.1
 * @since 26-03-2026
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class EngagementServiceImpl implements EngagementService {

    private final EngagementRepository engagementRepository;
    private final AuditService auditService;
    private final LogServiceClient logServiceClient;
    private final EventServiceClient eventServiceClient;

    private static final String NOTIFICATION_CATEGORY = "ENGAGEMENT";

    @Override
    public EngagementResponseDto recordEngagement(EngagementRequestDto requestDto) {
        log.info("Recording {} for attendee={} event={}",
                requestDto.activity(), requestDto.attendeeId(), requestDto.eventId());

        if (requestDto.activityTimestamp() != null &&
                requestDto.activityTimestamp().isAfter(LocalDateTime.now())) {
            throw new InvalidEngagementException("Engagement timestamp cannot be in the future");
        }

        Engagement entity = EngagementRequestDtoMapper.toEntity(requestDto);
        Engagement saved = engagementRepository.save(entity);
        log.info("Engagement recorded with id={}", saved.getEngagementId());

        auditService.logAudit(requestDto.attendeeId(), AuditAction.CREATE, Engagement.class, saved.getEngagementId());
        notifyUser(requestDto.attendeeId(),
                "Your activity '" + requestDto.activity() + "' has been successfully recorded.");

        return EngagementResponseDtoMapper.toDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EngagementResponseDto> getByEvent(String eventId) {
        log.info("Fetching engagements for event={}", eventId);
        List<Engagement> results = engagementRepository.findByEventId(eventId);

        if (results.isEmpty()) {
            throw new EngagementNotFoundException("No engagements found for event: " + eventId);
        }

        auditService.logAudit(getCurrentUserId(), AuditAction.READ, Engagement.class, eventId);

        return results.stream()
                .map(EngagementResponseDtoMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EngagementResponseDto> getByActivityType(EngagementType activity) {
        log.info("Fetching engagements for activity={}", activity);
        List<Engagement> results = engagementRepository.findByActivity(activity);

        if (results.isEmpty()) {
            throw new EngagementNotFoundException("No engagements found for activity type: " + activity);
        }

        auditService.logAudit(getCurrentUserId(), AuditAction.READ, Engagement.class, activity.name());

        return results.stream()
                .map(EngagementResponseDtoMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EngagementResponseDto> getFilteredEngagements(String eventId, EngagementType activity,
                                                              LocalDateTime start, LocalDateTime end) {
        log.info("Filtering engagements event={} activity={} range={}..{}", eventId, activity, start, end);

        if (start != null && end != null && start.isAfter(end)) {
            throw new InvalidEngagementException("Start date must be before end date");
        }

        List<Engagement> results = engagementRepository
                .findByEventIdAndActivityAndCreatedAtBetween(eventId, activity, start, end);

        if (results.isEmpty()) {
            throw new EngagementNotFoundException("No engagements match the provided filters");
        }

        auditService.logAudit(getCurrentUserId(), AuditAction.READ, Engagement.class, eventId);

        return results.stream()
                .map(EngagementResponseDtoMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public EventAnalyticsDto getEventSummary(String eventId) {
        log.info("Fetching event summary for eventId={}", eventId);
        try {
            return eventServiceClient.getEventAnalytics(eventId);
        } catch (FeignException e) {
            log.warn("Could not fetch analytics from event-manager for event={}: {}", eventId, e.getMessage());
            return new EventAnalyticsDto(eventId, 0L, 0L, 0L, 0L, 0L);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public long getSessionJoinCount(String scheduleId) {
        log.info("Counting SESSION_JOIN engagements for scheduleId={}", scheduleId);
        return engagementRepository.countByScheduleIdAndActivity(scheduleId, EngagementType.SESSION_JOIN);
    }

    private void notifyUser(String userId, String message) {
        try {
            logServiceClient.sendNotification(userId, message, NOTIFICATION_CATEGORY);
        } catch (FeignException e) {
            log.warn("Failed to send notification to user {}: {}", userId, e.getMessage());
        }
    }

    private String getCurrentUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserPrincipal userPrincipal) {
            return userPrincipal.userId();
        }
        return "UNKNOWN";
    }
}
