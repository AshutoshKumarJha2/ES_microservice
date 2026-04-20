package com.cts.eventsphere.eventmanager.service.impl;

import com.cts.eventsphere.eventmanager.client.EngagementServiceClient;
import com.cts.eventsphere.eventmanager.client.LogServiceClient;
import com.cts.eventsphere.eventmanager.client.UserServiceClient;
import com.cts.eventsphere.eventmanager.dto.engagement.EngagementLogDto;
import com.cts.eventsphere.eventmanager.dto.mapper.registration.RegistrationDtoMapper;
import com.cts.eventsphere.eventmanager.dto.registration.RegistrationDto;
import com.cts.eventsphere.eventmanager.dto.registration.RegistrationListResponseDto;
import com.cts.eventsphere.eventmanager.dto.user.UserDetailsDto;
import com.cts.eventsphere.eventmanager.dto.shared.GenericResponse;
import com.cts.eventsphere.eventmanager.exception.event.EventNotFoundException;
import com.cts.eventsphere.eventmanager.exception.registration.DuplicateRegistrationException;
import com.cts.eventsphere.eventmanager.exception.registration.InvalidRegistrationStatusException;
import com.cts.eventsphere.eventmanager.exception.registration.RegistrationNotFoundException;
import com.cts.eventsphere.eventmanager.exception.ticket.TicketNotFoundException;
import com.cts.eventsphere.eventmanager.model.Registration;
import com.cts.eventsphere.eventmanager.model.data.RegistrationStatus;
import com.cts.eventsphere.eventmanager.repository.EventRepository;
import com.cts.eventsphere.eventmanager.repository.RegistrationRepository;
import com.cts.eventsphere.eventmanager.repository.RegistrationSpecification;
import com.cts.eventsphere.eventmanager.repository.TicketRepository;
import com.cts.eventsphere.eventmanager.service.RegistrationService;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Implementation of {@link RegistrationService} for managing event registrations.
 * Handles registration lifecycle: creation, status transitions, and retrieval.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-26
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RegistrationServiceImpl implements RegistrationService {

    private static final String NOTIFICATION_CATEGORY = "EVENT";

    private final RegistrationRepository registrationRepo;
    private final TicketRepository ticketRepository;
    private final EventRepository eventRepository;
    private final LogServiceClient logServiceClient;
    private final UserServiceClient userServiceClient;
    private final EngagementServiceClient engagementServiceClient;

    /**
     * {@inheritDoc}
     *
     * <p>Validates that the user is not already registered for the event, then
     * creates a new registration in {@link RegistrationStatus#PENDING} state.</p>
     *
     * @throws DuplicateRegistrationException if the user is already registered for the event
     * @throws EventNotFoundException         if the event does not exist
     * @throws TicketNotFoundException        if the ticket does not exist
     */
    @Override
    public RegistrationDto registerForEvent(String userId, String eventId, String ticketId) {
        if (registrationRepo.existsByEventEventIdAndAttendeeId(eventId, userId)) {
            throw new DuplicateRegistrationException(userId, eventId);
        }
        var event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException(eventId));
        var ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException(ticketId));

        var newRegistration = Registration.builder()
                .attendeeId(userId)
                .event(event)
                .ticket(ticket)
                .status(RegistrationStatus.PENDING)
                .build();
        registrationRepo.save(newRegistration);
        log.info("User {} registered for event {} with ticket {}", userId, eventId, ticketId);

        notifyUser(userId, "Your registration for event \"" + event.getName() + "\" is pending approval.");
        logEngagement(eventId, userId, "REGISTRATION");

        return RegistrationDtoMapper.toDto(newRegistration,
                fetchUserDetails(List.of(userId)).get(userId));
    }

    /**
     * {@inheritDoc}
     *
     * @throws RegistrationNotFoundException if no registration exists with the given ID
     */
    @Override
    public GenericResponse deleteRegistration(String actorId, String registrationId) {
        if (!registrationRepo.existsById(registrationId)) {
            throw new RegistrationNotFoundException(String.format("Registration with id '%s' not found", registrationId));
        }
        registrationRepo.deleteById(registrationId);
        log.info("Registration with id {} deleted by actor {}", registrationId, actorId);
        return new GenericResponse("Registration deleted successfully");
    }

    /**
     * {@inheritDoc}
     *
     * <p>Sets the registration status to {@link RegistrationStatus#CANCELLED}.</p>
     *
     * @throws RegistrationNotFoundException if no registration exists with the given ID
     */
    @Override
    public GenericResponse cancelRegistration(String actorId, String registrationId) {
        var registration = registrationRepo.findById(registrationId)
                .orElseThrow(() -> new RegistrationNotFoundException(String.format("Registration with id '%s' not found", registrationId)));
        registration.setStatus(RegistrationStatus.CANCELLED);
        registrationRepo.save(registration);
        log.info("Registration with id {} cancelled by actor {}", registrationId, actorId);

        notifyUser(registration.getAttendeeId(),
                "Your registration for event \"" + registration.getEvent().getName() + "\" has been cancelled.");

        return new GenericResponse("Registration cancelled successfully");
    }

    /**
     * {@inheritDoc}
     *
     * <p>Sets the registration status to {@link RegistrationStatus#CONFIRMED}.</p>
     *
     * @throws RegistrationNotFoundException if no registration exists with the given ID
     */
    @Override
    public GenericResponse approveRegistration(String actorId, String registrationId) {
        var registration = registrationRepo.findById(registrationId)
                .orElseThrow(() -> new RegistrationNotFoundException(String.format("Registration with id '%s' not found", registrationId)));
        registration.setStatus(RegistrationStatus.CONFIRMED);
        registrationRepo.save(registration);
        log.info("Registration with id {} approved by actor {}", registrationId, actorId);

        notifyUser(registration.getAttendeeId(),
                "Your registration for event \"" + registration.getEvent().getName() + "\" has been confirmed.");
        logEngagement(registration.getEvent().getEventId(), registration.getAttendeeId(), "REGISTRATION_CONFIRMATION");

        return new GenericResponse("Registration approved successfully");
    }

    /**
     * {@inheritDoc}
     *
     * <p>Only registrations in {@link RegistrationStatus#CONFIRMED} state may be checked in.
     * Sets the status to {@link RegistrationStatus#CHECKED_IN} on success.</p>
     *
     * @throws RegistrationNotFoundException      if no registration exists with the given ID
     * @throws InvalidRegistrationStatusException if the registration is not in CONFIRMED state
     */
    @Override
    public GenericResponse checkInRegistration(String actorId, String registrationId) {
        var registration = registrationRepo.findById(registrationId)
                .orElseThrow(() -> new RegistrationNotFoundException(String.format("Registration with id '%s' not found", registrationId)));
        if (registration.getStatus().equals(RegistrationStatus.CHECKED_IN)) {
            throw new InvalidRegistrationStatusException(
                    String.format("User already confirmed for event '%s'", registration.getEvent().getEventId()));
        }
        if (!registration.getStatus().equals(RegistrationStatus.CONFIRMED)) {
            throw new InvalidRegistrationStatusException(
                    String.format("User not confirmed for event '%s'", registration.getEvent().getEventId()));
        }
        registration.setStatus(RegistrationStatus.CHECKED_IN);
        registrationRepo.save(registration);
        log.info("Registration with id {} checked in by actor {}", registrationId, actorId);

        notifyUser(registration.getAttendeeId(),
                "You have successfully checked in to event \"" + registration.getEvent().getName() + "\".");
        logEngagement(registration.getEvent().getEventId(), registration.getAttendeeId(), "CHECK_IN");

        return new GenericResponse("Check-in successful");
    }

    /**
     * {@inheritDoc}
     *
     * <p>Sets the registration status to {@link RegistrationStatus#CANCELLED}.</p>
     *
     * @throws RegistrationNotFoundException if no registration exists with the given ID
     */
    @Override
    public GenericResponse rejectRegistration(String actorId, String registrationId) {
        var registration = registrationRepo.findById(registrationId)
                .orElseThrow(() -> new RegistrationNotFoundException(String.format("Registration with id '%s' not found", registrationId)));
        registration.setStatus(RegistrationStatus.CANCELLED);
        registrationRepo.save(registration);
        log.info("Registration with id {} rejected by actor {}", registrationId, actorId);

        notifyUser(registration.getAttendeeId(),
                "Your registration for event \"" + registration.getEvent().getName() + "\" has been rejected.");

        return new GenericResponse("Registration rejected successfully");
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public RegistrationListResponseDto getRegistrationsByUserId(String actorId, String userId, int size, int page) {
        var pageable = PageRequest.of(page, size);
        var pages = registrationRepo.findByAttendeeId(userId, pageable);
        var userDetailsMap = fetchUserDetails(pages.getContent().stream()
                .map(r -> r.getAttendeeId()).distinct().toList());
        var registrations = pages.getContent().stream()
                .map(r -> RegistrationDtoMapper.toDto(r, userDetailsMap.get(r.getAttendeeId())))
                .toList();
        log.info("Fetched {} registrations for userId: {} by actor: {}", registrations.size(), userId, actorId);
        return new RegistrationListResponseDto(
                registrations,
                pages.getNumber(),
                pages.getSize(),
                pages.getTotalElements(),
                pages.getTotalPages()
        );
    }

    /**
     * {@inheritDoc}
     *
     * <p>If {@code status} is null or empty, all registrations for the event are returned.
     * Otherwise, {@code status} is parsed as a {@link RegistrationStatus} enum value.</p>
     *
     * @throws RegistrationNotFoundException if {@code status} is not a valid {@link RegistrationStatus} value
     */
    @Override
    public RegistrationListResponseDto getRegistrationsByEventIdStatus(
            String actorId, String eventId, String status, String statuses, String ticketType, String attendeeName, int size, int page) {

        var specBuilder = RegistrationSpecification.builder()
                .eventId(eventId)
                .ticketType(ticketType);

        if (statuses != null && !statuses.isBlank()) {
            var statusList = java.util.Arrays.stream(statuses.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .map(s -> {
                        try {
                            return RegistrationStatus.valueOf(s);
                        } catch (IllegalArgumentException e) {
                            throw new RegistrationNotFoundException(String.format("Invalid status value '%s'", s));
                        }
                    })
                    .toList();
            specBuilder.statuses(statusList);
        } else if (status != null && !status.isBlank()) {
            try {
                RegistrationStatus.valueOf(status);
            } catch (IllegalArgumentException e) {
                throw new RegistrationNotFoundException(String.format("Invalid status value '%s'", status));
            }
            specBuilder.status(status);
        }

        var spec = specBuilder.build();

        if (attendeeName != null && !attendeeName.isEmpty()) {
            var all = registrationRepo.findAll(spec, PageRequest.of(0, Integer.MAX_VALUE));
            var userDetailsMap = fetchUserDetails(all.getContent().stream()
                    .map(Registration::getAttendeeId).distinct().toList());
            String term = attendeeName.toLowerCase();
            var filtered = all.getContent().stream()
                    .map(r -> RegistrationDtoMapper.toDto(r, userDetailsMap.get(r.getAttendeeId())))
                    .filter(r -> r.attendeeDetails() != null && (
                            r.attendeeDetails().name().toLowerCase().contains(term) ||
                            r.attendeeDetails().email().toLowerCase().contains(term)))
                    .toList();
            int start = page * size;
            var pageSlice = filtered.subList(
                    Math.min(start, filtered.size()),
                    Math.min(start + size, filtered.size()));
            int totalPages = size > 0 ? (int) Math.ceil((double) filtered.size() / size) : 0;
            log.info("Fetched {} registrations (name-filtered) for eventId: {} by actor: {}", filtered.size(), eventId, actorId);
            return new RegistrationListResponseDto(pageSlice, page, size, filtered.size(), totalPages);
        }

        var pages = registrationRepo.findAll(spec, PageRequest.of(page, size));
        var userDetailsMap = fetchUserDetails(pages.getContent().stream()
                .map(Registration::getAttendeeId).distinct().toList());
        var registrations = pages.getContent().stream()
                .map(r -> RegistrationDtoMapper.toDto(r, userDetailsMap.get(r.getAttendeeId())))
                .toList();
        log.info("Fetched {} registrations for eventId: {} by actor: {}", registrations.size(), eventId, actorId);
        return new RegistrationListResponseDto(
                registrations,
                pages.getNumber(),
                pages.getSize(),
                pages.getTotalElements(),
                pages.getTotalPages()
        );
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public RegistrationListResponseDto getAllRegistrations(String actorId, int size, int page) {
        var pageable = PageRequest.of(page, size);
        var pages = registrationRepo.findAll(pageable);
        var userDetailsMap = fetchUserDetails(pages.getContent().stream()
                .map(r -> r.getAttendeeId()).distinct().toList());
        var registrations = pages.getContent().stream()
                .map(r -> RegistrationDtoMapper.toDto(r, userDetailsMap.get(r.getAttendeeId())))
                .toList();
        log.info("Fetched {} registrations by actor: {}", registrations.size(), actorId);
        return new RegistrationListResponseDto(
                registrations,
                pages.getNumber(),
                pages.getSize(),
                pages.getTotalElements(),
                pages.getTotalPages()
        );
    }

    /**
     * {@inheritDoc}
     *
     * @throws RegistrationNotFoundException if no registration exists with the given ID
     */
    @Override
    public RegistrationDto getRegistrationById(String actorId, String registrationId) {
        var registration = registrationRepo.findById(registrationId)
                .orElseThrow(() -> new RegistrationNotFoundException(String.format("Registration with id '%s' not found", registrationId)));
        log.info("Fetched registration with id: {} by actor: {}", registrationId, actorId);
        return RegistrationDtoMapper.toDto(registration,
                fetchUserDetails(List.of(registration.getAttendeeId())).get(registration.getAttendeeId()));
    }

    /**
     * {@inheritDoc}
     *
     * @throws RegistrationNotFoundException if no registration exists for the given event and user combination
     */
    @Override
    public RegistrationDto getRegistrationByEventIdAndUserId(String actorId, String eventId, String userId) {
        var registration = registrationRepo.findByAttendeeIdAndEventEventId(userId, eventId)
                .orElseThrow(() -> new RegistrationNotFoundException(
                        String.format("Registration for eventId: '%s' and userId: '%s' not found", eventId, userId)));
        log.info("Fetched registration for userId: {}, eventId: {} by actor: {}", userId, eventId, actorId);
        return RegistrationDtoMapper.toDto(registration,
                fetchUserDetails(List.of(registration.getAttendeeId())).get(registration.getAttendeeId()));
    }

    /**
     * Fetches user details for the given IDs from auth-manager and returns them
     * keyed by {@code userId}. On failure the map is empty and {@code attendeeDetails}
     * will be {@code null} in the returned DTOs.
     *
     * @param userIds the list of user UUIDs to look up
     * @return a map of userId → {@link UserDetailsDto}
     */
    private Map<String, UserDetailsDto> fetchUserDetails(List<String> userIds) {
        try {
            return userServiceClient.getUserDetails(userIds).stream()
                    .collect(Collectors.toMap(UserDetailsDto::userId, Function.identity()));
        } catch (FeignException e) {
            log.warn("Failed to fetch user details: {}", e.getMessage());
            return Map.of();
        }
    }

    /**
     * Dispatches a notification to the given user via the log-manager.
     * Failures are logged and swallowed so the caller's operation is never interrupted.
     *
     * @param userId  the ID of the user to notify
     * @param message the notification message body
     */
    private void notifyUser(String userId, String message) {
        try {
            logServiceClient.sendNotification(userId, message, NOTIFICATION_CATEGORY);
        } catch (FeignException e) {
            log.warn("Failed to send notification to user {}: {}", userId, e.getMessage());
        }
    }

    /**
     * Logs an engagement activity to engagement-manager via the internal service endpoint.
     * Fire-and-forget — failures are logged as warnings and never interrupt the main operation.
     *
     * @param eventId    the event the activity belongs to
     * @param attendeeId the attendee performing or receiving the activity
     * @param activity   the engagement type string (e.g. "REGISTRATION", "CHECK_IN")
     */
    private void logEngagement(String eventId, String attendeeId, String activity) {
        try {
            engagementServiceClient.logEngagement(
                    new EngagementLogDto(eventId, attendeeId, activity, LocalDateTime.now(), null)
            );
            log.debug("Logged engagement activity={} for attendee={} event={}", activity, attendeeId, eventId);
        } catch (FeignException e) {
            log.warn("Failed to log engagement activity={} for attendee={}: {}", activity, attendeeId, e.getMessage());
        }
    }

}
