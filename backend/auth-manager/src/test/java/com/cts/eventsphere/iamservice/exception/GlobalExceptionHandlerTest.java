package com.cts.eventsphere.iamservice.exception;

import com.cts.eventsphere.iamservice.exception.general.GenericErrorResponse;
import com.cts.eventsphere.iamservice.exception.user.EmailAlreadyExistsException;
import com.cts.eventsphere.iamservice.exception.user.InvalidPasswordException;
import com.cts.eventsphere.iamservice.exception.user.RefreshFailedException;
import com.cts.eventsphere.iamservice.exception.user.UserAlreadyExistsException;
import com.cts.eventsphere.iamservice.exception.user.UserNotActiveException;
import com.cts.eventsphere.iamservice.exception.user.UserNotFoundException;
import com.cts.eventsphere.iamservice.exception.user.UserSuspendedException;
import com.cts.eventsphere.iamservice.service.AuditService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for {@link GlobalExceptionHandler}.
 *
 * <p>Each exception handler method is called directly and its response entity
 * (status code and body) is verified — no Spring context is required.</p>
 *
 * @author 2480010
 * @version 1.0
 * @since 25-03-2026
 */
@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {

    @Mock
    private AuditService auditService;

    @InjectMocks
    private GlobalExceptionHandler handler;

    private MockHttpServletRequest request;

    @BeforeEach
    void setUp() {
        request = new MockHttpServletRequest();
        request.setRequestURI("/test");
        request.setMethod("GET");
    }

    // ─── EmailAlreadyExistsException → 409 ────────────────────────────────────

    @Test
    void emailAlreadyExistsException_ShouldReturn409WithEmailAlreadyExistsMessage() {
        ResponseEntity<GenericErrorResponse> response =
                handler.emailAlreadyExistsException(new EmailAlreadyExistsException("test@example.com"), request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().error()).isEqualTo("Email already exists");
    }

    // ─── InvalidPasswordException → 400 ──────────────────────────────────────

    @Test
    void invalidPasswordException_ShouldReturn400WithInvalidPasswordMessage() {
        ResponseEntity<GenericErrorResponse> response =
                handler.invalidPasswordException(new InvalidPasswordException("bad password"), request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().error()).isEqualTo("Invalid password");
    }

    // ─── RefreshFailedException → 401 ────────────────────────────────────────

    @Test
    void handleRefreshFailedException_ShouldReturn401WithExceptionMessage() {
        RefreshFailedException ex = new RefreshFailedException("user-001");
        ResponseEntity<GenericErrorResponse> response =
                handler.handleRefreshFailedException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().error()).isEqualTo(ex.getMessage());
    }

    // ─── UserAlreadyExistsException → 409 ────────────────────────────────────

    @Test
    void userAlreadyExistsException_ShouldReturn409WithUserAlreadyExistsMessage() {
        ResponseEntity<GenericErrorResponse> response =
                handler.userAlreadyExistsException(new UserAlreadyExistsException("alice@example.com"), request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().error()).isEqualTo("User already exists");
    }

    // ─── UserNotActiveException → 401 ────────────────────────────────────────

    @Test
    void handleUserNotActiveException_ShouldReturn401WithExceptionMessage() {
        UserNotActiveException ex = new UserNotActiveException("user-001");
        ResponseEntity<GenericErrorResponse> response =
                handler.handleUserNotActiveException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().error()).isEqualTo(ex.getMessage());
    }

    // ─── UserNotFoundException → 404 ──────────────────────────────────────────

    @Test
    void userNotFoundException_ShouldReturn404WithUserNotFoundMessage() {
        ResponseEntity<GenericErrorResponse> response =
                handler.userNotFoundException(new UserNotFoundException("user-001"), request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().error()).isEqualTo("User not found");
    }

    // ─── UserSuspendedException → 401 ────────────────────────────────────────

    @Test
    void handleUserSuspendedException_ShouldReturn401WithExceptionMessage() {
        UserSuspendedException ex = new UserSuspendedException("user-001");
        ResponseEntity<GenericErrorResponse> response =
                handler.handleUserSuspendedException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().error()).isEqualTo(ex.getMessage());
    }
}
