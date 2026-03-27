package com.cts.eventsphere.expensemanager.exception;

/**
 * Thrown when the Finance Service cannot reach or gets an
 * unexpected response from the Event Service via Feign.
 *
 * @author 2480081
 * @version 1.0
 * @since 25-03-2026
 */
public class EventServiceException extends RuntimeException {

    public EventServiceException(String message) {
        super(message);
    }

    public EventServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}