package com.cts.venue_manager.exception.booking;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class BookingNotFoundException extends RuntimeException {

    public BookingNotFoundException(String msg){
        super(msg);
        log.error(msg);
    }
}
