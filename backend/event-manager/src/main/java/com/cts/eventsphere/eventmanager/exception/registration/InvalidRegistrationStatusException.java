package com.cts.eventsphere.eventmanager.exception.registration;

/**
 * Thrown when a registration status transition is not permitted
 * (e.g., attempting to check in a registration that is not CONFIRMED).
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-26
 */
public class InvalidRegistrationStatusException extends RuntimeException {
    public InvalidRegistrationStatusException(String message) {
        super(message);
    }
}
