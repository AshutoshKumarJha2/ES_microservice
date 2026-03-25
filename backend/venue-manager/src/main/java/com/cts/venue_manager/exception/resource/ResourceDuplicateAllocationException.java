package com.cts.venue_manager.exception.resource;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class ResourceDuplicateAllocationException extends RuntimeException {
    public ResourceDuplicateAllocationException(String message) {
        super(message);
        log.error(message);
    }
}
