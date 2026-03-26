package com.cts.ticketmanager.exceptions;

public class RegistrationNotFoundException extends RuntimeException {
    public RegistrationNotFoundException(String registrationId) {
        super(String.format("Registration with id '%s' not found", registrationId));
    }
}
