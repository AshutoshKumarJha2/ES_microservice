package com.cts.ticketmanager.exceptions;

public class EventNotFoundException extends RuntimeException {
    public EventNotFoundException(String eventId){
        super(String.format("Event with id '%s' not found", eventId));
    }
}
