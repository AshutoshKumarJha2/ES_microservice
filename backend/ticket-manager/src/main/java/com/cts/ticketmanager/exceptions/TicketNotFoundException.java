package com.cts.ticketmanager.exceptions;

public class TicketNotFoundException extends RuntimeException {
    public TicketNotFoundException(String ticketId) {
        super(String.format("Ticket with id '%s' not found", ticketId));
    }
}
