package com.cts.eventsphere.eventmanager.exception.registration;

/**
 * Thrown when a requested registration cannot be found.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-26
 */
public class RegistrationNotFoundException extends RuntimeException {
    public RegistrationNotFoundException(String message) {
        super(message);
    }
}
