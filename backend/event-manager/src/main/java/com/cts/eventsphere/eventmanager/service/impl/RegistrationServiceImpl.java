package com.cts.eventsphere.eventmanager.service.impl;

import com.cts.eventsphere.eventmanager.client.LogServiceClient;
import com.cts.eventsphere.eventmanager.client.UserServiceClient;
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
import com.cts.eventsphere.eventmanager.repository.TicketRepository;
import com.cts.eventsphere.eventmanager.service.RegistrationService;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

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
    public RegistrationListResponseDto getRegistrationsByEventIdStatus(String actorId, String eventId, String status, int size, int page) {
        var pageable = PageRequest.of(page, size);
        Page<Registration> pages;
        if (status == null || status.isEmpty()) {
            pages = registrationRepo.findByEventEventId(eventId, pageable);
        } else {
            RegistrationStatus statusEnum;
            try {
                statusEnum = RegistrationStatus.valueOf(status);
            } catch (IllegalArgumentException e) {
                throw new RegistrationNotFoundException(String.format("Invalid status value '%s'", status));
            }
            pages = registrationRepo.findByEventEventIdAndStatus(eventId, statusEnum, pageable);
        }
        var userDetailsMap = fetchUserDetails(pages.getContent().stream()
                .map(r -> r.getAttendeeId()).distinct().toList());
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

}
