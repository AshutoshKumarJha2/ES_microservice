package com.cts.eventsphere.vendormanager.exception.vendor;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class VendorInUseException extends RuntimeException {
    public VendorInUseException(String message) {
        super(message);
        log.error(message);
    }
}
