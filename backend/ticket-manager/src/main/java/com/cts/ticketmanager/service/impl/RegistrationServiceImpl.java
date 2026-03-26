package com.cts.ticketmanager.service.impl;

import com.cts.ticketmanager.dto.mapper.registration.RegistrationDTOMapper;
import com.cts.ticketmanager.dto.registration.RegistrationListResponseDTO;
import com.cts.ticketmanager.dto.shared.GenericResponse;
import com.cts.ticketmanager.exceptions.DuplicateRegistrationException;
import com.cts.ticketmanager.exceptions.InvalidRegistrationStatusException;
import com.cts.ticketmanager.exceptions.RegistrationNotFoundException;
import com.cts.ticketmanager.exceptions.TicketNotFoundException;
import com.cts.ticketmanager.models.Registration;
import com.cts.ticketmanager.models.data.RegistrationStatus;
import com.cts.ticketmanager.repositories.RegistrationRepository;
import com.cts.ticketmanager.repositories.TicketRepository;
import com.cts.ticketmanager.service.RegistrationService;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

/**
 * Implementation of {@link RegistrationService} for managing event registrations.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-08
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RegistrationServiceImpl implements RegistrationService {
    private final RegistrationRepository registrationRepo;
    private final EntityManager entityManager;
//    private final NotificationService notificationService;
//    private final AuditService auditService;
//    private final EventRepository eventRepository;
    private final TicketRepository ticketRepository;

    /**
     * Registers a user for an event with a specific ticket.
     *
     * @param userId   The unique identifier of the user.
     * @param eventId  The unique identifier of the event.
     * @param ticketId The unique identifier of the selected ticket.
     * @return A {@link GenericResponse} indicating successful registration.
     * @throws DuplicateRegistrationException if the user is already registered for the event.
     */
    @Override
    public GenericResponse registerForEvent(String userId, String eventId, String ticketId) {
        if (registrationRepo.existsByEventIdAndAttendeeId(eventId, userId)) {
            throw new DuplicateRegistrationException(userId, eventId);
        }
//        var event = eventRepository.findById(eventId).orElseThrow(() -> new EventNotFoundException(eventId));
        // TODO: check for event existence
        var ticket = ticketRepository.findById(ticketId).orElseThrow(() -> new TicketNotFoundException(ticketId));
        var newRegistration = Registration.builder()
                .attendeeId(userId)
                .eventId(eventId)
                .ticket(ticket)
                .status(RegistrationStatus.PENDING)
                .build();
        registrationRepo.save(newRegistration);
        log.info("User {} registered for event {} with ticket {}", userId, eventId, ticketId);
//        try {
//            notificationService.sendNotification(userId, String.format("Successfully registered for event %s with ticket %s", event.getName(), ticket.getType()), "EVENT");
//            auditService.logAudit(userId, AuditAction.CREATE, Registration.class, newRegistration.getRegistrationId());
            // TODO: Add notification and logging
//        } catch (Exception e) {
//            log.error(e.getMessage());
//        }
        return new GenericResponse("Registration successful");
    }

    /**
     * Permanently deletes a registration record from the system.
     *
     * @param actorId        The unique identifier of the actor.
     * @param registrationId The unique identifier of the registration.
     * @return A {@link GenericResponse} indicating successful deletion.
     * @throws RegistrationNotFoundException if the registration ID does not exist.
     */
    @Override
    public GenericResponse deleteRegistration(String actorId, String registrationId) {
        var registration = registrationRepo.findById(registrationId).orElseThrow(() -> new RegistrationNotFoundException(registrationId));
        registrationRepo.deleteById(registrationId);

        log.info("Registration with id {} deleted by actor {}", registrationId, actorId);

//        auditService.logAudit(actorId, AuditAction.DELETE, Registration.class, registrationId);
//        try {
//            log.info("Registration with id {} deleted by actor {}", registrationId, actorId);
//            notificationService.sendNotification(registration.getAttendee().getUserId(), String.format("Your registration for event %s with ticket type %s has been removed", registration.getEvent().getName(), registration.getTicket().getType()), "REGISTRATION");
//        } catch (Exception e) {
//            log.error(e.getMessage());
//        }

        return new GenericResponse("Registration deleted successfully");
    }

    /**
     * Cancels a registration by updating its status.
     *
     * @param actorId        The unique identifier of the actor.
     * @param registrationId The unique identifier of the registration.
     * @return A {@link GenericResponse} indicating successful cancellation.
     * @throws RegistrationNotFoundException if the registration ID does not exist.
     */
    @Override
    public GenericResponse cancelRegistration(String actorId, String registrationId) {
        var registration = registrationRepo.findById(registrationId)
                .orElseThrow(() -> new RegistrationNotFoundException(registrationId));
        registration.setStatus(RegistrationStatus.CANCELLED);
        registrationRepo.save(registration);
//        try {
//            auditService.logAudit(actorId, AuditAction.CANCEL, Registration.class, registrationId);
//            notificationService.sendNotification(registration.getAttendee().getUserId(), String.format("Your registration for event %s has been cancelled", registration.getEvent().getName()), "REGISTRATION");
//        } catch (Exception e) {
//            log.error(e.getMessage());
//        }
        log.info("Registration with id {} cancelled by actor {}", registrationId, actorId);
        return new GenericResponse("Registration cancelled successfully");
    }

    /**
     * Approves a registration, changing its status to confirmed.
     *
     * @param actorId        The unique identifier of the actor.
     * @param registrationId The unique identifier of the registration.
     * @return A {@link GenericResponse} indicating successful approval.
     * @throws RegistrationNotFoundException if the registration ID does not exist.
     */
    @Override
    public GenericResponse approveRegistration(String actorId, String registrationId) {
        var registration = registrationRepo.findById(registrationId)
                .orElseThrow(() -> new RegistrationNotFoundException(registrationId));
        registration.setStatus(RegistrationStatus.CONFIRMED);
        registrationRepo.save(registration);
//        try {
//            auditService.logAudit(actorId, AuditAction.APPROVE, Registration.class, registrationId);
//            notificationService.sendNotification(registration.getAttendee().getUserId(), String.format("Your registration for event %s has been approved", registration.getEvent().getName()), "REGISTRATION");
//        } catch (Exception e){
//            log.error(e.getMessage());
//        }
        log.info("Registration with id {} approved by actor {}", registrationId, actorId);
        return new GenericResponse("Registration approved successfully");
    }

    /**
     * check in a approved registration, changing its status to confirmed.
     *
     * @param actorId        The unique identifier of the actor.
     * @param registrationId The unique identifier of the registration.
     * @return A {@link GenericResponse} indicating successful approval.
     * @throws RegistrationNotFoundException if the registration ID does not exist.
     */
    @Override
    public GenericResponse checkInRegistration(String actorId, String registrationId) {
        var registration = registrationRepo.findById(registrationId)
                .orElseThrow(() -> new RegistrationNotFoundException(registrationId));
        if (!registration.getStatus().equals(RegistrationStatus.CONFIRMED)){
            throw new InvalidRegistrationStatusException(String.format("User not confirmed for this event %s", registration.getEventId()));
        }
        registration.setStatus(RegistrationStatus.CHECKED_IN);
        registrationRepo.save(registration);
//        try {
//            auditService.logAudit(actorId, AuditAction.APPROVE, Registration.class, registrationId);
//            notificationService.sendNotification(registration.getAttendee().getUserId(), String.format("You have been checked into the event %s", registration.getEvent().getName()), "REGISTRATION");
//        } catch (Exception e){
//            log.error(e.getMessage());
//        }
        log.info("Registration with id {} checked in by actor {}", registrationId, actorId);
        return new GenericResponse("Registration approved successfully");
    }

    /**
     * Rejects a registration, changing its status to cancelled.
     *
     * @param actorId        The unique identifier of the actor.
     * @param registrationId The unique identifier of the registration.
     * @return A {@link GenericResponse} indicating successful rejection.
     * @throws RegistrationNotFoundException if the registration ID does not exist.
     */
    @Override
    public GenericResponse rejectRegistration(String actorId, String registrationId) {
        var registration = registrationRepo.findById(registrationId)
                .orElseThrow(() -> new RegistrationNotFoundException(String.format("Registration with id %s not found", registrationId)));
        registration.setStatus(RegistrationStatus.CANCELLED);
        registrationRepo.save(registration);
//        try {
//            auditService.logAudit(actorId, AuditAction.REJECT, Registration.class, registrationId);
//            notificationService.sendNotification(registration.getAttendee().getUserId(), String.format("Your registration for event %s has been rejected", registration.getEvent().getName()), "REGISTRATION");
//        } catch (Exception e) {
//            log.error(e.getMessage());
//        }
        log.info("Registration with id {} rejected by actor {}", registrationId, actorId);
        return new GenericResponse("Registration rejected successfully");
    }

    /**
     * Retrieves a paginated list of registrations for a specific user.
     *
     * @param actorId The unique identifier of the actor.
     * @param userId  The unique identifier of the attendee.
     * @param size    The page size.
     * @param page    The page number.
     * @return A {@link RegistrationListResponseDTO} containing the user's registrations.
     */
    @Override
    public RegistrationListResponseDTO getRegistrationsByUserId(String actorId, String userId, int size, int page) {
        var pagable = PageRequest.of(page, size);
        var pages = registrationRepo.findByAttendeeId(userId, pagable);
        var registrations = pages.getContent().stream()
//                .peek(registration -> auditService.logAudit(actorId, AuditAction.READ, Registration.class, registration.getRegistrationId()))
                .map(RegistrationDTOMapper::toDTO)
                .toList();

        log.info("Fetched {} registrations for userId: {} by actor: {}", registrations.size(), userId, actorId);

        return new RegistrationListResponseDTO(
                registrations,
                pages.getNumber(),
                pages.getSize(),
                pages.getTotalElements(),
                pages.getTotalPages()
        );
    }

    /**
     * Retrieves a paginated list of all registrations for a specific event.
     *
     * @param actorId The unique identifier of the actor.
     * @param eventId The unique identifier of the event.
     * @param status  Status of registration. null for all registrations.
     * @param size    The page size.
     * @param page    The page number.
     * @return A {@link RegistrationListResponseDTO} containing registrations for the event.
     */
    @Override
    public RegistrationListResponseDTO getRegistrationsByEventIdStatus(String actorId, String eventId, String status, int size, int page) {
        var pagable = PageRequest.of(page, size);
        Page<Registration> pages;
        if (status == null || status.isEmpty()) {
            pages = registrationRepo.findByEventId(eventId, pagable);
        } else {
            RegistrationStatus statusEnum;
            try {
                statusEnum = RegistrationStatus.valueOf(status);
            } catch (IllegalArgumentException e) {
                throw new RegistrationNotFoundException(String.format("Invalid query parameter %s", status));
            }
            pages = registrationRepo.findByEventEventIdAndStatus(eventId, statusEnum, pagable);
        }

        var registrations = pages.getContent().stream()
                .peek(registration -> auditService.logAudit(actorId, AuditAction.READ, Registration.class, registration.getRegistrationId()))
                .map(RegistrationDTOMapper::toDTO)
                .toList();
        log.info("Fetched {} registrations for eventId: {} by actor: {}", registrations.size(), eventId, actorId);

        return new RegistrationListResponseDTO(
                registrations,
                pages.getNumber(),
                pages.getSize(),
                pages.getTotalElements(),
                pages.getTotalPages()
        );
    }

    /**
     * Retrieves a paginated list of all registrations in the system.
     *
     * @param actorId The unique identifier of the actor.
     * @param size    The page size.
     * @param page    The page number.
     * @return A {@link RegistrationListResponseDTO} containing all registrations.
     */
    @Override
    public RegistrationListResponseDTO getAllRegistrations(String actorId, int size, int page) {
        var pagable = PageRequest.of(page, size);
        var pages = registrationRepo.findAll(pagable);
        var registrations = pages.getContent()
                .stream()
                .peek(registration -> auditService.logAudit(actorId, AuditAction.READ, Registration.class, registration.getRegistrationId()))
                .map(RegistrationDTOMapper::toDTO).toList();

        log.info("Fetched {} registrations by actor: {}", registrations.size(), actorId);

        return new RegistrationListResponseDTO(
                registrations,
                pages.getNumber(),
                pages.getSize(),
                pages.getTotalElements(),
                pages.getTotalPages()
        );
    }

    /**
     * Retrieves the details of a specific registration by its ID.
     *
     * @param actorId        The unique identifier of the actor.
     * @param registrationId The unique identifier of the registration.
     * @return The {@link RegistrationDTO} representation of the registration.
     * @throws RegistrationNotFoundException if the registration ID does not exist.
     */
    @Override
    public RegistrationDTO getRegistrationById(String actorId, String registrationId) {
        var registration = registrationRepo.findById(registrationId)
                .orElseThrow(() -> new RegistrationNotFoundException(String.format("Registration with id %s not found", registrationId)));

        auditService.logAudit(actorId, AuditAction.READ, Registration.class, registrationId);
        log.info("Fetched registration with id: {} by actor: {}", registrationId, actorId);
        return RegistrationDTOMapper.toDTO(registration);
    }

    /**
     * Retrieves a registration record for a specific user and event combination.
     *
     * @param actorId The unique identifier of the actor.
     * @param eventId The unique identifier of the event.
     * @param userId  The unique identifier of the user.
     * @return The {@link RegistrationDTO} representation of the registration.
     * @throws RegistrationNotFoundException if no registration is found for the user and event.
     */
    @Override
    public RegistrationDTO getRegistrationByEventIdAndUserId(String actorId, String eventId, String userId) {
        var registration = registrationRepo.findByAttendeeUserIdAndEventEventId(userId, eventId)
                .orElseThrow(() -> new RegistrationNotFoundException(String.format("Registration with eventId: %s and userId: %s not found", eventId, userId)));

        auditService.logAudit(actorId, AuditAction.READ, Registration.class, registration.getRegistrationId());
        log.info("Fetched registration for userId: {}, eventId: {} by actor: {}", userId, eventId, actorId);
        return RegistrationDTOMapper.toDTO(registration);
    }
}