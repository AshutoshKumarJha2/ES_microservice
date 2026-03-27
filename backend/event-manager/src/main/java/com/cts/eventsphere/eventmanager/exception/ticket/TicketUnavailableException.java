package com.cts.eventsphere.eventmanager.exception.ticket;

/**
 * Thrown when no available tickets exist for an event.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-26
 */
public class TicketUnavailableException extends RuntimeException {
    public TicketUnavailableException(String eventId) {
        super(String.format("No available tickets for event with id '%s'", eventId));
    }
}
