package com.cts.venue_manager.exception.resource;

import lombok.extern.slf4j.Slf4j;

/**
 * Exception thrown when a resource request exceeds the available quantity or capacity.
 * This ensures that over-allocation of equipment or staff is prevented during the
 * booking or allocation process.
 *
 * @author 2479476
 * @version 1.0
 * @since 2026-03-26
 */
@Slf4j
public class InsufficientResourceException extends RuntimeException {

    /**
     * Constructs a new instance of InsufficientResourceException.
     * Initializes the exception with a descriptive message and logs the
     * resource shortage error for audit purposes.
     *
     * @param message description of the resource insufficiency detail
     */
    public InsufficientResourceException(String message) {
        super(message);
        log.error(message);
    }
}