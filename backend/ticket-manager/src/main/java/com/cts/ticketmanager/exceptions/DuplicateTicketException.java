package com.cts.ticketmanager.exceptions;

public class DuplicateTicketException extends RuntimeException {
    public DuplicateTicketException(String type) {
        super(String.format("Ticket with id '%s' already exists", type));
    }
}
