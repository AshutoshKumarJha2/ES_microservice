package com.cts.eventsphere.eventmanager.service.impl;

import com.cts.eventsphere.eventmanager.dto.audit.AuditAction;
import com.cts.eventsphere.eventmanager.dto.event.EventRequestDto;
import com.cts.eventsphere.eventmanager.dto.event.EventResponseDto;
import com.cts.eventsphere.eventmanager.dto.mapper.event.EventRequestDtoMapper;
import com.cts.eventsphere.eventmanager.dto.mapper.event.EventResponseDtoMapper;
import com.cts.eventsphere.eventmanager.dto.mapper.schedule.ScheduleRequestDtoMapper;
import com.cts.eventsphere.eventmanager.dto.mapper.schedule.ScheduleResponseDtoMapper;
import com.cts.eventsphere.eventmanager.dto.schedule.ScheduleRequestDto;
import com.cts.eventsphere.eventmanager.dto.schedule.ScheduleResponseDto;
import com.cts.eventsphere.eventmanager.exception.event.EventNotFoundException;
import com.cts.eventsphere.eventmanager.model.Event;
import com.cts.eventsphere.eventmanager.model.Schedule;
import com.cts.eventsphere.eventmanager.repository.EventRepository;
import com.cts.eventsphere.eventmanager.repository.ScheduleRepository;
import com.cts.eventsphere.eventmanager.service.AuditService;
import com.cts.eventsphere.eventmanager.service.EventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Implementation for Service Interface for Event Class.
 * Provides business logic for creating, retrieving, updating, and deleting events,
 * as well as managing schedules associated with events. Also triggers notifications
 * with dynamic event details when events are created, updated, or deleted.
 *
 * @author 2479623
 * @version 1.2
 * @since 26-03-2026
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EventServiceImpl implements EventService {
    private final EventRepository eventRepository;
    private final EventResponseDtoMapper eventResponseDtoMapper;
    private final EventRequestDtoMapper eventRequestDtoMapper;
    private final ScheduleRepository scheduleRepository;
    private final ScheduleResponseDtoMapper scheduleResponseDtoMapper;
    private final ScheduleRequestDtoMapper scheduleRequestDtoMapper;
    private final AuditService auditService;
//    private final NotificationService notificationService;

    /**
     * Creates a new event in the system and triggers a notification with event details.
     *
     * @param eventRequest the DTO containing event details to be created
     * @return the response DTO representing the newly created event
     */
    @Override
    public EventResponseDto create(String userId, EventRequestDto eventRequest) {
        log.info("Creating a new event: {}", eventRequest.name());
        Event event = eventRequestDtoMapper.toEntity(eventRequest);
        Event savedEvent = eventRepository.save(event);
        log.info("Successfully saved event with ID: {}", savedEvent.getEventId());

        auditService.logAudit(userId, AuditAction.CREATE, Event.class, savedEvent.getEventId());

        var venueId = eventRequest.venueId() == null ? "null" : eventRequest.venueId();

//        notificationService.sendNotification(
//                eventRequest.organizerId(),
//                "New Event Created: " + eventRequest.name() +
//                        " at venue " + venueId +
//                        " from " + eventRequest.startDate() +
//                        " to " + eventRequest.endDate(),
//                "EVENT_CREATED"
//        );

        return eventResponseDtoMapper.toDTO(savedEvent);
    }

    /**
     * Retrieves all events available in the system.
     *
     * @return a list of response DTOs representing all events
     */
    @Override
    public List<EventResponseDto> findAllEvents(String userId) {
        log.info("Fetching all events from repository");
        List<EventResponseDto> events = eventRepository.findAll().stream()
                .peek(e -> auditService.logAudit(userId, AuditAction.READ, Event.class, e.getEventId()))
                .map(eventResponseDtoMapper::toDTO)
                .toList();
        log.debug("Found {} events in total", events.size());
        return events;
    }

    /**
     * Finds an event by its unique identifier.
     *
     * @param eventId the unique identifier of the event
     * @return the response DTO representing the event
     * @throws EventNotFoundException if no event exists with the given ID
     */
    @Override
    public EventResponseDto findById(String eventId, String userId) throws EventNotFoundException {
        log.info("Searching for event with ID: {}", eventId);
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> {
                    log.error("Event lookup failed: ID {} not found", eventId);
                    return new EventNotFoundException(eventId);
                });
        auditService.logAudit(userId, AuditAction.READ, Event.class, event.getEventId());

        return eventResponseDtoMapper.toDTO(event);
    }

    /**
     * Updates an existing event by its unique identifier and triggers a notification with updated details.
     *
     * @param eventId the unique identifier of the event to update
     * @param eventRequest the DTO containing updated event details
     * @return true if the update was successful, false otherwise
     * @throws EventNotFoundException if no event exists with the given ID
     */
    @Override
    public boolean updateById(String eventId, EventRequestDto eventRequest, String userId) throws EventNotFoundException {
        log.info("Updating event with ID: {}", eventId);
        if(!eventRepository.existsById(eventId)) {
            log.error("Update failed: Event ID {} does not exist", eventId);
            throw new EventNotFoundException(eventId);
        }

        Event event = eventRequestDtoMapper.toEntity(eventRequest);
        event.setEventId(eventId);
        eventRepository.save(event);
        log.info("Successfully updated event ID: {}", eventId);
        auditService.logAudit(userId, AuditAction.UPDATE, Event.class, event.getEventId());

//        notificationService.sendNotification(
//                eventRequest.organizerId(),
//                "Event Updated: " + eventRequest.name() +
//                        " at venue " + eventRequest.venueId() +
//                        " from " + eventRequest.startDate() +
//                        " to " + eventRequest.endDate(),
//                "EVENT_UPDATED"
//        );

        return true;
    }

    /**
     * Deletes an event by its unique identifier and triggers a notification.
     *
     * @param eventId the unique identifier of the event to delete
     * @return true if the deletion was successful, false otherwise
     * @throws EventNotFoundException if no event exists with the given ID
     */
    @Override
    public boolean deleteById(String eventId, String userId) throws EventNotFoundException {
        log.info("Request to delete event with ID: {}", eventId);
        if(!eventRepository.existsById(eventId)) {
            log.warn("Delete aborted: Event ID {} not found", eventId);
            throw new EventNotFoundException(eventId);
        }
        eventRepository.deleteById(eventId);
        auditService.logAudit(userId, AuditAction.DELETE, Event.class, eventId);
        log.info("Successfully deleted event ID: {}", eventId);

        return true;
    }

    /**
     * Adds a new activity (schedule) to an existing event and triggers a notification.
     *
     * @param eventId the unique identifier of the event to which the activity belongs
     * @param scheduleRequest the DTO containing schedule details
     * @return the response DTO representing the added schedule
     * @throws EventNotFoundException if the parent event does not exist
     */
    @Override
    public ScheduleResponseDto addActivity(String eventId, ScheduleRequestDto scheduleRequest, String userId) {
        log.info("Adding new activity to event ID: {}", eventId);
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> {
                    log.error("Activity creation failed: Parent Event ID {} not found", eventId);
                    return new EventNotFoundException(eventId);
                });

        Schedule schedule = scheduleRequestDtoMapper.toEntity(scheduleRequest, event);
        Schedule savedSchedule = scheduleRepository.save(schedule);
        log.info("Successfully added activity ID: {} to event ID: {}", savedSchedule.getScheduleId(), eventId);

        auditService.logAudit(userId, AuditAction.CREATE, Schedule.class, savedSchedule.getScheduleId());
//        notificationService.sendNotification(
//                event.getOrganizerId(),
//                "New Activity Added to Event: " + event.getName() +
//                        " | Activity ID: " + savedSchedule.getScheduleId(),
//                "SCHEDULE"
//        );

        return scheduleResponseDtoMapper.toDTO(savedSchedule);
    }

    /**
     * Retrieves all schedules associated with a specific event.
     *
     * @param eventId the unique identifier of the event
     * @return a list of response DTOs representing all schedules for the event
     */
    @Override
    public List<ScheduleResponseDto> findAllSchedules(String eventId, String userId) {
        log.info("Fetching all activities for event ID: {}", eventId);
        List<ScheduleResponseDto> schedules = scheduleRepository.findAll().stream()
                .filter(s -> s.getEvent().getEventId().equals(eventId))
                .peek(s -> auditService.logAudit(userId, AuditAction.READ, Schedule.class, s.getScheduleId()))
                .map(scheduleResponseDtoMapper::toDTO)
                .toList();
        log.debug("Found {} activities matching event ID: {}", schedules.size(), eventId);
        return schedules;
    }
}
