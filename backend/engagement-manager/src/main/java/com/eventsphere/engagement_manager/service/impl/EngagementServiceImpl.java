package com.eventsphere.engagement_manager.service.impl;

import com.eventsphere.engagement_manager.Exception.EngagementNotFoundException;
import com.eventsphere.engagement_manager.Exception.InvalidEngagementException;
import com.eventsphere.engagement_manager.dto.engagement.EngagementRequestDto;
import com.eventsphere.engagement_manager.dto.engagement.EngagementResponseDto;
import com.eventsphere.engagement_manager.dto.mapper.engagement.EngagementRequestDtoMapper;
import com.eventsphere.engagement_manager.dto.mapper.engagement.EngagementResponseDtoMapper;
import com.eventsphere.engagement_manager.model.Engagement;
import com.eventsphere.engagement_manager.model.data.EngagementType;
import com.eventsphere.engagement_manager.repository.EngagementRepository;
import com.eventsphere.engagement_manager.service.EngagementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

// COMMENTED OUT — wire these back when audit & notification services are ready
// import com.eventsphere.engagement_manager.client.AuditServiceClient;
// import com.eventsphere.engagement_manager.client.NotificationServiceClient;
// import com.eventsphere.engagement_manager.dto.client.AuditRequestDto;
// import com.eventsphere.engagement_manager.dto.client.NotificationRequestDto;

/**
 * Service implementation for Engagement management.
 * Provides logic for recording activities, tracking audit logs, and sending notifications.
 *
 * @author 2480027
 * @version 1.1
 * @since 08-03-2026
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class EngagementServiceImpl implements EngagementService {

    // ✅ ACTIVE — engagement DB belongs to this service
    private final EngagementRepository engagementRepository;

    // COMMENTED OUT — uncomment when services are ready
    // private final AuditServiceClient auditServiceClient;
    // private final NotificationServiceClient notificationServiceClient;

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

        // COMMENTED OUT — uncomment when audit-service is ready
        // try {

        //     auditServiceClient.logAudit(new AuditRequestDto(
        //             requestDto.attendeeId(), "CREATE", "Engagement", saved.getEngagementId()
        //     ));
        // } catch (Exception e) {
        //     log.warn("audit-service call failed for engagement {}: {}", saved.getEngagementId(), e.getMessage());
        // }

        // COMMENTED OUT — uncomment when notification-service is ready
        // try {
        //     notificationServiceClient.sendNotification(new NotificationRequestDto(
        //             requestDto.attendeeId(),
        //             "Your activity '" + requestDto.activity() + "' has been successfully recorded.",
        //             "ENGAGEMENT_RECORDED"
        //     ));
        // } catch (Exception e) {
        //     log.warn("notification-service call failed for attendee {}: {}", requestDto.attendeeId(), e.getMessage());
        // }

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

        return results.stream()
                .map(EngagementResponseDtoMapper::toDTO)
                .collect(Collectors.toList());
    }
}