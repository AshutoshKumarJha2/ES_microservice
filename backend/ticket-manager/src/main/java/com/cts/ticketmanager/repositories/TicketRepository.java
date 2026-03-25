package com.cts.ticketmanager.repositories;

import com.cts.ticketmanager.models.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for {@link com.cts.ticketmanager.models.Ticket} entity.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-25
 */
@Repository
public interface TicketRepository extends JpaRepository<Ticket, String> {

    /**
     * Retrieves all tickets associated with the given event.
     *
     * @param eventId the ID of the event
     * @return list of tickets for the event
     */
    List<Ticket> findByEventId(String eventId);

}
