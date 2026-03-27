package com.cts.venue_manager.exception.resource;

import lombok.extern.slf4j.Slf4j;

/**
 * Exception thrown when a specific resource lookup fails to return any results.
 * This is typically used during service-level operations where a resource
 * ID is expected to exist but does not.
 *
 * @author 2479476
 * @version 1.0
 * @since 2026-03-26
 */
@Slf4j
public class ResourceNotFoundException extends RuntimeException {

    /**
     * Constructs a new instance of ResourceNotFoundException.
     * Passes the error message to the superclass and triggers an error-level
     * log for tracking missing resource dependencies.
     *
     * @param message the identifier or reason for the missing resource
     */
    public ResourceNotFoundException(String message) {
        super(message);
        log.error(message);
    }
}