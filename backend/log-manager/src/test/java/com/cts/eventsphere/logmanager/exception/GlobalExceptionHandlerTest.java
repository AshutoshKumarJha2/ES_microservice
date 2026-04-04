package com.cts.eventsphere.logmanager.exception;

import com.cts.eventsphere.logmanager.dto.shared.GenericErrorResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    // -------------------------------------------------------------------------
    // handleValidationException
    // -------------------------------------------------------------------------
    @Test
    @DisplayName("handleValidationException – returns 400 with field-to-message map")
    void handleValidationException_returns400WithFieldErrors() {
        FieldError fieldError = new FieldError("dto", "userId", "must not be blank");
        BindingResult bindingResult = mock(BindingResult.class);
        when(bindingResult.getFieldErrors()).thenReturn(List.of(fieldError));

        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        when(ex.getBindingResult()).thenReturn(bindingResult);

        ResponseEntity<Map<String, String>> response = handler.handleValidationException(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).containsEntry("userId", "must not be blank");
    }

    @Test
    @DisplayName("handleValidationException – returns 400 with multiple field errors")
    void handleValidationException_multipleErrors_returnsAllFields() {
        FieldError error1 = new FieldError("dto", "userId", "must not be blank");
        FieldError error2 = new FieldError("dto", "entityName", "must not be null");
        BindingResult bindingResult = mock(BindingResult.class);
        when(bindingResult.getFieldErrors()).thenReturn(List.of(error1, error2));

        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        when(ex.getBindingResult()).thenReturn(bindingResult);

        ResponseEntity<Map<String, String>> response = handler.handleValidationException(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody())
                .containsEntry("userId", "must not be blank")
                .containsEntry("entityName", "must not be null");
    }

    // -------------------------------------------------------------------------
    // handleUnexpectedExceptions
    // -------------------------------------------------------------------------
    @Test
    @DisplayName("handleUnexpectedExceptions – returns 500 with traceId in error message")
    void handleUnexpected_returns500WithTraceId() {
        RuntimeException ex = new RuntimeException("database connection lost");

        ResponseEntity<GenericErrorResponse> response = handler.handleUnexpectedExceptions(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().error()).contains("traceId");
    }

    @Test
    @DisplayName("handleUnexpectedExceptions – generates a unique traceId per call")
    void handleUnexpected_generatesUniqueTraceId() {
        Exception ex = new Exception("error");

        ResponseEntity<GenericErrorResponse> first  = handler.handleUnexpectedExceptions(ex);
        ResponseEntity<GenericErrorResponse> second = handler.handleUnexpectedExceptions(ex);

        assertThat(first.getBody().error()).isNotEqualTo(second.getBody().error());
    }
}
