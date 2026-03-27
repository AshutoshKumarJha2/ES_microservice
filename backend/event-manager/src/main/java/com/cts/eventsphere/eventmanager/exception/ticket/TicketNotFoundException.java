package com.cts.eventsphere.eventmanager.exception.ticket;

/**
 * Thrown when a requested ticket cannot be found.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-26
 */
public class TicketNotFoundException extends RuntimeException {
    public TicketNotFoundException(String ticketId) {
        super(String.format("Ticket with id '%s' not found", ticketId));
    }
}
