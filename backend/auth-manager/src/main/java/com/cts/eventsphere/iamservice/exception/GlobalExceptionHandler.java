package com.cts.eventsphere.iamservice.exception;

import com.cts.eventsphere.iamservice.dto.audit.AuditAction;
import com.cts.eventsphere.iamservice.exception.general.GenericErrorResponse;
import com.cts.eventsphere.iamservice.exception.user.*;
import com.cts.eventsphere.iamservice.model.User;
import com.cts.eventsphere.iamservice.security.UserPrincipal;
import com.cts.eventsphere.iamservice.service.AuditService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.UUID;
import org.slf4j.MDC;

/**
 * Centralised exception handler for all REST controllers in the Auth Manager service.
 *
 * <p>Annotated with {@link org.springframework.web.bind.annotation.RestControllerAdvice} so that
 * it intercepts exceptions thrown from any {@code @RestController}. Each handler method maps a
 * specific domain exception to an appropriate HTTP status and wraps the error message in a
 * {@link GenericErrorResponse} body for uniform API error responses.</p>
 *
 * <p>Handled exceptions and their HTTP status codes:
 * <ul>
 *   <li>{@link EmailAlreadyExistsException} → 409 Conflict</li>
 *   <li>{@link InvalidPasswordException} → 400 Bad Request</li>
 *   <li>{@link RefreshFailedException} → 401 Unauthorized</li>
 *   <li>{@link UserAlreadyExistsException} → 409 Conflict</li>
 *   <li>{@link UserNotActiveException} → 401 Unauthorized</li>
 *   <li>{@link UserNotFoundException} → 404 Not Found</li>
 *   <li>{@link UserSuspendedException} → 401 Unauthorized</li>
 * </ul>
 * </p>
 *
 * @author 2480010
 * @version 1.0
 * @since 22-03-2026
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
    /**
     * Handles {@link EmailAlreadyExistsException} thrown when a profile update
     * attempts to use an email already registered to another account.
     *
     * @param e the caught exception
     * @return HTTP 409 Conflict with a {@link GenericErrorResponse} body
     */
    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<GenericErrorResponse> emailAlreadyExistsException(EmailAlreadyExistsException e, HttpServletRequest request) {
        auditService.logAudit(resolveUserId(),AuditAction.REGISTRATON_FAILURE,User.class,request.getRequestURI());
        return new ResponseEntity<>(new GenericErrorResponse("Email already exists"), HttpStatus.CONFLICT);
    }

    /**
     * Handles {@link InvalidPasswordException} thrown when login credentials fail password verification.
     *
     * @param e the caught exception
     * @return HTTP 400 Bad Request with a {@link GenericErrorResponse} body
     */
    @ExceptionHandler(InvalidPasswordException.class)
    public ResponseEntity<GenericErrorResponse> invalidPasswordException(InvalidPasswordException e,HttpServletRequest request){
        auditService.logAudit(resolveUserId(),AuditAction.LOGIN_FAILURE,User.class,request.getRequestURI());
        return new ResponseEntity<>(new GenericErrorResponse("Invalid password"), HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles {@link RefreshFailedException} thrown when the role in a refresh token
     * no longer matches the user's current role in the database.
     *
     * @param e the caught exception
     * @return HTTP 401 Unauthorized with a {@link GenericErrorResponse} body
     */
    @ExceptionHandler(RefreshFailedException.class)
    public ResponseEntity<GenericErrorResponse> handleRefreshFailedException(RefreshFailedException e, HttpServletRequest request){
        auditService.logAudit(resolveUserId(),AuditAction.PERMISSION_CHANGE,User.class,request.getRequestURI());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new GenericErrorResponse(e.getMessage()));
    }

    /**
     * Handles {@link UserAlreadyExistsException} thrown during registration when the email
     * is already associated with an existing account.
     *
     * @param e the caught exception
     * @return HTTP 409 Conflict with a {@link GenericErrorResponse} body
     */
    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<GenericErrorResponse> userAlreadyExistsException(UserAlreadyExistsException e, HttpServletRequest request){
        auditService.logAudit(resolveUserId(),AuditAction.REGISTRATON_FAILURE,User.class,request.getRequestURI());
        return new ResponseEntity<>(new GenericErrorResponse("User already exists"), HttpStatus.CONFLICT);
    }

    /**
     * Handles {@link UserNotActiveException} thrown when a token refresh is attempted
     * for an account in the {@code INACTIVE} state.
     *
     * @param e the caught exception
     * @return HTTP 401 Unauthorized with a {@link GenericErrorResponse} body
     */
    @ExceptionHandler(UserNotActiveException.class)
    public ResponseEntity<GenericErrorResponse> handleUserNotActiveException(UserNotActiveException e,HttpServletRequest request){
        auditService.logAudit(resolveUserId(),AuditAction.ACCESS_DENIED,User.class,request.getRequestURI());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new GenericErrorResponse(e.getMessage()));
    }

    /**
     * Handles {@link UserNotFoundException} thrown when a user lookup by ID or email
     * returns no result.
     *
     * @param e the caught exception
     * @return HTTP 404 Not Found with a {@link GenericErrorResponse} body
     */
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<GenericErrorResponse> userNotFoundException(UserNotFoundException e, HttpServletRequest request){
        auditService.logAudit(resolveUserId(), AuditAction.LOGIN_FAILURE, User.class,request.getRequestURI());
        return new ResponseEntity<>(new GenericErrorResponse("User not found"), HttpStatus.NOT_FOUND);
    }

    /**
     * Handles {@link UserSuspendedException} thrown when a token refresh is attempted
     * for an account in the {@code SUSPENDED} state.
     *
     * @param e the caught exception
     * @return HTTP 401 Unauthorized with a {@link GenericErrorResponse} body
     */
    @ExceptionHandler(UserSuspendedException.class)
    public ResponseEntity<GenericErrorResponse> handleUserSuspendedException(UserSuspendedException e, HttpServletRequest request){
        auditService.logAudit(resolveUserId(),AuditAction.ACCESS_DENIED,User.class,request.getRequestURI());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new GenericErrorResponse(e.getMessage()));
    }

    private AuditAction resolveActionByMethod(HttpServletRequest request) {
        return switch (request.getMethod().toUpperCase()) {
            case "POST"         -> AuditAction.CREATE;
            case "PUT", "PATCH" -> AuditAction.UPDATE;
            case "DELETE"       -> AuditAction.DELETE;
            default             -> AuditAction.READ;
        };
    }

    // ─── FALLBACK ────────────────────────────────────────────────────────────────

    @ExceptionHandler(Exception.class)
    public ResponseEntity<GenericErrorResponse> handleUnexpected(Exception ex, HttpServletRequest request) {
        String traceId = MDC.get("traceId");
        if (traceId == null) traceId = UUID.randomUUID().toString();
        log.error("Unhandled exception. traceId={}", traceId, ex);
        auditService.logAudit(resolveUserId(), resolveActionByMethod(request), "Request", request.getRequestURI());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new GenericErrorResponse("An unexpected error occurred. Contact support with traceId: " + traceId));
    }
}
