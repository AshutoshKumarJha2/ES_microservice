package com.cts.eventsphere.vendormanager.auth.service;

import com.cts.eventsphere.vendormanager.auth.client.IAMClient;
import com.cts.eventsphere.vendormanager.auth.dto.UserPrincipal;
import com.cts.eventsphere.vendormanager.auth.dto.ValidateResponse;
import feign.FeignException;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private IAMClient iamClient;

    @InjectMocks
    private AuthService authService;

    @Test
    void validate_nullHeader_throws401() {
        assertThatThrownBy(() -> authService.validate(null))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void validate_nonBearerHeader_throws401() {
        assertThatThrownBy(() -> authService.validate("Basic dXNlcjpwYXNz"))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void validate_iamReturnsNonOkStatus_throws401() {
        when(iamClient.validate("Bearer token"))
                .thenReturn(ResponseEntity.status(HttpStatus.FORBIDDEN).build());

        assertThatThrownBy(() -> authService.validate("Bearer token"))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void validate_iamReturnsNullBody_throws401() {
        when(iamClient.validate("Bearer token"))
                .thenReturn(ResponseEntity.ok(null));

        assertThatThrownBy(() -> authService.validate("Bearer token"))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void validate_validToken_returnsUserPrincipal() {
        ValidateResponse vr = new ValidateResponse();
        vr.setUserId("u-1");
        vr.setUserRole("ORGANIZER");
        when(iamClient.validate("Bearer valid-token"))
                .thenReturn(ResponseEntity.ok(vr));

        UserPrincipal result = authService.validate("Bearer valid-token");

        assertThat(result.userId()).isEqualTo("u-1");
        assertThat(result.role()).isEqualTo("ORGANIZER");
        assertThat(result.authorities()).hasSize(1);
    }

    @Test
    void validate_feignUnauthorized_throws401() {
        when(iamClient.validate(any())).thenThrow(mock(FeignException.Unauthorized.class));

        assertThatThrownBy(() -> authService.validate("Bearer token"))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void validate_feignForbidden_throws401() {
        when(iamClient.validate(any())).thenThrow(mock(FeignException.Forbidden.class));

        assertThatThrownBy(() -> authService.validate("Bearer token"))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.UNAUTHORIZED);
    }
}
