package com.cts.eventsphere.eventmanager.service;

import com.cts.eventsphere.eventmanager.dto.registration.RegistrationDto;
import com.cts.eventsphere.eventmanager.dto.registration.RegistrationListResponseDto;
import com.cts.eventsphere.eventmanager.dto.shared.GenericResponse;

/**
 * Service interface for managing event registrations.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-26
 */
public interface RegistrationService {

    /**
     * Registers a user for a specific event with a chosen ticket.
     *
     * @param userId   the ID of the attendee
     * @param eventId  the ID of the event
     * @param ticketId the ID of the selected ticket
     * @return a {@link GenericResponse} indicating the result
     */
    GenericResponse registerForEvent(String userId, String eventId, String ticketId);

    /**
     * Retrieves a registration by its unique identifier.
     *
     * @param actorId        the ID of the actor making the request
     * @param registrationId the ID of the registration
     * @return a {@link RegistrationDto} containing registration details
     */
    RegistrationDto getRegistrationById(String actorId, String registrationId);

    /**
     * Retrieves a registration for a specific attendee and event combination.
     *
     * @param actorId the ID of the actor making the request
     * @param eventId the ID of the event
     * @param userId  the ID of the attendee
     * @return a {@link RegistrationDto} representing the registration
     */
    RegistrationDto getRegistrationByEventIdAndUserId(String actorId, String eventId, String userId);

    /**
     * Permanently deletes a registration record.
     *
     * @param actorId        the ID of the actor performing the deletion
     * @param registrationId the ID of the registration to delete
     * @return a {@link GenericResponse} indicating the result
     */
    GenericResponse deleteRegistration(String actorId, String registrationId);

    /**
     * Cancels a registration, typically initiated by the attendee.
     *
     * @param actorId        the ID of the actor performing the cancellation
     * @param registrationId the ID of the registration to cancel
     * @return a {@link GenericResponse} indicating the result
     */
    GenericResponse cancelRegistration(String actorId, String registrationId);

    /**
     * Approves a pending registration, changing its status to CONFIRMED.
     *
     * @param actorId        the ID of the actor performing the approval
     * @param registrationId the ID of the registration to approve
     * @return a {@link GenericResponse} indicating the result
     */
    GenericResponse approveRegistration(String actorId, String registrationId);

    /**
     * Checks in a CONFIRMED registration, changing its status to CHECKED_IN.
     *
     * @param actorId        the ID of the actor performing the check-in
     * @param registrationId the ID of the registration to check in
     * @return a {@link GenericResponse} indicating the result
     */
    GenericResponse checkInRegistration(String actorId, String registrationId);

    /**
     * Rejects a registration, changing its status to CANCELLED.
     *
     * @param actorId        the ID of the actor performing the rejection
     * @param registrationId the ID of the registration to reject
     * @return a {@link GenericResponse} indicating the result
     */
    GenericResponse rejectRegistration(String actorId, String registrationId);

    /**
     * Retrieves a paginated list of registrations for a specific attendee.
     *
     * @param actorId the ID of the actor making the request
     * @param userId  the ID of the attendee
     * @param size    the number of records per page
     * @param page    the page number (zero-based)
     * @return a {@link RegistrationListResponseDto} containing the attendee's registrations
     */
    RegistrationListResponseDto getRegistrationsByUserId(String actorId, String userId, int size, int page);

    /**
     * Retrieves a paginated list of registrations for a specific event, optionally filtered by status.
     *
     * @param actorId the ID of the actor making the request
     * @param eventId the ID of the event
     * @param status  the registration status to filter by, or {@code null} for all
     * @param size    the number of records per page
     * @param page    the page number (zero-based)
     * @return a {@link RegistrationListResponseDto} containing the event's registrations
     */
    RegistrationListResponseDto getRegistrationsByEventIdStatus(String actorId, String eventId, String status, int size, int page);

    /**
     * Retrieves a paginated list of all registrations in the system.
     *
     * @param actorId the ID of the actor making the request
     * @param size    the number of records per page
     * @param page    the page number (zero-based)
     * @return a {@link RegistrationListResponseDto} containing all registrations
     */
    RegistrationListResponseDto getAllRegistrations(String actorId, int size, int page);
}
