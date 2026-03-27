package com.eventsphere.engagement_manager.controller;

// ✅ FIXED — was com.cts.eventsphere.*, now matches this service's package
import com.eventsphere.engagement_manager.dto.feedback.FeedbackRequestDto;
import com.eventsphere.engagement_manager.dto.feedback.FeedbackResponseDto;
import com.eventsphere.engagement_manager.service.FeedbackService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for feedback entity
 *
 * @author 2480027
 * @version 1.1
 * @since 03-03-2026
 */
@RestController
@RequestMapping("/api/v1/feedback")
@Slf4j
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping
    @PreAuthorize("hasRole('ATTENDEE')")
    public ResponseEntity<FeedbackResponseDto> create(@Valid @RequestBody FeedbackRequestDto feedbackRequestDto) {
        log.info("REST request to save Feedback : {}", feedbackRequestDto);
        FeedbackResponseDto result = feedbackService.create(feedbackRequestDto);
        log.info("Feedback created successfully with data: {}", result);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ATTENDEE','ORGANIZER','ADMIN')")
    public ResponseEntity<FeedbackResponseDto> getById(@PathVariable String id) {
        log.info("REST request to get Feedback by ID : {}", id);
        FeedbackResponseDto response = feedbackService.getById(id);
        if (response.feedbackId() == null) {
            log.warn("Feedback with ID : {} not found", id);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/event/{eventId}")
    @PreAuthorize("hasAnyRole('ATTENDEE','ORGANIZER','ADMIN')")
    public ResponseEntity<Page<FeedbackResponseDto>> listByEvent(@PathVariable String eventId, Pageable pageable) {
        log.info("REST request to get a page of Feedbacks for Event ID : {} with Pageable: {}", eventId, pageable);
        Page<FeedbackResponseDto> page = feedbackService.listByEvent(eventId, pageable);
        log.info("Fetched {} feedback records for Event ID : {}", page.getNumberOfElements(), eventId);
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