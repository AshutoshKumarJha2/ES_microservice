package com.cts.eventsphere.eventmanager.exception.schedule;

/**
 * Exception raised when schedule is not found.
 * * @author 2479623
 *
 * @version 1.0
 * @since 25-03-2026
 */
public class ScheduleNotFoundException extends RuntimeException {
    /**
     * Constructs a new ScheduleNotFoundException with a detailed message.
     * This exception is thrown when a schedule lookup fails and the schedule
     * with the specified ID cannot be found in the system.
     *
     * @param id the unique identifier of the schedule that could not be found
     */
    public ScheduleNotFoundException(String id) {
        super("Could not find schedule with ID: " + id);
    }
}