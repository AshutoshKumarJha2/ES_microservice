package com.eventsphere.engagement_manager.Exception;

/**
 * [ Detailed description of the class's responsibility]
 *
 * @author 2480027
 * @version 1.0
 * @since 26-03-2026
 */

import com.eventsphere.engagement_manager.auth.dto.UserPrincipal;
import com.eventsphere.engagement_manager.dto.audit.AuditAction;
import com.eventsphere.engagement_manager.dto.shared.GenericErrorResponse;
import com.eventsphere.engagement_manager.service.AuditService;
import jakarta.persistence.EntityExistsException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.slf4j.MDC;

/**
 * Global Exception Handler for engagement-manager microservice.
 * Handles Feedback, Engagement, and common exceptions only.
 *
 * @author 2480027
 * @version 1.0
 * @since 26-03-2026
 */
@RestControllerAdvice
@RequiredArgsConstructor
@Slf4j
public class GlobalExceptionHandler {

    private final AuditService auditService;

    private String resolveUserId() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal.userId();
        }
        return "anonymous";
    }

    private AuditAction resolveActionByMethod(HttpServletRequest request) {
        return switch (request.getMethod().toUpperCase()) {
            case "POST"         -> AuditAction.CREATE;
            case "PUT", "PATCH" -> AuditAction.UPDATE;
            case "DELETE"       -> AuditAction.DELETE;
            default             -> AuditAction.READ;
        };
    }

    // ─── VALIDATION ─────────────────────────────────────────────────────────────

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationException(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(
                e -> errors.put(e.getField(), e.getDefaultMessage())
        );
        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<GenericErrorResponse> handleHttpMessageNotReadable(
            HttpMessageNotReadableException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new GenericErrorResponse(e.getMessage()));
    }

    // ─── FEEDBACK ───────────────                          ─────────────────────────────────────────────────

    @ExceptionHandler(FeedbackNotFoundException.class)
    public ResponseEntity<GenericErrorResponse> handleFeedbackNotFound(
            FeedbackNotFoundException e) {
        log.error("Feedback not found: {}", e.getMessage());
        return new ResponseEntity<>(new GenericErrorResponse(e.getMessage()), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(EntityExistsException.class)
    public ResponseEntity<GenericErrorResponse> handleEntityExists(
            EntityExistsException e) {
        log.error("Duplicate entity: {}", e.getMessage());
        return new ResponseEntity<>(new GenericErrorResponse(e.getMessage()), HttpStatus.CONFLICT);
    }

    // ─── ENGAGEMENT ──────────────────────────────────────────────────────────────

    @ExceptionHandler(EngagementNotFoundException.class)
    public ResponseEntity<GenericErrorResponse> handleEngagementNotFound(
            EngagementNotFoundException e) {
        log.error("Engagement not found: {}", e.getMessage());
        return new ResponseEntity<>(new GenericErrorResponse(e.getMessage()), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(InvalidEngagementException.class)
    public ResponseEntity<GenericErrorResponse> handleInvalidEngagement(
            InvalidEngagementException e) {
        log.error("Invalid engagement: {}", e.getMessage());
        return new ResponseEntity<>(new GenericErrorResponse(e.getMessage()), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<GenericErrorResponse> handleIllegalState(
            IllegalStateException e) {
        log.error("Illegal state: {}", e.getMessage());
        return new ResponseEntity<>(new GenericErrorResponse(e.getMessage()), HttpStatus.UNPROCESSABLE_ENTITY);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<GenericErrorResponse> handleIllegalArgument(
            IllegalArgumentException e) {
        log.error("Illegal argument: {}", e.getMessage());
        return new ResponseEntity<>(new GenericErrorResponse(e.getMessage()), HttpStatus.BAD_REQUEST);
    }

    // ─── SECURITY ────────────────────────────────────────────────────────────────

    @ExceptionHandler(AuthorizationDeniedException.class)
    public ResponseEntity<GenericErrorResponse> handleAuthorizationDenied(
            AuthorizationDeniedException e, HttpServletRequest request) {
        auditService.logAudit(resolveUserId(), AuditAction.ACCESS_DENIED, "Request", request.getRequestURI());
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new GenericErrorResponse(e.getMessage()));
    }

    // ─── FALLBACK ────────────────────────────────────────────────────────────────

    @ExceptionHandler(Exception.class)
    public ResponseEntity<GenericErrorResponse> handleUnexpected(Exception ex, HttpServletRequest request) {
        String traceId = MDC.get("traceId");
        if (traceId == null) traceId = UUID.randomUUID().toString();
        log.error("Unhandled exception. traceId={}", traceId, ex);
        auditService.logAudit(resolveUserId(), resolveActionByMethod(request), "Request", request.getRequestURI());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new GenericErrorResponse(
                        "An unexpected error occurred. Contact support with traceId: " + traceId
                ));
    }
}