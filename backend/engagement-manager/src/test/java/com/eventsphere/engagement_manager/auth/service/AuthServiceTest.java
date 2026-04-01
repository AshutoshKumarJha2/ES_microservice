package com.eventsphere.engagement_manager.auth.service;

import com.eventsphere.engagement_manager.auth.client.IAMClient;
import com.eventsphere.engagement_manager.auth.dto.UserPrincipal;
import com.eventsphere.engagement_manager.auth.dto.ValidateResponse;
import feign.FeignException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private IAMClient iamClient;
    @InjectMocks private AuthService authService;

    @Test
    @DisplayName("null header – throws 401 ResponseStatusException")
    void validate_nullHeader_throws401() {
        assertThatThrownBy(() -> authService.validate(null))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @DisplayName("non-Bearer header – throws 401 ResponseStatusException")
    void validate_nonBearerHeader_throws401() {
        assertThatThrownBy(() -> authService.validate("Basic dXNlcjpwYXNz"))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @DisplayName("happy path – valid Bearer token returns UserPrincipal with correct fields")
    void validate_validToken_returnsUserPrincipal() {
        ValidateResponse body = new ValidateResponse();
        body.setUserId("user-001");
        body.setUserRole("ATTENDEE");
        when(iamClient.validate("Bearer valid-token")).thenReturn(ResponseEntity.ok(body));

        UserPrincipal principal = authService.validate("Bearer valid-token");

        assertThat(principal.userId()).isEqualTo("user-001");
        assertThat(principal.role()).isEqualTo("ATTENDEE");
        assertThat(principal.authorities()).hasSize(1);
        assertThat(principal.authorities().iterator().next().getAuthority()).isEqualTo("ROLE_ATTENDEE");
    }

    @Test
    @DisplayName("happy path – ORGANIZER role returns correct authority")
    void validate_organizerRole_returnsCorrectAuthority() {
        ValidateResponse body = new ValidateResponse();
        body.setUserId("user-002");
        body.setUserRole("ORGANIZER");
        when(iamClient.validate("Bearer organizer-token")).thenReturn(ResponseEntity.ok(body));

        UserPrincipal principal = authService.validate("Bearer organizer-token");

        assertThat(principal.authorities().iterator().next().getAuthority()).isEqualTo("ROLE_ORGANIZER");
    }

    @Test
    @DisplayName("non-OK status from IAM – throws 401 ResponseStatusException")
    void validate_nonOkStatus_throws401() {
        when(iamClient.validate(any()))
                .thenReturn(ResponseEntity.status(HttpStatus.FORBIDDEN).body(null));

        assertThatThrownBy(() -> authService.validate("Bearer token"))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @DisplayName("null body from IAM – throws 401 ResponseStatusException")
    void validate_nullBody_throws401() {
        when(iamClient.validate(any())).thenReturn(ResponseEntity.ok(null));

        assertThatThrownBy(() -> authService.validate("Bearer token"))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @DisplayName("FeignException.Unauthorized from IAM – throws 401 ResponseStatusException")
    void validate_feignUnauthorized_throws401() {
        FeignException.Unauthorized ex = mock(FeignException.Unauthorized.class);
        when(iamClient.validate(any())).thenThrow(ex);

        assertThatThrownBy(() -> authService.validate("Bearer expired-token"))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @DisplayName("FeignException.Forbidden from IAM – throws 401 ResponseStatusException")
    void validate_feignForbidden_throws401() {
        FeignException.Forbidden ex = mock(FeignException.Forbidden.class);
        when(iamClient.validate(any())).thenThrow(ex);

        assertThatThrownBy(() -> authService.validate("Bearer forbidden-token"))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.UNAUTHORIZED);
    }
}
