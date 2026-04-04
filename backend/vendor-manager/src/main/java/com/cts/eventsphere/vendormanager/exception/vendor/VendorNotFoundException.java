package com.cts.eventsphere.vendormanager.exception.vendor;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class VendorNotFoundException extends RuntimeException {
    public VendorNotFoundException(String message) {

        super(message);
        log.error(message);
    }
}
