package com.cts.eventsphere.eventmanager.exception.registration;

/**
 * Thrown when an attendee attempts to register for an event they are already registered for.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-26
 */
public class DuplicateRegistrationException extends RuntimeException {
    public DuplicateRegistrationException(String attendeeId, String eventId) {
        super(String.format("Attendee '%s' is already registered for event '%s'", attendeeId, eventId));
    }
}
