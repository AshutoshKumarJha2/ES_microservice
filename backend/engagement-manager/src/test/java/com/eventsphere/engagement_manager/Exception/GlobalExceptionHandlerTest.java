package com.eventsphere.engagement_manager.Exception;

import com.eventsphere.engagement_manager.dto.shared.GenericErrorResponse;
import jakarta.persistence.EntityExistsException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
    }

    // ─── VALIDATION ──────────────────────────────────────────────────────────────

    @Test
    @DisplayName("handleValidationException – returns 400 with field-to-message map")
    void handleValidationException_singleError_returns400() {
        FieldError fieldError = new FieldError("dto", "eventId", "must not be blank");
        BindingResult bindingResult = mock(BindingResult.class);
        when(bindingResult.getFieldErrors()).thenReturn(List.of(fieldError));

        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        when(ex.getBindingResult()).thenReturn(bindingResult);

        ResponseEntity<Map<String, String>> response = handler.handleValidationException(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).containsEntry("eventId", "must not be blank");
    }

    @Test
    @DisplayName("handleValidationException – returns 400 with multiple field errors")
    void handleValidationException_multipleErrors_returns400() {
        FieldError error1 = new FieldError("dto", "eventId", "must not be blank");
        FieldError error2 = new FieldError("dto", "rating", "Rating cannot exceed 5");
        BindingResult bindingResult = mock(BindingResult.class);
        when(bindingResult.getFieldErrors()).thenReturn(List.of(error1, error2));

        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        when(ex.getBindingResult()).thenReturn(bindingResult);

        ResponseEntity<Map<String, String>> response = handler.handleValidationException(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody())
                .containsEntry("eventId", "must not be blank")
                .containsEntry("rating", "Rating cannot exceed 5");
    }

    @Test
    @DisplayName("handleHttpMessageNotReadable – returns 400 with error message body")
    void handleHttpMessageNotReadable_returns400() {
        HttpMessageNotReadableException ex = mock(HttpMessageNotReadableException.class);
        when(ex.getMessage()).thenReturn("Unrecognized token: SESSION_INVALID");

        ResponseEntity<GenericErrorResponse> response = handler.handleHttpMessageNotReadable(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody().error()).contains("Unrecognized token");
    }

    // ─── FEEDBACK ────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("handleFeedbackNotFound – returns 404 with feedback ID in message")
    void handleFeedbackNotFound_returns404() {
        FeedbackNotFoundException ex = new FeedbackNotFoundException("Feedback not found: fb-001");

        ResponseEntity<GenericErrorResponse> response = handler.handleFeedbackNotFound(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody().error()).contains("fb-001");
    }

    @Test
    @DisplayName("handleEntityExists – returns 409 when duplicate feedback submitted")
    void handleEntityExists_returns409() {
        EntityExistsException ex = new EntityExistsException("Feedback already submitted for this event");

        ResponseEntity<GenericErrorResponse> response = handler.handleEntityExists(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody().error()).contains("already submitted");
    }

    // ─── ENGAGEMENT ──────────────────────────────────────────────────────────────

    @Test
    @DisplayName("handleEngagementNotFound – returns 404 with event ID in message")
    void handleEngagementNotFound_returns404() {
        EngagementNotFoundException ex = new EngagementNotFoundException("No engagements found for event: event-001");

        ResponseEntity<GenericErrorResponse> response = handler.handleEngagementNotFound(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody().error()).contains("event-001");
    }

    @Test
    @DisplayName("handleInvalidEngagement – returns 400 with validation message")
    void handleInvalidEngagement_returns400() {
        InvalidEngagementException ex = new InvalidEngagementException("Engagement timestamp cannot be in the future");

        ResponseEntity<GenericErrorResponse> response = handler.handleInvalidEngagement(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody().error()).contains("future");
    }

    @Test
    @DisplayName("handleIllegalState – returns 422 for unconfirmed attendee")
    void handleIllegalState_returns422() {
        IllegalStateException ex = new IllegalStateException("Attendee must be confirmed or checked-in");

        ResponseEntity<GenericErrorResponse> response = handler.handleIllegalState(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNPROCESSABLE_ENTITY);
        assertThat(response.getBody().error()).contains("checked-in");
    }

    @Test
    @DisplayName("handleIllegalArgument – returns 400 for invalid rating")
    void handleIllegalArgument_returns400() {
        IllegalArgumentException ex = new IllegalArgumentException("Rating must be between 1 and 5");

        ResponseEntity<GenericErrorResponse> response = handler.handleIllegalArgument(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody().error()).contains("Rating");
    }

    // ─── SECURITY ────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("handleAuthorizationDenied – returns 403")
    void handleAuthorizationDenied_returns403() {
        AuthorizationDeniedException ex = mock(AuthorizationDeniedException.class);
        when(ex.getMessage()).thenReturn("Access is denied");

        ResponseEntity<GenericErrorResponse> response = handler.handleAuthorizationDenied(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(response.getBody().error()).isEqualTo("Access is denied");
    }

    // ─── FALLBACK ────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("handleUnexpected – returns 500 with traceId in error message")
    void handleUnexpected_returns500WithTraceId() {
        Exception ex = new RuntimeException("Unexpected database error");

        ResponseEntity<GenericErrorResponse> response = handler.handleUnexpected(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody().error()).contains("traceId");
    }

    @Test
    @DisplayName("handleUnexpected – generates unique traceId per invocation")
    void handleUnexpected_generatesUniqueTraceId() {
        Exception ex = new RuntimeException("error");

        ResponseEntity<GenericErrorResponse> first  = handler.handleUnexpected(ex);
        ResponseEntity<GenericErrorResponse> second = handler.handleUnexpected(ex);

        assertThat(first.getBody().error()).isNotEqualTo(second.getBody().error());
    }
}
