package com.eventsphere.engagement_manager.controller;

import com.eventsphere.engagement_manager.dto.client.EventAnalyticsDto;
import com.eventsphere.engagement_manager.dto.engagement.EngagementRequestDto;
import com.eventsphere.engagement_manager.dto.engagement.EngagementResponseDto;
import com.eventsphere.engagement_manager.model.data.EngagementType;
import com.eventsphere.engagement_manager.service.EngagementService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Controller for Engagement Operations
 *
 * @author 2480027
 * @version 1.0
 * @since 26-03-2026
 */
@Slf4j
@RestController
@RequestMapping("/engagements")
@RequiredArgsConstructor
public class EngagementController {

    private final EngagementService engagementService;

    @PostMapping("/log")
    @PreAuthorize("hasRole('ATTENDEE')")
    public ResponseEntity<EngagementResponseDto> logEngagement(@Valid @RequestBody EngagementRequestDto engagementRequestDto) {
        log.info("API: Logging engagement for user={} at event={}",
                engagementRequestDto.attendeeId(), engagementRequestDto.eventId());
        EngagementResponseDto saved = engagementService.recordEngagement(engagementRequestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * Internal endpoint for service-to-service engagement logging.
     * Called by event-manager (SYS_EVENT_MGR) when registrations, approvals,
     * and check-ins happen — so those activities appear in the analytics dashboard.
     */
    @PostMapping("/internal/log")
    @PreAuthorize("hasAnyRole('SYS_EVENT_MGR', 'ADMIN')")
    public ResponseEntity<EngagementResponseDto> logEngagementInternal(@Valid @RequestBody EngagementRequestDto engagementRequestDto) {
        log.info("Internal: Logging engagement activity={} for attendee={} at event={}",
                engagementRequestDto.activity(), engagementRequestDto.attendeeId(), engagementRequestDto.eventId());

        EngagementResponseDto saved = engagementService.recordEngagement(engagementRequestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/event/{eventId}/log")
    @PreAuthorize("hasAnyRole('ATTENDEE','ORGANIZER','ADMIN')")
    public ResponseEntity<List<EngagementResponseDto>> getByEvent(@PathVariable String eventId) {
        log.info("API: get engagements for event={}", eventId);
        return ResponseEntity.ok(engagementService.getByEvent(eventId));
    }

    @GetMapping("/activity/{activity}/log")
    @PreAuthorize("hasAnyRole('ATTENDEE','ORGANIZER','ADMIN')")
    public ResponseEntity<List<EngagementResponseDto>> getByActivity(@PathVariable EngagementType activity) {
        log.info("API: get engagements for activity={}", activity);
        return ResponseEntity.ok(engagementService.getByActivityType(activity));
    }

    @GetMapping("/filter")
    @PreAuthorize("hasAnyRole('ATTENDEE','ORGANIZER','ADMIN')")
    public ResponseEntity<List<EngagementResponseDto>> getDetailedFilter(
            @RequestParam String eventId,
            @RequestParam EngagementType activity,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {

        log.info("API: filter engagements event={} activity={} range={}..{}", eventId, activity, start, end);
        return ResponseEntity.ok(engagementService.getFilteredEngagements(eventId, activity, start, end));
    }

    /**
     * Returns registration + check-in analytics for an event by proxying
     * the event-manager analytics endpoint through engagement-manager.
     * Used by the frontend analytics dashboard to get accurate registration counts.
     */
    @GetMapping("/event/{eventId}/summary")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<EventAnalyticsDto> getEventSummary(@PathVariable String eventId) {
        log.info("API: get event summary for event={}", eventId);
        return ResponseEntity.ok(engagementService.getEventSummary(eventId));
    }

    /**
     * Counts SESSION_JOIN engagements for a given schedule (session).
     * Used by the Session-wise Attendance section of the analytics dashboard.
     */
    @GetMapping("/session/{scheduleId}/count")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<Long> getSessionJoinCount(@PathVariable String scheduleId) {
        log.info("API: get session join count for scheduleId={}", scheduleId);
        return ResponseEntity.ok(engagementService.getSessionJoinCount(scheduleId));
    }
}