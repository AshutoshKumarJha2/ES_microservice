package com.cts.venue_manager.exception.resource;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class ResourceAlreadyExistsException extends RuntimeException {
    public ResourceAlreadyExistsException(String message) {
        super(message);
        log.error(message);
    }
}
