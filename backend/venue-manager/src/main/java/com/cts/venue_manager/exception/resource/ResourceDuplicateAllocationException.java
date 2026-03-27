package com.cts.venue_manager.exception.resource;

import lombok.extern.slf4j.Slf4j;

/**
 * Exception thrown when a resource is assigned to the same event or venue
 * more than once within a single transaction context.
 *
 * @author 2479476
 * @version 1.0
 * @since 2026-03-26
 */
@Slf4j
public class ResourceDuplicateAllocationException extends RuntimeException {

    /**
     * Constructs a new instance of ResourceDuplicateAllocationException.
     * Sets the error context and logs the specific allocation conflict
     * to prevent redundant data entry.
     *
     * @param message details regarding the duplicate allocation attempt
     */
    public ResourceDuplicateAllocationException(String message) {
        super(message);
        log.error(message);
    }
}