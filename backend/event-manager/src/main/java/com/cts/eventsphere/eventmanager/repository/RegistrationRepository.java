package com.cts.eventsphere.eventmanager.repository;

import com.cts.eventsphere.eventmanager.model.Registration;
import com.cts.eventsphere.eventmanager.model.data.RegistrationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * JPA Repository for the {@link Registration} entity.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-26
 */
@Repository
public interface RegistrationRepository extends JpaRepository<Registration, String> {

    /**
     * Retrieves a paginated list of all registrations for the given event.
     *
     * @param eventId  the ID of the event
     * @param pageable pagination and sorting information
     * @return page of registrations for the event
     */
    Page<Registration> findByEventEventId(String eventId, Pageable pageable);

    /**
     * Retrieves a paginated list of registrations for the given event filtered by status.
     *
     * @param eventId  the ID of the event
     * @param status   the registration status to filter by
     * @param pageable pagination and sorting information
     * @return page of registrations matching the event and status
     */
    Page<Registration> findByEventEventIdAndStatus(String eventId, RegistrationStatus status, Pageable pageable);

    /**
     * Retrieves a paginated list of registrations made by the given attendee.
     *
     * @param attendeeId the ID of the attendee
     * @param pageable   pagination and sorting information
     * @return page of registrations for the attendee
     */
    Page<Registration> findByAttendeeId(String attendeeId, Pageable pageable);

    /**
     * Checks whether a registration already exists for the given event and attendee.
     *
     * @param eventId    the ID of the event
     * @param attendeeId the ID of the attendee
     * @return {@code true} if a registration exists, {@code false} otherwise
     */
    boolean existsByEventEventIdAndAttendeeId(String eventId, String attendeeId);

    /**
     * Finds a registration by attendee ID and event ID.
     *
     * @param attendeeId the ID of the attendee
     * @param eventId    the ID of the event
     * @return an {@link Optional} containing the matching registration, or empty if not found
     */
    Optional<Registration> findByAttendeeIdAndEventEventId(String attendeeId, String eventId);
}
