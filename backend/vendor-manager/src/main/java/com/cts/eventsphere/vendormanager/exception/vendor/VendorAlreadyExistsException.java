package com.cts.eventsphere.vendormanager.exception.vendor;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class VendorAlreadyExistsException extends RuntimeException {
    public VendorAlreadyExistsException(String message) {
        super(message);
        log.error(message);
    }
}
