package com.cts.ticketmanager.exceptions;

public class DuplicateRegistrationException extends RuntimeException {
    public DuplicateRegistrationException(String attendeeId, String eventId) {
        super(String.format("Attendee '%s' is already registered for event '%s'", attendeeId, eventId));
    }
}
