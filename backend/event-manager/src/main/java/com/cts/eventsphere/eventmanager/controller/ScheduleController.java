package com.cts.eventsphere.eventmanager.controller;

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
@RequestMapping("/api/v1/events/{eventId}/schedules")
public class ScheduleController {
    private final ScheduleService scheduleService;

    /**
     * Updates an existing schedule by its unique identifier within a specific event.
     *
     * @param eventId the unique identifier of the event to which the schedule belongs
     * @param id the unique identifier of the schedule to update
     * @param scheduleRequest the request DTO containing updated schedule details
     * @return ResponseEntity containing the updated schedule DTO and HTTP status 200 (OK)
     */
    @PostMapping("/{id}")
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
    public ResponseEntity<Schedule> delete(@PathVariable String id) {
        log.info("Received request to delete schedule with ID: {}", id);
        scheduleService.deleteById(id);
        log.info("Successfully deleted schedule with ID: {}", id);
        return ResponseEntity.noContent().build();
    }
}
