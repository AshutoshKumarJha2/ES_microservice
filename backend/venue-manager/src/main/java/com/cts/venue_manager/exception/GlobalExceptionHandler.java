package com.cts.venue_manager.exception;

import com.cts.venue_manager.exception.booking.BookingNotFoundException;
import com.cts.venue_manager.exception.resource.InsufficientResourceException;
import com.cts.venue_manager.exception.resource.ResourceAlreadyExistsException;
import com.cts.venue_manager.exception.resource.ResourceDuplicateAllocationException;
import com.cts.venue_manager.exception.resource.ResourceNotFoundException;
import com.cts.venue_manager.exception.venue.VenueNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.UUID;
import java.util.stream.Collectors;
import org.slf4j.MDC;

/**
 * Global interceptor for handling exceptions across all controllers in the venue management system.
 * This class maps specific domain exceptions to appropriate HTTP status codes and
 * provides a consistent error response format for the API.
 *
 * @author 2479476
 * @version 1.0
 * @since 2026-03-26
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    /**
     * Handles VenueNotFoundException by returning a 404 status.
     *
     * @param e the exception containing venue lookup failure details
     * @return a ResponseEntity containing the error message and NOT_FOUND status
     */
    @ExceptionHandler(VenueNotFoundException.class)
    public ResponseEntity<String> handleVenueNotFoundException(VenueNotFoundException e){
        return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
    }

    /**
     * Handles ResourceNotFoundException by returning a 404 status.
     *
     * @param e the exception containing resource lookup failure details
     * @return a ResponseEntity containing the error message and NOT_FOUND status
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<String> handleResourceNotFound(ResourceNotFoundException e) {
        return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
    }

    /**
     * Handles InsufficientResourceException by returning a 400 status.
     *
     * @param e the exception containing resource shortage details
     * @return a ResponseEntity containing the error message and BAD_REQUEST status
     */
    @ExceptionHandler(InsufficientResourceException.class)
    public ResponseEntity<String> handleInsufficientResource(InsufficientResourceException e) {
        return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles ResourceAlreadyExistsException by returning a 409 status.
     *
     * @param e the exception containing duplication conflict details
     * @return a ResponseEntity containing the error message and CONFLICT status
     */
    @ExceptionHandler(ResourceAlreadyExistsException.class)
    public ResponseEntity<String> handleResourceAlreadyExists(ResourceAlreadyExistsException e) {
        return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
    }

    /**
     * Handles ResourceDuplicateAllocationException by returning a 409 status.
     *
     * @param e the exception containing allocation conflict details
     * @return a ResponseEntity containing the error message and CONFLICT status
     */
    @ExceptionHandler(ResourceDuplicateAllocationException.class)
    public ResponseEntity<String> handleResourceDuplicateAllocation(ResourceDuplicateAllocationException e) {
        return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
    }

    /**
     * Handles BookingNotFoundException by returning a 404 status.
     *
     * @param e the exception containing booking lookup failure details
     * @return a ResponseEntity containing the error message and NOT_FOUND status
     */
    @ExceptionHandler(BookingNotFoundException.class)
    public ResponseEntity<String> handleBookingNotFound(BookingNotFoundException e) {
        return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<String> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return new ResponseEntity<>(message, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException ex) {
        log.warn("Invalid argument: {}", ex.getMessage());
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleUnexpected(Exception ex) {
        String traceId = MDC.get("traceId");
        if (traceId == null) traceId = UUID.randomUUID().toString();
        log.error("Unhandled exception. traceId={}", traceId, ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An unexpected error occurred. Contact support with traceId: " + traceId);
    }
}