package com.cts.eventsphere.vendormanager.exception.contract;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class ContractNotFoundException extends RuntimeException {
    public ContractNotFoundException(String message) {

        super(message);
        log.error(message);
    }
}
