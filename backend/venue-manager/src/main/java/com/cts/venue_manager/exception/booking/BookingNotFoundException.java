package com.cts.venue_manager.exception.booking;

import lombok.extern.slf4j.Slf4j;

/**
 * Exception thrown when a requested booking record cannot be retrieved from the database.
 * This class ensures that booking-related lookup failures are handled consistently
 * and logged for audit and troubleshooting purposes.
 *
 * @author 2479476
 * @version 1.0
 * @since 2026-03-26
 */
@Slf4j
public class BookingNotFoundException extends RuntimeException {

    /**
     * Constructs a new instance of BookingNotFoundException.
     * Initializes the exception with a specific error message and triggers
     * an error-level log to record the failed lookup attempt.
     *
     * @param msg description of the missing booking or lookup criteria
     */
    public BookingNotFoundException(String msg){
        super(msg);
        log.error(msg);
    }
}