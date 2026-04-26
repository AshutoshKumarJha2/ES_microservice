package com.cts.eventsphere.eventmanager.exception;

import com.cts.eventsphere.eventmanager.auth.dto.UserPrincipal;
import com.cts.eventsphere.eventmanager.dto.audit.AuditAction;
import com.cts.eventsphere.eventmanager.dto.shared.GenericErrorResponse;
import com.cts.eventsphere.eventmanager.exception.event.EventNotFoundException;
import com.cts.eventsphere.eventmanager.exception.registration.DuplicateRegistrationException;
import com.cts.eventsphere.eventmanager.exception.registration.InvalidRegistrationStatusException;
import com.cts.eventsphere.eventmanager.exception.registration.RegistrationNotFoundException;
import com.cts.eventsphere.eventmanager.exception.schedule.ScheduleNotFoundException;
import com.cts.eventsphere.eventmanager.exception.ticket.TicketAlreadyExistsException;
import com.cts.eventsphere.eventmanager.exception.ticket.TicketNotFoundException;
import com.cts.eventsphere.eventmanager.exception.ticket.TicketUnavailableException;
import com.cts.eventsphere.eventmanager.service.AuditService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.UUID;
import java.util.stream.Collectors;
import org.slf4j.MDC;

@RestControllerAdvice
@RequiredArgsConstructor
@Slf4j
public class GlobalExceptionHandler {

    private final AuditService auditService;

    /**
     * Extracts the authenticated user's ID from the Spring Security context.
     * Returns {@code "anonymous"} if no authenticated user is present.
     *
     * @return The userId string of the current principal, or {@code "anonymous"}.
     */
    private String resolveUserId() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal.userId();
        }
        return "anonymous";
    }

    /**
     * Derives an {@link AuditAction} from the HTTP method of the request.
     * Used when auditing failed operations where the original intent is inferred
     * from the HTTP verb.
     *
     * @param request The current {@link HttpServletRequest}.
     * @return The corresponding {@link AuditAction}.
     */
    private AuditAction resolveActionByMethod(HttpServletRequest request) {
        return switch (request.getMethod().toUpperCase()) {
            case "POST"         -> AuditAction.CREATE;
            case "PUT", "PATCH" -> AuditAction.UPDATE;
            case "DELETE"       -> AuditAction.DELETE;
            default             -> AuditAction.READ;
        };
    }

    // ── 400 Bad Request ──────────────────────────────────────────────────────

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<GenericErrorResponse> handleValidationException(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return ResponseEntity.badRequest().body(new GenericErrorResponse(message));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<GenericErrorResponse> handleMessageNotReadable(HttpMessageNotReadableException ex) {
        return ResponseEntity.badRequest().body(new GenericErrorResponse("Malformed or unreadable request body"));
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<GenericErrorResponse> handleMissingParam(MissingServletRequestParameterException ex) {
        return ResponseEntity.badRequest().body(new GenericErrorResponse("Missing required parameter: " + ex.getParameterName()));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<GenericErrorResponse> handleConstraintViolation(ConstraintViolationException ex) {
        String message = ex.getConstraintViolations().stream()
                .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                .collect(Collectors.joining(", "));
        return ResponseEntity.badRequest().body(new GenericErrorResponse(message));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<GenericErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(new GenericErrorResponse(ex.getMessage()));
    }

    @ExceptionHandler(InvalidRegistrationStatusException.class)
    public ResponseEntity<GenericErrorResponse> handleInvalidRegistrationStatus(InvalidRegistrationStatusException e,
                                                                                HttpServletRequest request) {
        auditService.logAudit(resolveUserId(), AuditAction.REGISTRATON_FAILURE, "Registration", "N/A");
        return ResponseEntity.badRequest().body(new GenericErrorResponse(e.getMessage()));
    }

    // ── 403 Forbidden ────────────────────────────────────────────────────────

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<GenericErrorResponse> handleAccessDenied(AccessDeniedException ex, HttpServletRequest request) {
        auditService.logAudit(resolveUserId(), AuditAction.ACCESS_DENIED, "Request", "N/A");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new GenericErrorResponse("Access denied"));
    }

    // ── 404 Not Found ────────────────────────────────────────────────────────

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<GenericErrorResponse> handleNoResourceFound(NoResourceFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new GenericErrorResponse(ex.getMessage()));
    }

    @ExceptionHandler(EventNotFoundException.class)
    public ResponseEntity<GenericErrorResponse> handleEventNotFound(EventNotFoundException e, HttpServletRequest request) {
        auditService.logAudit(resolveUserId(), resolveActionByMethod(request), "Event", "N/A");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new GenericErrorResponse(e.getMessage()));
    }

    @ExceptionHandler(ScheduleNotFoundException.class)
    public ResponseEntity<GenericErrorResponse> handleScheduleNotFound(ScheduleNotFoundException e, HttpServletRequest request) {
        auditService.logAudit(resolveUserId(), resolveActionByMethod(request), "Schedule", "N/A");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new GenericErrorResponse("Schedule not found"));
    }

    @ExceptionHandler(TicketNotFoundException.class)
    public ResponseEntity<GenericErrorResponse> handleTicketNotFound(TicketNotFoundException e, HttpServletRequest request) {
        auditService.logAudit(resolveUserId(), resolveActionByMethod(request), "Ticket", "N/A");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new GenericErrorResponse(e.getMessage()));
    }

    @ExceptionHandler(RegistrationNotFoundException.class)
    public ResponseEntity<GenericErrorResponse> handleRegistrationNotFound(RegistrationNotFoundException e, HttpServletRequest request) {
        auditService.logAudit(resolveUserId(), resolveActionByMethod(request), "Registration", "N/A");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new GenericErrorResponse(e.getMessage()));
    }

    // ── 405 Method Not Allowed ───────────────────────────────────────────────

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<GenericErrorResponse> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex) {
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(new GenericErrorResponse("HTTP method not supported: " + ex.getMethod()));
    }

    // ── 409 Conflict ─────────────────────────────────────────────────────────

    @ExceptionHandler(TicketAlreadyExistsException.class)
    public ResponseEntity<GenericErrorResponse> handleTicketAlreadyExists(TicketAlreadyExistsException e, HttpServletRequest request) {
        auditService.logAudit(resolveUserId(), AuditAction.CREATE, "Ticket", "N/A");
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new GenericErrorResponse(e.getMessage()));
    }

    @ExceptionHandler(DuplicateRegistrationException.class)
    public ResponseEntity<GenericErrorResponse> handleDuplicateRegistration(DuplicateRegistrationException e, HttpServletRequest request) {
        auditService.logAudit(resolveUserId(), AuditAction.REGISTRATON_FAILURE, "Registration", "N/A");
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new GenericErrorResponse(e.getMessage()));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<GenericErrorResponse> handleDataIntegrityViolation(DataIntegrityViolationException ex,
                                                                              HttpServletRequest request) {
        auditService.logAudit(resolveUserId(), resolveActionByMethod(request), "Entity", "N/A");
        String message = switch (request.getMethod().toUpperCase()) {
            case "DELETE"       -> "Cannot delete: this record is still referenced by other data";
            case "POST", "PUT", "PATCH" -> "A record with conflicting data already exists";
            default             -> "Data integrity constraint violated";
        };
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new GenericErrorResponse(message));
    }

    // ── 422 Unprocessable Entity ─────────────────────────────────────────────

    @ExceptionHandler(TicketUnavailableException.class)
    public ResponseEntity<GenericErrorResponse> handleTicketUnavailable(TicketUnavailableException e, HttpServletRequest request) {
        auditService.logAudit(resolveUserId(), AuditAction.REGISTRATON_FAILURE, "Ticket", "N/A");
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(new GenericErrorResponse(e.getMessage()));
    }

    // ── 500 Internal Server Error (catch-all) ────────────────────────────────

    @ExceptionHandler(Exception.class)
    public ResponseEntity<GenericErrorResponse> handleUnexpected(Exception ex, HttpServletRequest request) {
        String traceId = MDC.get("traceId");
        if (traceId == null) traceId = UUID.randomUUID().toString();
        log.error("Unhandled exception. traceId={}", traceId, ex);
        auditService.logAudit(resolveUserId(), resolveActionByMethod(request), "Request", "N/A");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new GenericErrorResponse("An unexpected error occurred. Please contact support with traceId: " + traceId));
    }
}