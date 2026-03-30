package com.cts.eventsphere.expensemanager.exception;

import com.cts.eventsphere.expensemanager.auth.dto.UserPrincipal;
import com.cts.eventsphere.expensemanager.service.AuditService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mapping.PropertyReferenceException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {

    @Mock
    private AuditService auditService;

    @InjectMocks
    private GlobalExceptionHandler handler;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    private HttpServletRequest mockRequest(String method, String uri) {
        HttpServletRequest request = mock(HttpServletRequest.class);
        lenient().when(request.getMethod()).thenReturn(method);
        lenient().when(request.getRequestURI()).thenReturn(uri);
        return request;
    }

    @Test
    void handleBudgetNotFound_returns404() {
        HttpServletRequest request = mockRequest("GET", "/events/e1/budget");
        BudgetNotFoundException ex = new BudgetNotFoundException("event-1");

        ResponseEntity<Map<String, Object>> response = handler.handleBudgetNotFound(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).containsKey("message");
    }

    @Test
    void handleExpenseNotFound_returns404() {
        HttpServletRequest request = mockRequest("GET", "/expenses/exp-1");
        ExpenseNotFoundException ex = new ExpenseNotFoundException("expense-1");

        ResponseEntity<Map<String, Object>> response = handler.handleExpenseNotFound(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).containsKey("message");
    }

    @Test
    void handleBudgetAlreadyExists_returns409() {
        HttpServletRequest request = mockRequest("POST", "/events/e1/budget");
        BudgetAlreadyExistsException ex = new BudgetAlreadyExistsException("event-1");

        ResponseEntity<Map<String, Object>> response = handler.handleBudgetAlreadyExists(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).containsKey("message");
    }

    @Test
    void handleEventServiceException_notFound_returns404() {
        HttpServletRequest request = mockRequest("GET", "/events/e1");
        EventServiceException ex = new EventServiceException("Event not found: e1");

        ResponseEntity<Map<String, Object>> response = handler.handleEventServiceException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void handleEventServiceException_serviceUnavailable_returns503() {
        HttpServletRequest request = mockRequest("GET", "/events/e1");
        EventServiceException ex = new EventServiceException("Event service is unavailable");

        ResponseEntity<Map<String, Object>> response = handler.handleEventServiceException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
    }

    @Test
    void handleAccessDenied_returns403() {
        HttpServletRequest request = mockRequest("DELETE", "/expenses/exp-1");
        AccessDeniedException ex = new AccessDeniedException("Forbidden");

        ResponseEntity<Map<String, Object>> response = handler.handleAccessDenied(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(response.getBody()).containsEntry("message", "Access denied");
    }

    @Test
    void handleValidationErrors_returns400() {
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "dto");
        bindingResult.addError(new org.springframework.validation.FieldError("dto", "amount", "must not be null"));
        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        when(ex.getBindingResult()).thenReturn(bindingResult);

        ResponseEntity<Map<String, Object>> response = handler.handleValidationErrors(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).containsKey("messages");
    }

    @Test
    void handleInvalidSortProperty_returns400() {
        PropertyReferenceException ex = mock(PropertyReferenceException.class);
        when(ex.getPropertyName()).thenReturn("invalidField");

        ResponseEntity<Map<String, Object>> response = handler.handleInvalidSortProperty(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).containsKey("message");
    }

    @Test
    void handleTypeMismatch_returns400() {
        MethodArgumentTypeMismatchException ex = mock(MethodArgumentTypeMismatchException.class);
        when(ex.getValue()).thenReturn("INVALID");
        when(ex.getName()).thenReturn("status");
        when(ex.getRequiredType()).thenReturn(null);

        ResponseEntity<Map<String, Object>> response = handler.handleTypeMismatch(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).containsKey("message");
    }

    @Test
    void handleGenericException_returns500() {
        Exception ex = new RuntimeException("Unexpected error");

        ResponseEntity<Map<String, Object>> response = handler.handleGenericException(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).containsKey("message");
    }

    @Test
    void resolveUserId_withUserPrincipal_usesUserIdForAudit() {
        SecurityContext sc = mock(SecurityContext.class);
        Authentication auth = mock(Authentication.class);
        UserPrincipal principal = new UserPrincipal("user-xyz", "ORGANIZER", List.of());
        when(sc.getAuthentication()).thenReturn(auth);
        when(auth.getPrincipal()).thenReturn(principal);
        SecurityContextHolder.setContext(sc);

        HttpServletRequest request = mockRequest("GET", "/expenses/e1");
        BudgetNotFoundException ex = new BudgetNotFoundException("event-1");

        ResponseEntity<Map<String, Object>> response = handler.handleBudgetNotFound(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        verify(auditService).logAudit(eq("user-xyz"), any(), anyString(), anyString());
    }

    @Test
    void resolveActionByMethod_put_triggersUpdateAction() {
        HttpServletRequest request = mockRequest("PUT", "/expenses/e1");
        BudgetNotFoundException ex = new BudgetNotFoundException("event-1");

        ResponseEntity<Map<String, Object>> response = handler.handleBudgetNotFound(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        verify(auditService).logAudit(anyString(), any(), anyString(), anyString());
    }

    @Test
    void resolveUserId_withNonUserPrincipal_returnsAnonymous() {
        SecurityContext sc = mock(SecurityContext.class);
        Authentication auth = mock(Authentication.class);
        when(sc.getAuthentication()).thenReturn(auth);
        when(auth.getPrincipal()).thenReturn("string-principal");
        SecurityContextHolder.setContext(sc);

        HttpServletRequest request = mockRequest("GET", "/expenses/e1");
        ExpenseNotFoundException ex = new ExpenseNotFoundException("expense-1");

        ResponseEntity<Map<String, Object>> response = handler.handleExpenseNotFound(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        verify(auditService).logAudit(eq("anonymous"), any(), anyString(), anyString());
    }

    @Test
    void resolveActionByMethod_patch_triggersUpdateAction() {
        HttpServletRequest request = mockRequest("PATCH", "/expenses/e1/status");
        ExpenseNotFoundException ex = new ExpenseNotFoundException("expense-1");

        ResponseEntity<Map<String, Object>> response = handler.handleExpenseNotFound(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        verify(auditService).logAudit(anyString(), any(), anyString(), anyString());
    }

    @Test
    void responseBody_containsTimestampAndStatus() {
        HttpServletRequest request = mockRequest("GET", "/expenses/exp-1");
        ExpenseNotFoundException ex = new ExpenseNotFoundException("expense-1");

        ResponseEntity<Map<String, Object>> response = handler.handleExpenseNotFound(ex, request);

        assertThat(response.getBody()).containsKey("timestamp");
        assertThat(response.getBody()).containsKey("status");
        assertThat(response.getBody()).containsEntry("status", 404);
    }
}
