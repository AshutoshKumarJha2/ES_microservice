package com.cts.ticketmanager.repositories;

import com.cts.ticketmanager.models.Registration;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for {@link com.cts.ticketmanager.models.Registration} entity.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-25
 */
@Repository
public interface RegistrationRepository extends JpaRepository<Registration, String> {

    /**
     * Retrieves a paginated list of registrations for the given event.
     *
     * @param eventId  the ID of the event
     * @param pageable pagination and sorting information
     * @return page of registrations for the event
     */
    Page<Registration> findByEventId(String eventId, Pageable pageable);

    /**
     * Retrieves a paginated list of registrations made by the given attendee.
     *
     * @param attendeeId the ID of the attendee
     * @param pageable   pagination and sorting information
     * @return page of registrations for the attendee
     */
    Page<Registration> findByAttendeeId(String attendeeId, Pageable pageable);

    /**
     * Checks whether a registration already exists for the given event and attendee combination.
     *
     * @param eventId    the ID of the event
     * @param attendeeId the ID of the attendee
     * @return {@code true} if a registration exists, {@code false} otherwise
     */
    boolean existsByEventIdAndAttendeeId(String eventId, String attendeeId);

}
