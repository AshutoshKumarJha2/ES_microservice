package com.cts.eventsphere.eventmanager.exception.event;

/**
 * Exception raised when Event is not found.
 * * @author 2479623
 *
 * @version 1.0
 * @since 25-03-2026
 */
public class EventNotFoundException extends RuntimeException {
    /**
     * Constructs a new EventNotFoundException with a detailed message.
     * This exception is thrown when an event lookup fails and the event
     * with the specified ID cannot be found in the system.
     *
     * @param id the unique identifier of the event that could not be found
     */
    public EventNotFoundException(String id) {
        super("Could not find event with ID: " + id);
    }
}