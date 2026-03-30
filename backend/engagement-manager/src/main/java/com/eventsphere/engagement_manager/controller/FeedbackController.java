package com.eventsphere.engagement_manager.controller;

import com.eventsphere.engagement_manager.auth.dto.UserPrincipal;
import com.eventsphere.engagement_manager.dto.feedback.FeedbackRequestDto;
import com.eventsphere.engagement_manager.dto.feedback.FeedbackResponseDto;
import com.eventsphere.engagement_manager.service.FeedbackService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

/**
 * Controller for feedback entity
 *
 * @author 2480027
 * @version 1.1
 * @since 26-03-2026
 */
@RestController
@RequestMapping("/feedback")
@Slf4j
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping
    @PreAuthorize("hasRole('ATTENDEE')")
    public ResponseEntity<FeedbackResponseDto> create(@Valid @RequestBody FeedbackRequestDto feedbackRequestDto,
                                                      @AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("REST request to save Feedback : {}", feedbackRequestDto);
        FeedbackResponseDto result = feedbackService.create(feedbackRequestDto, userPrincipal);
        log.info("Feedback created successfully with data: {}", result);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ATTENDEE','ORGANIZER','ADMIN')")
    public ResponseEntity<FeedbackResponseDto> getById(@PathVariable String id) {
        log.info("REST request to get Feedback by ID : {}", id);
        return ResponseEntity.ok(feedbackService.getById(id));
    }

    @GetMapping("/event/{eventId}")
    @PreAuthorize("hasAnyRole('ATTENDEE','ORGANIZER','ADMIN')")
    public ResponseEntity<Page<FeedbackResponseDto>> listByEvent(@PathVariable String eventId, Pageable pageable) {
        log.info("REST request to get a page of Feedbacks for Event ID : {} with Pageable: {}", eventId, pageable);
        Page<FeedbackResponseDto> page = feedbackService.listByEvent(eventId, pageable);
        log.info("Fetched {} feedback records for Event ID : {}", page.getNumberOfElements(), eventId);
        return ResponseEntity.ok(page);
    }

    @GetMapping("/event/{eventId}/date-range")
    @PreAuthorize("hasAnyRole('ATTENDEE','ORGANIZER','ADMIN')")
    public ResponseEntity<Page<FeedbackResponseDto>> listByEventAndDateRange(
            @PathVariable String eventId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            Pageable pageable) {
        log.info("REST request to get Feedbacks for Event ID : {} between {} and {}", eventId, start, end);
        Page<FeedbackResponseDto> page = feedbackService.listByEventAndDateRange(eventId, start, end, pageable);
        log.info("Fetched {} feedback records for Event ID : {} in date range", page.getNumberOfElements(), eventId);
        return ResponseEntity.ok(page);
    }

    @DeleteMapping("/{feedbackId}")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    public ResponseEntity<Void> deleteFeedback(@PathVariable String feedbackId) {
        log.info("REST request to delete Feedback ID : {}", feedbackId);
        feedbackService.delete(feedbackId);
        log.info("Successfully deleted Feedback ID : {}", feedbackId);
        return ResponseEntity.noContent().build();
    }
}
