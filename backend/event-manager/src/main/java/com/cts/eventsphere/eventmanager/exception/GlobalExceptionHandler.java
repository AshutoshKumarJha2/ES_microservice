package com.cts.eventsphere.eventmanager.exception;

import com.cts.eventsphere.eventmanager.dto.shared.GenericErrorResponse;
import com.cts.eventsphere.eventmanager.exception.event.EventNotFoundException;
import com.cts.eventsphere.eventmanager.exception.registration.DuplicateRegistrationException;
import com.cts.eventsphere.eventmanager.exception.registration.InvalidRegistrationStatusException;
import com.cts.eventsphere.eventmanager.exception.registration.RegistrationNotFoundException;
import com.cts.eventsphere.eventmanager.exception.schedule.ScheduleNotFoundException;
import com.cts.eventsphere.eventmanager.exception.ticket.TicketAlreadyExistsException;
import com.cts.eventsphere.eventmanager.exception.ticket.TicketNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * Global Exception Handler for Validation errors and Custom made Exceptions
 *
 * @author 2479623
 * @version 1.0
 * @since 25-03-2026
 */

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String,String>> handleValidationException(
            MethodArgumentNotValidException ex){
        Map<String,String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(
                e -> errors.put(e.getField(),e.getDefaultMessage())
        );
        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<GenericErrorResponse> handleUnexpectedExceptions(Exception ex) {
        String traceId = java.util.UUID.randomUUID().toString();
        log.error("Unhandled exception. traceId={}", traceId, ex);
        GenericErrorResponse body = new GenericErrorResponse(
                "An unexpected error occurred. Please contact support with traceId: " + traceId
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }

    /**
     * Handles EventNotFoundException by returning a standardized error response.
     * This method is triggered when an event lookup fails and the requested event
     * cannot be found in the system.
     *
     * @param e the EventNotFoundException thrown when the event is missing
     * @return ResponseEntity containing a GenericErrorResponse with a "Event Not Found"
     *         message and HTTP status 404 (NOT_FOUND)
     */
    @ExceptionHandler(EventNotFoundException.class)
    public ResponseEntity<GenericErrorResponse> handleEventNotFoundException(EventNotFoundException e) {
        return new ResponseEntity<>(new GenericErrorResponse("Event Not Found"), HttpStatus.NOT_FOUND);
    }

    /**
     * Handles ScheduleNotFoundException by returning a standardized error response.
     * This method is triggered when a schedule lookup fails and the requested schedule
     * cannot be found in the system.
     *
     * @param e the ScheduleNotFoundException thrown when the schedule is missing
     * @return ResponseEntity containing a GenericErrorResponse with a "Schedule Not Found"
     *         message and HTTP status 404 (NOT_FOUND)
     */
    @ExceptionHandler(ScheduleNotFoundException.class)
    public ResponseEntity<GenericErrorResponse> handleScheduleNotFoundException(ScheduleNotFoundException e) {
        return new ResponseEntity<>(new GenericErrorResponse("Schedule Not Found"), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(TicketNotFoundException.class)
    public ResponseEntity<GenericErrorResponse> handleTicketNotFoundException(TicketNotFoundException e) {
        return new ResponseEntity<>(new GenericErrorResponse(e.getMessage()), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(TicketAlreadyExistsException.class)
    public ResponseEntity<GenericErrorResponse> handleTicketAlreadyExistsException(TicketAlreadyExistsException e) {
        return new ResponseEntity<>(new GenericErrorResponse(e.getMessage()), HttpStatus.CONFLICT);
    }

    @ExceptionHandler(RegistrationNotFoundException.class)
    public ResponseEntity<GenericErrorResponse> handleRegistrationNotFoundException(RegistrationNotFoundException e) {
        return new ResponseEntity<>(new GenericErrorResponse(e.getMessage()), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(DuplicateRegistrationException.class)
    public ResponseEntity<GenericErrorResponse> handleDuplicateRegistrationException(DuplicateRegistrationException e) {
        return new ResponseEntity<>(new GenericErrorResponse(e.getMessage()), HttpStatus.CONFLICT);
    }

    @ExceptionHandler(InvalidRegistrationStatusException.class)
    public ResponseEntity<GenericErrorResponse> handleInvalidRegistrationStatusException(InvalidRegistrationStatusException e) {
        return new ResponseEntity<>(new GenericErrorResponse(e.getMessage()), HttpStatus.BAD_REQUEST);
    }
}