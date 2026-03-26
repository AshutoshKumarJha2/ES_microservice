package com.cts.ticketmanager.exceptions;

public class InvalidRegistrationStatusException extends RuntimeException {
    public InvalidRegistrationStatusException(String message) {
        super(message);
    }
}
