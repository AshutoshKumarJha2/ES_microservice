package com.cts.eventsphere.eventmanager.exception;

import com.cts.eventsphere.eventmanager.auth.dto.UserPrincipal;
import com.cts.eventsphere.eventmanager.dto.audit.AuditAction;
import com.cts.eventsphere.eventmanager.dto.shared.GenericErrorResponse;
import com.cts.eventsphere.eventmanager.exception.ticket.TicketUnavailableException;
import com.cts.eventsphere.eventmanager.service.AuditService;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Path;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {

    @Mock private AuditService auditService;
    @InjectMocks private GlobalExceptionHandler handler;

    private MockHttpServletRequest request;

    @BeforeEach
    void setUp() {
        request = new MockHttpServletRequest();
        request.setRequestURI("/test/uri");
        request.setMethod("GET");

        var principal = new UserPrincipal("user-001", "ORGANIZER",
                List.of(new SimpleGrantedAuthority("ROLE_ORGANIZER")));
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.authorities()));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    // ── 400 ──────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("handleMessageNotReadable – returns 400 with fixed error message")
    void handleMessageNotReadable_returns400() {
        HttpMessageNotReadableException ex = mock(HttpMessageNotReadableException.class);

        ResponseEntity<GenericErrorResponse> response = handler.handleMessageNotReadable(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().error()).contains("Malformed");
    }

    @Test
    @DisplayName("handleMissingParam – returns 400 with parameter name in error")
    void handleMissingParam_returns400() {
        MissingServletRequestParameterException ex =
                mock(MissingServletRequestParameterException.class);
        when(ex.getParameterName()).thenReturn("eventId");

        ResponseEntity<GenericErrorResponse> response = handler.handleMissingParam(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody().error()).contains("eventId");
    }

    @Test
    @DisplayName("handleConstraintViolation – returns 400 with violation description")
    void handleConstraintViolation_returns400() {
        Path path = mock(Path.class);
        when(path.toString()).thenReturn("field");

        @SuppressWarnings("unchecked")
        ConstraintViolation<Object> violation = mock(ConstraintViolation.class);
        when(violation.getPropertyPath()).thenReturn(path);
        when(violation.getMessage()).thenReturn("must not be blank");

        ConstraintViolationException ex = new ConstraintViolationException(Set.of(violation));

        ResponseEntity<GenericErrorResponse> response = handler.handleConstraintViolation(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody().error()).contains("must not be blank");
    }

    @Test
    @DisplayName("handleIllegalArgument – returns 400 with exception message as error")
    void handleIllegalArgument_returns400() {
        IllegalArgumentException ex = new IllegalArgumentException("bad argument");

        ResponseEntity<GenericErrorResponse> response = handler.handleIllegalArgument(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody().error()).isEqualTo("bad argument");
    }

    // ── 403 ──────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("handleAccessDenied – returns 403 and logs ACCESS_DENIED audit")
    void handleAccessDenied_returns403() {
        AccessDeniedException ex = new AccessDeniedException("forbidden");

        ResponseEntity<GenericErrorResponse> response = handler.handleAccessDenied(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(response.getBody().error()).isEqualTo("Access denied");
        verify(auditService).logAudit(eq("user-001"), eq(AuditAction.ACCESS_DENIED), eq("Request"), anyString());
    }

    // ── 404 ──────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("handleNoResourceFound – returns 404")
    void handleNoResourceFound_returns404() {
        NoResourceFoundException ex = mock(NoResourceFoundException.class);
        when(ex.getMessage()).thenReturn("No resource at /foo");

        ResponseEntity<GenericErrorResponse> response = handler.handleNoResourceFound(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    // ── 405 ──────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("handleMethodNotSupported – returns 405 with HTTP method in error message")
    void handleMethodNotSupported_returns405() {
        HttpRequestMethodNotSupportedException ex =
                mock(HttpRequestMethodNotSupportedException.class);
        when(ex.getMethod()).thenReturn("PATCH");

        ResponseEntity<GenericErrorResponse> response = handler.handleMethodNotSupported(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.METHOD_NOT_ALLOWED);
        assertThat(response.getBody().error()).contains("PATCH");
    }

    // ── 422 ──────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("handleTicketUnavailable – returns 422 and logs REGISTRATON_FAILURE audit")
    void handleTicketUnavailable_returns422() {
        request.setMethod("POST");
        TicketUnavailableException ex = new TicketUnavailableException("event-001");

        ResponseEntity<GenericErrorResponse> response = handler.handleTicketUnavailable(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNPROCESSABLE_ENTITY);
        assertThat(response.getBody().error()).contains("event-001");
        verify(auditService).logAudit(eq("user-001"), eq(AuditAction.REGISTRATON_FAILURE), eq("Ticket"), anyString());
    }

    // ── 500 ──────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("handleUnexpected – returns 500 with traceId in error message")
    void handleUnexpected_returns500() {
        Exception ex = new RuntimeException("something went wrong");

        ResponseEntity<GenericErrorResponse> response = handler.handleUnexpected(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody().error()).contains("traceId");
    }

    // ── resolveUserId – anonymous ─────────────────────────────────────────────

    @Test
    @DisplayName("resolveUserId returns 'anonymous' when no UserPrincipal is in SecurityContext")
    void resolveUserId_anonymous() {
        SecurityContextHolder.clearContext();
        AccessDeniedException ex = new AccessDeniedException("forbidden");

        ResponseEntity<GenericErrorResponse> response = handler.handleAccessDenied(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        verify(auditService).logAudit(eq("anonymous"), any(AuditAction.class), anyString(), anyString());
    }
}
