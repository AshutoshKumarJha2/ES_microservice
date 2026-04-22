package com.cts.eventsphere.eventmanager.service.impl;

import com.cts.eventsphere.eventmanager.client.UserServiceClient;
import com.cts.eventsphere.eventmanager.client.VenueClient;
import com.cts.eventsphere.eventmanager.dto.audit.AuditAction;
import com.cts.eventsphere.eventmanager.dto.event.EventAnalyticsResponseDto;
import com.cts.eventsphere.eventmanager.dto.event.EventRequestDto;
import com.cts.eventsphere.eventmanager.dto.event.EventResponseDto;
import com.cts.eventsphere.eventmanager.dto.user.OrganizerDto;
import com.cts.eventsphere.eventmanager.dto.user.UserDetailsDto;
import com.cts.eventsphere.eventmanager.dto.mapper.event.EventRequestDtoMapper;
import com.cts.eventsphere.eventmanager.dto.mapper.event.EventResponseDtoMapper;
import com.cts.eventsphere.eventmanager.dto.mapper.schedule.ScheduleRequestDtoMapper;
import com.cts.eventsphere.eventmanager.dto.mapper.schedule.ScheduleResponseDtoMapper;
import com.cts.eventsphere.eventmanager.dto.schedule.ScheduleRequestDto;
import com.cts.eventsphere.eventmanager.dto.schedule.ScheduleResponseDto;
import com.cts.eventsphere.eventmanager.dto.venue.VenueDetailsDto;
import com.cts.eventsphere.eventmanager.exception.event.EventNotFoundException;
import com.cts.eventsphere.eventmanager.model.Event;
import com.cts.eventsphere.eventmanager.model.Schedule;
import com.cts.eventsphere.eventmanager.model.data.RegistrationStatus;
import com.cts.eventsphere.eventmanager.repository.EventRepository;
import com.cts.eventsphere.eventmanager.repository.RegistrationRepository;
import com.cts.eventsphere.eventmanager.repository.ScheduleRepository;
import com.cts.eventsphere.eventmanager.service.AuditService;
import com.cts.eventsphere.eventmanager.service.EventService;
import com.cts.eventsphere.eventmanager.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
    private final RegistrationRepository registrationRepository;
    private final EventResponseDtoMapper eventResponseDtoMapper;
    private final EventRequestDtoMapper eventRequestDtoMapper;
    private final ScheduleRepository scheduleRepository;
    private final ScheduleResponseDtoMapper scheduleResponseDtoMapper;
    private final ScheduleRequestDtoMapper scheduleRequestDtoMapper;
    private final AuditService auditService;
    private final NotificationService notificationService;
    private final VenueClient venueClient;
    private final UserServiceClient userServiceClient;

    private static final int VENUE_BATCH_SIZE = 50;

    /**
     * Fetches venue details for a list of events in batches of {@value VENUE_BATCH_SIZE}.
     * Venues whose IDs are null or blank are skipped. Failures in the venue-manager
     * call are swallowed so an unavailable venue service never breaks event reads.
     *
     * @param events the events whose venue details should be resolved
     * @return a map of venueId → VenueDetailsDto (only for IDs that resolved)
     */
    private Map<String, VenueDetailsDto> fetchVenueMap(List<Event> events) {
        List<String> venueIds = events.stream()
                .map(Event::getVenueId)
                .filter(id -> id != null && !id.isBlank())
                .distinct()
                .toList();

        if (venueIds.isEmpty()) return Map.of();

        List<VenueDetailsDto> fetched = new ArrayList<>();
        for (int i = 0; i < venueIds.size(); i += VENUE_BATCH_SIZE) {
            List<String> batch = venueIds.subList(i, Math.min(i + VENUE_BATCH_SIZE, venueIds.size()));
            try {
                fetched.addAll(venueClient.getBulkVenues(batch));
            } catch (Exception ex) {
                log.warn("Venue batch lookup failed for {} ids, venue details will be omitted: {}",
                        batch.size(), ex.getMessage());
            }
        }
        return fetched.stream().collect(Collectors.toMap(VenueDetailsDto::id, v -> v));
    }

    /**
     * Fetches organizer details for a list of events in a single batch call.
     * Failures are swallowed so an unavailable auth-manager never breaks event reads.
     *
     * @param events the events whose organizer details should be resolved
     * @return a map of organizerId → OrganizerDto (only for IDs that resolved)
     */
    private Map<String, OrganizerDto> fetchOrganizerMap(List<Event> events) {
        List<String> organizerIds = events.stream()
                .map(Event::getOrganizerId)
                .filter(id -> id != null && !id.isBlank())
                .distinct()
                .toList();

        if (organizerIds.isEmpty()) return Map.of();

        try {
            return userServiceClient.getUserDetails(organizerIds).stream()
                    .collect(Collectors.toMap(
                            UserDetailsDto::userId,
                            u -> OrganizerDto.builder()
                                    .id(u.userId())
                                    .name(u.name())
                                    .email(u.email())
                                    .build()
                    ));
        } catch (Exception ex) {
            log.warn("Organizer lookup failed, organizer details will be omitted: {}", ex.getMessage());
            return Map.of();
        }
    }

    /**
     * Creates a new event in the system and triggers a notification with event details.
     * Only ADMIN callers may supply a custom organizerId; all other roles have their
     * own userId forced as the organizerId regardless of what the DTO contains.
     *
     * @param userId       the ID of the authenticated caller (used for audit)
     * @param role         the role of the authenticated caller
     * @param eventRequest the DTO containing event details to be created
     * @return the response DTO representing the newly created event
     */
    @Override
    public EventResponseDto create(String userId, String role, EventRequestDto eventRequest) {
        EventRequestDto effectiveRequest = "ADMIN".equals(role)
                ? eventRequest
                : EventRequestDto.builder()
                        .name(eventRequest.name())
                        .organizerId(userId)
                        .startDate(eventRequest.startDate())
                        .endDate(eventRequest.endDate())
                        .venueId(eventRequest.venueId())
                        .status(eventRequest.status())
                        .build();

        log.info("Creating a new event: {}", effectiveRequest.name());
        Event event = eventRequestDtoMapper.toEntity(effectiveRequest);
        Event savedEvent = eventRepository.save(event);
        log.info("Successfully saved event with ID: {}", savedEvent.getEventId());

        auditService.logAudit(userId, AuditAction.CREATE, Event.class, savedEvent.getEventId());

        var venueId = effectiveRequest.venueId() == null ? "null" : effectiveRequest.venueId();

        notificationService.sendNotification(
                effectiveRequest.organizerId(),
                "New Event Created: " + effectiveRequest.name() +
                        " at venue " + venueId +
                        " from " + effectiveRequest.startDate() +
                        " to " + effectiveRequest.endDate(),
                "EVENT"
        );

        return eventResponseDtoMapper.toDTO(savedEvent);
    }

    /**
     * Retrieves all events available in the system.
     * DRAFT events are excluded when the caller's role is {@code ATTENDEE}.
     *
     * @param userId the ID of the requesting user (for audit)
     * @param role   the role of the requesting user
     * @return a list of response DTOs representing all visible events
     */
    @Override
    public List<EventResponseDto> findAllEvents(String userId, String role) {
        log.info("Fetching all events from repository");
        List<Event> events = eventRepository.findAll();
        if ("ATTENDEE".equals(role)) {
            events = events.stream()
                    .filter(e -> e.getStatus() != com.cts.eventsphere.eventmanager.model.data.EventStatus.DRAFT)
                    .toList();
        }
        events.forEach(e -> auditService.logAudit(userId, AuditAction.READ, Event.class, e.getEventId()));
        Map<String, VenueDetailsDto> venueMap = fetchVenueMap(events);
        Map<String, OrganizerDto> organizerMap = fetchOrganizerMap(events);
        List<EventResponseDto> result = events.stream()
                .map(e -> eventResponseDtoMapper.toDTO(e, venueMap.get(e.getVenueId()), organizerMap.get(e.getOrganizerId())))
                .toList();
        log.debug("Found {} events in total", result.size());
        return result;
    }

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
    @Override
    public EventResponseDto findById(String eventId, String userId, String role) throws EventNotFoundException {
        log.info("Searching for event with ID: {}", eventId);
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> {
                    log.error("Event lookup failed: ID {} not found", eventId);
                    return new EventNotFoundException(eventId);
                });
        if ("ATTENDEE".equals(role) && event.getStatus() == com.cts.eventsphere.eventmanager.model.data.EventStatus.DRAFT) {
            log.warn("Attendee {} attempted to access DRAFT event {}", userId, eventId);
            throw new EventNotFoundException(eventId);
        }
        auditService.logAudit(userId, AuditAction.READ, Event.class, event.getEventId());
        Map<String, VenueDetailsDto> venueMap = fetchVenueMap(List.of(event));
        Map<String, OrganizerDto> organizerMap = fetchOrganizerMap(List.of(event));
        return eventResponseDtoMapper.toDTO(event, venueMap.get(event.getVenueId()), organizerMap.get(event.getOrganizerId()));
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

        notificationService.sendNotification(
                eventRequest.organizerId(),
                "Event Updated: " + eventRequest.name() +
                        " at venue " + eventRequest.venueId() +
                        " from " + eventRequest.startDate() +
                        " to " + eventRequest.endDate(),
                "EVENT"
        );

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
        notificationService.sendNotification(
                event.getOrganizerId(),
                "New Activity Added to Event: " + event.getName() +
                        " | Activity ID: " + savedSchedule.getScheduleId(),
                "EVENT"
        );

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

    /**
     * Retrieves registration analytics for a specific event, broken down by status.
     *
     * @param eventId the unique identifier of the event
     * @return DTO containing total registrations and counts per status
     * @throws EventNotFoundException if no event exists with the given ID
     */
    @Override
    public EventAnalyticsResponseDto getAnalytics(String eventId) throws EventNotFoundException {
        log.info("Fetching analytics for event ID: {}", eventId);
        if (!eventRepository.existsById(eventId)) {
            log.error("Analytics failed: Event ID {} not found", eventId);
            throw new EventNotFoundException(eventId);
        }
        long total     = registrationRepository.countByEventEventId(eventId);
        long pending   = registrationRepository.countByEventEventIdAndStatus(eventId, RegistrationStatus.PENDING);
        long confirmed = registrationRepository.countByEventEventIdAndStatus(eventId, RegistrationStatus.CONFIRMED);
        long checkedIn = registrationRepository.countByEventEventIdAndStatus(eventId, RegistrationStatus.CHECKED_IN);
        long cancelled = registrationRepository.countByEventEventIdAndStatus(eventId, RegistrationStatus.CANCELLED);
        log.info("Analytics for event ID {}: total={}, pending={}, confirmed={}, checkedIn={}, cancelled={}",
                eventId, total, pending, confirmed, checkedIn, cancelled);
        return new EventAnalyticsResponseDto(eventId, total, pending, confirmed, checkedIn, cancelled);
    }
}
