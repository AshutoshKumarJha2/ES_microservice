package com.cts.eventsphere.eventmanager.repository;

import com.cts.eventsphere.eventmanager.model.Ticket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * JPA Repository for the {@link Ticket} entity.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-26
 */
@Repository
public interface TicketRepository extends JpaRepository<Ticket, String> {

    /**
     * Retrieves a paginated list of tickets associated with the given event.
     *
     * @param eventId     the ID of the event
     * @param pageRequest pagination information
     * @return page of tickets for the event
     */
    Page<Ticket> findByEventEventId(String eventId, PageRequest pageRequest);

    /**
     * Finds a ticket by event ID and ticket type.
     * Used to enforce uniqueness of ticket types per event.
     *
     * @param eventId the ID of the event
     * @param type    the ticket type (e.g., "vip", "general")
     * @return an {@link Optional} containing the matching ticket, or empty if not found
     */
    Optional<Ticket> findByEventEventIdAndType(String eventId, String type);
}
