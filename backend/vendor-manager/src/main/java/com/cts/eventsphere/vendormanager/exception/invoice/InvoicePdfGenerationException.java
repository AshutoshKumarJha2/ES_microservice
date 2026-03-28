package com.cts.eventsphere.vendormanager.exception.invoice;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class InvoicePdfGenerationException extends RuntimeException {
    public InvoicePdfGenerationException(String message) {

        super(message);
        log.error(message);
    }
}
