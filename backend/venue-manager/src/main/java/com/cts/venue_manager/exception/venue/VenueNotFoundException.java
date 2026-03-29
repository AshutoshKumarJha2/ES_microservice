package com.cts.venue_manager.exception.venue;

import lombok.extern.slf4j.Slf4j;

/**
 * Custom runtime exception thrown when a requested venue cannot be located in the system.
 * This class facilitates specific error handling for venue-related operations and
 * automatically logs the error details for troubleshooting.
 *
 * @author 2479476
 * @version 1.0
 * @since 2026-03-26
 */
@Slf4j
public class VenueNotFoundException extends RuntimeException {

    /**
     * Constructs a new instance of VenueNotFoundException.
     * Passes the error message to the parent RuntimeException and triggers
     * a SLF4J error log for system monitoring.
     *
     * @param msg description of the specific venue lookup failure
     */
    public VenueNotFoundException(String msg) {
        super(msg);
        log.error("Venue Not Found - {}", msg);
    }
}