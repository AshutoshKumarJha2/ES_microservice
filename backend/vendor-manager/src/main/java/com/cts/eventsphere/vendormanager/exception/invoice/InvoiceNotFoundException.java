package com.cts.eventsphere.vendormanager.exception.invoice;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class InvoiceNotFoundException extends RuntimeException {
    public InvoiceNotFoundException(String message) {

        super(message);
        log.error(message);
    }
}
