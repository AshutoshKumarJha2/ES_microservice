package com.cts.venue_manager.exception.venue;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class VenueInUseException extends RuntimeException {
    public VenueInUseException(String message) {
        super(message);
        log.error(message);
    }
}
