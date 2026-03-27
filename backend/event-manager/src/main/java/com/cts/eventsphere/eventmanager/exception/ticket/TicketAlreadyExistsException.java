package com.cts.eventsphere.eventmanager.exception.ticket;

/**
 * Thrown when attempting to create a ticket type that already exists for an event.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-26
 */
public class TicketAlreadyExistsException extends RuntimeException {
    public TicketAlreadyExistsException(String message) {
        super(message);
    }
}
