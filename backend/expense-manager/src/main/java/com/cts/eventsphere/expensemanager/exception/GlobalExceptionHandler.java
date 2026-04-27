package com.cts.eventsphere.expensemanager.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.data.mapping.PropertyReferenceException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import com.cts.eventsphere.expensemanager.auth.dto.UserPrincipal;
import com.cts.eventsphere.expensemanager.dto.audit.AuditAction;
import com.cts.eventsphere.expensemanager.service.AuditService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;

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
@RequiredArgsConstructor
@Slf4j
public class GlobalExceptionHandler {

    private final AuditService auditService;
    
    /**
     * Extracts the authenticated user's ID from the Spring Security context.
     */
    private String resolveUserId() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal.userId();
        }
        return "anonymous";
    }

    /**
     * Derives an AuditAction from the HTTP method of the request.
     */
    private AuditAction resolveActionByMethod(HttpServletRequest request) {
        return switch (request.getMethod().toUpperCase()) {
            case "POST"         -> AuditAction.CREATE;
            case "PUT", "PATCH" -> AuditAction.UPDATE;
            case "DELETE"       -> AuditAction.DELETE;
            default             -> AuditAction.READ;
        };
    }


    @ExceptionHandler(BudgetNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleBudgetNotFound(BudgetNotFoundException ex, HttpServletRequest request) {
        log.warn("Budget not found: {}", ex.getMessage());
        auditService.logAudit(resolveUserId(), resolveActionByMethod(request), "Budget", "N/A");
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }


    @ExceptionHandler(ExpenseNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleExpenseNotFound(ExpenseNotFoundException ex, HttpServletRequest request) {
        log.warn("Expense not found: {}", ex.getMessage());
        auditService.logAudit(resolveUserId(), resolveActionByMethod(request), "Expense", "N/A");
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }


    

    @ExceptionHandler(InvalidExpenseStateException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidExpenseState(InvalidExpenseStateException ex, HttpServletRequest request) {
        log.warn("Invalid expense state transition: {}", ex.getMessage());
        auditService.logAudit(resolveUserId(), AuditAction.UPDATE, "Expense", "N/A");
        return buildResponse(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(BudgetAlreadyExistsException.class)
    public ResponseEntity<Map<String, Object>> handleBudgetAlreadyExists(BudgetAlreadyExistsException ex, HttpServletRequest request) {
        log.warn("Duplicate budget: {}", ex.getMessage());
        auditService.logAudit(resolveUserId(), AuditAction.CREATE, "Budget", "N/A");
        return buildResponse(HttpStatus.CONFLICT, ex.getMessage());
    }


    @ExceptionHandler(EventServiceException.class)
    public ResponseEntity<Map<String, Object>> handleEventServiceException(EventServiceException ex, HttpServletRequest request) {
        log.error("Event Service error: {}", ex.getMessage(), ex);
        auditService.logAudit(resolveUserId(), resolveActionByMethod(request), "Event", "N/A");

        if (ex.getMessage() != null && ex.getMessage().contains("not found")) {
            return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage());
        }
        return buildResponse(HttpStatus.SERVICE_UNAVAILABLE, ex.getMessage());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex, HttpServletRequest request) {
        auditService.logAudit(resolveUserId(), AuditAction.ACCESS_DENIED, "Request", "N/A");
        return buildResponse(HttpStatus.FORBIDDEN, "Access denied");
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

    @ExceptionHandler(PropertyReferenceException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidSortProperty(PropertyReferenceException ex) {
        log.warn("Invalid sort property: {}", ex.getMessage());
        return buildResponse(HttpStatus.BAD_REQUEST,
                "Invalid sort field '" + ex.getPropertyName() + "'. Valid fields: createdAt, updatedAt, amount, status, description, date");
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
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex, HttpServletRequest request) {
        String traceId = org.slf4j.MDC.get("traceId");
        if (traceId == null) traceId = java.util.UUID.randomUUID().toString();
        log.error("Unhandled exception. traceId={}", traceId, ex);
        auditService.logAudit(resolveUserId(), resolveActionByMethod(request), "Request", "N/A");
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred. Contact support with traceId: " + traceId);
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