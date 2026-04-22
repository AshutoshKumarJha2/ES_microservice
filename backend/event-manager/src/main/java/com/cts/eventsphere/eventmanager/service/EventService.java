package com.cts.eventsphere.eventmanager.service;

import com.cts.eventsphere.eventmanager.dto.event.EventAnalyticsResponseDto;
import com.cts.eventsphere.eventmanager.dto.event.EventRequestDto;
import com.cts.eventsphere.eventmanager.dto.event.EventResponseDto;
import com.cts.eventsphere.eventmanager.dto.schedule.ScheduleRequestDto;
import com.cts.eventsphere.eventmanager.dto.schedule.ScheduleResponseDto;
import com.cts.eventsphere.eventmanager.exception.event.EventNotFoundException;

import java.util.List;

/**
 * Service Interface for Event Entity.
 * * @author 2479623
 *
 * @version 1.0
 * @since 26-03-2026
 */
public interface EventService {

    /**
     * Creates a new event in the system.
     *
     * @param userId the ID of the authenticated caller (used for audit)
     * @param role   the role of the authenticated caller (ADMIN may set a custom organizerId)
     * @param event  the request DTO containing event details
     * @return the response DTO representing the created event
     */
    EventResponseDto create(String userId, String role, EventRequestDto event);

    /**
     * Retrieves all events available in the system.
     * DRAFT events are excluded when the caller's role is {@code ATTENDEE}.
     *
     * @param userId the ID of the requesting user (for audit)
     * @param role   the role of the requesting user
     * @return a list of response DTOs representing all visible events
     */
    List<EventResponseDto> findAllEvents(String userId, String role);

    /**
     * Finds an event by its unique identifier.
     * DRAFT events are treated as not found when the caller's role is {@code ATTENDEE}.
     *
     * @param eventId the unique identifier of the event
     * @param userId  the ID of the requesting user (for audit)
     * @param role    the role of the requesting user
     * @return the response DTO representing the event
     * @throws EventNotFoundException if no event exists with the given ID, or the event
     *                                is a DRAFT and the caller is an ATTENDEE
     */
    EventResponseDto findById(String eventId, String userId, String role) throws EventNotFoundException;

    /**
     * Updates an existing event by its unique identifier.
     *
     * @param eventId the unique identifier of the event to update
     * @param eventRequest the request DTO containing updated event details
     * @return true if the update was successful, false otherwise
     * @throws EventNotFoundException if no event exists with the given ID
     */
    boolean updateById(String eventId, EventRequestDto eventRequest, String userId) throws EventNotFoundException;

    /**
     * Deletes an event by its unique identifier.
     *
     * @param eventId the unique identifier of the event to delete
     * @return true if the deletion was successful, false otherwise
     * @throws EventNotFoundException if no event exists with the given ID
     */
    boolean deleteById(String eventId, String userId) throws EventNotFoundException;

    /**
     * Adds a new activity (schedule) to an existing event.
     *
     * @param eventId the unique identifier of the event
     * @param schedule the request DTO containing schedule details
     * @return the response DTO representing the added schedule
     */
    ScheduleResponseDto addActivity(String eventId, ScheduleRequestDto schedule, String userId);

    /**
     * Retrieves all schedules associated with a specific event.
     *
     * @param eventId the unique identifier of the event
     * @return a list of response DTOs representing all schedules for the event
     */
    List<ScheduleResponseDto> findAllSchedules(String eventId, String userId);

    /**
     * Retrieves registration analytics for a specific event.
     *
     * @param eventId the unique identifier of the event
     * @return DTO containing registration counts broken down by status
     * @throws EventNotFoundException if no event exists with the given ID
     */
    EventAnalyticsResponseDto getAnalytics(String eventId) throws EventNotFoundException;
}
