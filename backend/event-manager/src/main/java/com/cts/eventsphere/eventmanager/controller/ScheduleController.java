package com.cts.eventsphere.eventmanager.controller;

import com.cts.eventsphere.eventmanager.dto.schedule.ScheduleBulkRequestDto;
import com.cts.eventsphere.eventmanager.dto.schedule.ScheduleRequestDto;
import com.cts.eventsphere.eventmanager.dto.schedule.ScheduleResponseDto;
import com.cts.eventsphere.eventmanager.model.Schedule;
import com.cts.eventsphere.eventmanager.service.ScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Rest Controller for Schedule Entity.
 * Provides endpoints for updating and deleting schedules associated with events.
 *
 * @author 2479623
 * @version 1.0
 * @since 26-03-2026
 */
@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/events/{eventId}/schedules")
public class ScheduleController {
    private final ScheduleService scheduleService;

    /**
     * Retrieves a schedule by its unique identifier within a specific event.
     *
     * @param eventId the unique identifier of the event to which the schedule belongs
     * @param id the unique identifier of the schedule to retrieve
     * @return ResponseEntity containing the schedule DTO and HTTP status 200 (OK)
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER', 'VENUE_MANAGER', 'SYS_ENGAGEMENT_MGR')")
    public ResponseEntity<ScheduleResponseDto> getById(@PathVariable String eventId,
                                                       @PathVariable String id) {
        log.info("Received request to get schedule with ID: {} for event ID: {}", id, eventId);
        ScheduleResponseDto response = scheduleService.getById(eventId, id);
        log.info("Successfully retrieved schedule with ID: {}", id);
        return ResponseEntity.ok(response);
    }

    /**
     * Retrieves multiple schedules by their unique identifiers within a specific event.
     * Maximum of 100 IDs per request.
     *
     * @param eventId the unique identifier of the event to which the schedules belong
     * @param request the request body containing the list of schedule IDs (max 100)
     * @return ResponseEntity containing the list of found schedule DTOs and HTTP status 200 (OK)
     */
    @GetMapping("/bulk")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER', 'VENUE_MANAGER', 'SYS_ENGAGEMENT_MGR')")
    public ResponseEntity<List<ScheduleResponseDto>> getBulkByIds(
            @PathVariable String eventId,
            @Valid @RequestBody ScheduleBulkRequestDto request) {
        log.info("Received bulk schedule request for {} ID(s) for event ID: {}", request.ids().size(), eventId);
        List<ScheduleResponseDto> response = scheduleService.getBulkByIds(eventId, request);
        log.info("Returning {} schedule(s) for event ID: {}", response.size(), eventId);
        return ResponseEntity.ok(response);
    }

    /**
     * Updates an existing schedule by its unique identifier within a specific event.
     *
     * @param eventId the unique identifier of the event to which the schedule belongs
     * @param id the unique identifier of the schedule to update
     * @param scheduleRequest the request DTO containing updated schedule details
     * @return ResponseEntity containing the updated schedule DTO and HTTP status 200 (OK)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER', 'VENUE_MANAGER')")
    public ResponseEntity<ScheduleResponseDto> update(@PathVariable String eventId,
                                                      @PathVariable String id,
                                                      @Valid @RequestBody ScheduleRequestDto scheduleRequest) {
        log.info("Received request to update schedule with ID: {} for event ID: {}", id, eventId);
        ScheduleResponseDto response = scheduleService.updateById(eventId, id, scheduleRequest);
        log.info("Successfully updated schedule with ID: {}", id);
        return ResponseEntity.ok(response);
    }

    /**
     * Deletes a schedule by its unique identifier.
     *
     * @param id the unique identifier of the schedule to delete
     * @return ResponseEntity with HTTP status 204 (NO_CONTENT) if deletion is successful
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER', 'VENUE_MANAGER')")
    public ResponseEntity<Schedule> delete(@PathVariable String id) {
        log.info("Received request to delete schedule with ID: {}", id);
        scheduleService.deleteById(id);
        log.info("Successfully deleted schedule with ID: {}", id);
        return ResponseEntity.noContent().build();
    }
}
