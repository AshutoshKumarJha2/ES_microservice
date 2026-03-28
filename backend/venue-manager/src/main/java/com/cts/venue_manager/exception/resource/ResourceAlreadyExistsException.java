package com.cts.venue_manager.exception.resource;

import lombok.extern.slf4j.Slf4j;

/**
 * Exception thrown when attempting to create or register a resource that is
 * already present in the system database.
 *
 * @author 2479476
 * @version 1.0
 * @since 2026-03-26
 */
@Slf4j
public class ResourceAlreadyExistsException extends RuntimeException {

    /**
     * Constructs a new instance of ResourceAlreadyExistsException.
     * Captures the conflict message and records the duplication error
     * in the system logs.
     *
     * @param message description of the conflict or existing resource data
     */
    public ResourceAlreadyExistsException(String message) {
        super(message);
        log.error(message);
    }
}