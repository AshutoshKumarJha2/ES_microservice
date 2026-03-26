package com.cts.ticketmanager.exceptions;

public class TicketUnavailableException extends RuntimeException {
    public TicketUnavailableException(String eventId) {
        super(String.format("No available tickets for event with id '%s'", eventId));
    }
}
