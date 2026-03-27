package com.cts.eventsphere.expensemanager.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Centralized exception handler for the Finance (Expense Manager) Service.
 *
 * <p>Catches all domain-specific and validation exceptions thrown by
 * service and controller layers, and returns a consistent JSON error
 * response body with an appropriate HTTP status code.</p>
 *
 * <p>Standard error response shape:</p>
 * <pre>
 * {
 *   "timestamp": "2026-03-26T10:15:30",
 *   "status": 404,
 *   "error": "Not Found",
 *   "message": "Expense not found with ID: abc-123"
 * }
 * </pre>
 *
 * @author 2480081
 * @version 1.0
 * @since 25-03-2026
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    

    @ExceptionHandler(BudgetNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleBudgetNotFound(BudgetNotFoundException ex) {
        log.warn("Budget not found: {}", ex.getMessage());
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(ExpenseNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleExpenseNotFound(ExpenseNotFoundException ex) {
        log.warn("Expense not found: {}", ex.getMessage());
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    

    @ExceptionHandler(BudgetAlreadyExistsException.class)
    public ResponseEntity<Map<String, Object>> handleBudgetAlreadyExists(BudgetAlreadyExistsException ex) {
        log.warn("Duplicate budget: {}", ex.getMessage());
        return buildResponse(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(InvalidExpenseStateException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidExpenseState(InvalidExpenseStateException ex) {
        log.warn("Invalid expense state transition: {}", ex.getMessage());
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    

    @ExceptionHandler(EventServiceException.class)
    public ResponseEntity<Map<String, Object>> handleEventServiceException(EventServiceException ex) {
        log.error("Event Service error: {}", ex.getMessage(), ex);

        // Distinguish "event not found" from "service unreachable"
        if (ex.getMessage() != null && ex.getMessage().contains("not found")) {
            return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage());
        }
        return buildResponse(HttpStatus.SERVICE_UNAVAILABLE, ex.getMessage());
    }

    

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex) {
        log.warn("Validation failed: {}", ex.getMessage());

        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }

        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Validation Failed");
        body.put("messages", fieldErrors);
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    // ─── Type Mismatch (e.g., invalid enum in @RequestParam) ──────────

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String message = "Invalid value '" + ex.getValue()
                + "' for parameter '" + ex.getName() + "'"
                + ". Expected type: " + (ex.getRequiredType() != null
                        ? ex.getRequiredType().getSimpleName() : "unknown");
        log.warn("Type mismatch: {}", message);
        return buildResponse(HttpStatus.BAD_REQUEST, message);
    }

    // ─── Catch-All ─────────────────────────────────────────────────────

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        log.error("Unhandled exception: {}", ex.getMessage(), ex);
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred");
    }

    // ─── Helper ────────────────────────────────────────────────────────

    private ResponseEntity<Map<String, Object>> buildResponse(HttpStatus status, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        return new ResponseEntity<>(body, status);
    }
}