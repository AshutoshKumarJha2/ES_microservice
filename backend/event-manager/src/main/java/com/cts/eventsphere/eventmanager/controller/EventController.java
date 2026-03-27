package com.cts.eventsphere.eventmanager.controller;

import com.cts.eventsphere.eventmanager.auth.dto.UserPrincipal;
import com.cts.eventsphere.eventmanager.dto.event.EventRequestDto;
import com.cts.eventsphere.eventmanager.dto.event.EventResponseDto;
import com.cts.eventsphere.eventmanager.dto.schedule.ScheduleRequestDto;
import com.cts.eventsphere.eventmanager.dto.schedule.ScheduleResponseDto;
import com.cts.eventsphere.eventmanager.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Rest Controller for Event Entity.
 * Provides endpoints for creating, retrieving, updating, and deleting events,
 * as well as managing schedules associated with events.
 *
 * @author 2479623
 * @version 1.0
 * @since 27-02-2026
 */
@RestController
@RequestMapping("/api/v1/events")
@Slf4j
@RequiredArgsConstructor
public class EventController {
    private final EventService eventService;

    /**
     * Creates a new event.
     *
     * @param event the request DTO containing event details
     * @return ResponseEntity containing the created event DTO and HTTP status 201 (CREATED)
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER', 'VENUE_MANAGER')")
    public ResponseEntity<EventResponseDto> create(@Valid @RequestBody EventRequestDto event, @AuthenticationPrincipal UserPrincipal userDetails) {
        var userId = userDetails.userId();
        log.info("Received request to create a new event: {}", event.name());
        EventResponseDto createdEvent = eventService.create(userId,event);
        log.info("Successfully created event with ID: {}", createdEvent.id());
        return new ResponseEntity<>(createdEvent, HttpStatus.CREATED);
    }

    /**
     * Retrieves all events.
     * @return ResponseEntity containing a list of event DTOs and HTTP status 200 (OK)
     */
    @GetMapping
    public ResponseEntity<List<EventResponseDto>> readAll(@AuthenticationPrincipal UserPrincipal userDetails) {
        var userId = userDetails.userId();
        log.info("Received request to fetch all events");
        List<EventResponseDto> events = eventService.findAllEvents(userId);
        log.info("Successfully retrieved {} events", events.size());
        return ResponseEntity.ok(events);
    }

    /**
     * Updates an existing event by its unique identifier.
     *
     * @param id the unique identifier of the event to update
     * @param eventRequest the request DTO containing updated event details
     * @return ResponseEntity with HTTP status 204 (NO_CONTENT) if update is successful
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<Void> update(@PathVariable String id, @Valid @RequestBody EventRequestDto eventRequest, @AuthenticationPrincipal UserPrincipal userDetails) {
        var userId = userDetails.userId();
        log.info("Received request to update event with ID: {}", id);
        eventService.updateById(id, eventRequest, userId);
        log.info("Successfully updated event with ID: {}", id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EventResponseDto> getById(@PathVariable String id, @AuthenticationPrincipal UserPrincipal userDetails) {
        var userId = userDetails.userId();
        log.info("Received request to get event with ID: {}", id);
        return ResponseEntity.ok(eventService.findById(id,userId));

    }

    /**
     * Deletes an event by its unique identifier.
     *
     * @param id the unique identifier of the event to delete
     * @return ResponseEntity with HTTP status 204 (NO_CONTENT) if deletion is successful
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id, @AuthenticationPrincipal UserPrincipal userDetails) {
        var userId = userDetails.userId();
        log.info("Received request to delete event with ID: {}", id);
        eventService.deleteById(id, userId);
        log.info("Successfully deleted event with ID: {}", id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Adds a new schedule (activity) to an existing event.
     *
     * @param id the unique identifier of the event
     * @param scheduleRequest the request DTO containing schedule details
     * @return ResponseEntity containing the created schedule DTO and HTTP status 201 (CREATED)
     */
    @PostMapping("/{id}/schedules")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER', 'VENUE_MANAGER')")
    public ResponseEntity<ScheduleResponseDto> createActivity(@PathVariable String id, @Valid @RequestBody ScheduleRequestDto scheduleRequest , @AuthenticationPrincipal UserPrincipal userDetails) {
        var userId = userDetails.userId();
        log.info("Received request to add activity to event ID: {}", id);
        ScheduleResponseDto response = eventService.addActivity(id, scheduleRequest, userId);
        log.info("Successfully added activity with ID: {} to event ID: {}", response.eventId(), id);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Retrieves all schedules (activities) associated with a specific event.
     *
     * @param id the unique identifier of the event
     * @return ResponseEntity containing a list of schedule DTOs and HTTP status 200 (OK)
     */
    @GetMapping("/{id}/schedules")
    public ResponseEntity<List<ScheduleResponseDto>> getAllActivity(@PathVariable String id, @AuthenticationPrincipal UserPrincipal userDetails) {
        var userId = userDetails.userId();
        log.info("Received request to fetch all activities for event ID: {}", id);
        List<ScheduleResponseDto> schedules = eventService.findAllSchedules(id, userId);
        log.info("Successfully retrieved {} activities for event ID: {}", schedules.size(), id);
        return ResponseEntity.ok(schedules);
    }
}
