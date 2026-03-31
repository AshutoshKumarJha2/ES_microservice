package com.cts.eventsphere.eventmanager.auth.service;

import com.cts.eventsphere.eventmanager.auth.client.IAMClient;
import com.cts.eventsphere.eventmanager.auth.dto.UserPrincipal;
import com.cts.eventsphere.eventmanager.auth.dto.ValidateResponse;
import feign.FeignException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
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

    @Mock private IAMClient iamClient;
    @InjectMocks private AuthService authService;

    private static final String BEARER_TOKEN = "Bearer valid.jwt.token";

    // -------------------------------------------------------------------------
    // validate – missing / malformed header
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("validate – missing or non-Bearer header")
    class InvalidHeader {

        @Test
        @DisplayName("throws 401 when Authorization header is null")
        void validate_nullHeader_throws401() {
            assertThatThrownBy(() -> authService.validate(null))
                    .isInstanceOf(ResponseStatusException.class)
                    .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                    .isEqualTo(HttpStatus.UNAUTHORIZED);
        }

        @Test
        @DisplayName("throws 401 when Authorization header does not start with 'Bearer '")
        void validate_basicHeader_throws401() {
            assertThatThrownBy(() -> authService.validate("Basic dXNlcjpwYXNz"))
                    .isInstanceOf(ResponseStatusException.class)
                    .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                    .isEqualTo(HttpStatus.UNAUTHORIZED);
        }
    }

    // -------------------------------------------------------------------------
    // validate – happy path
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("validate – happy path")
    class HappyPath {

        @Test
        @DisplayName("returns UserPrincipal when IAM responds 200 OK with valid body")
        void validate_happyPath_returnsUserPrincipal() {
            ValidateResponse body = new ValidateResponse();
            body.setUserId("user-001");
            body.setUserRole("ORGANIZER");

            when(iamClient.validate(BEARER_TOKEN))
                    .thenReturn(ResponseEntity.ok(body));

            UserPrincipal principal = authService.validate(BEARER_TOKEN);

            assertThat(principal.userId()).isEqualTo("user-001");
            assertThat(principal.role()).isEqualTo("ORGANIZER");
            assertThat(principal.authorities()).hasSize(1);
            assertThat(principal.authorities().iterator().next().getAuthority())
                    .isEqualTo("ROLE_ORGANIZER");
        }
    }

    // -------------------------------------------------------------------------
    // validate – non-200 / null body
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("validate – non-OK or empty response")
    class NonOkResponse {

        @Test
        @DisplayName("throws 401 when IAM returns non-OK status")
        void validate_nonOkStatus_throws401() {
            when(iamClient.validate(BEARER_TOKEN))
                    .thenReturn(ResponseEntity.status(HttpStatus.FORBIDDEN).build());

            assertThatThrownBy(() -> authService.validate(BEARER_TOKEN))
                    .isInstanceOf(ResponseStatusException.class)
                    .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                    .isEqualTo(HttpStatus.UNAUTHORIZED);
        }

        @Test
        @DisplayName("throws 401 when IAM returns 200 but null body")
        void validate_nullBody_throws401() {
            when(iamClient.validate(BEARER_TOKEN))
                    .thenReturn(ResponseEntity.ok(null));

            assertThatThrownBy(() -> authService.validate(BEARER_TOKEN))
                    .isInstanceOf(ResponseStatusException.class)
                    .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                    .isEqualTo(HttpStatus.UNAUTHORIZED);
        }
    }

    // -------------------------------------------------------------------------
    // validate – Feign exceptions
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("validate – Feign exceptions from IAM")
    class FeignExceptions {

        @Test
        @DisplayName("throws 401 when IAM rejects with FeignException.Unauthorized")
        void validate_feignUnauthorized_throws401() {
            FeignException.Unauthorized unauthorized = mock(FeignException.Unauthorized.class);
            when(iamClient.validate(BEARER_TOKEN)).thenThrow(unauthorized);

            assertThatThrownBy(() -> authService.validate(BEARER_TOKEN))
                    .isInstanceOf(ResponseStatusException.class)
                    .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                    .isEqualTo(HttpStatus.UNAUTHORIZED);
        }

        @Test
        @DisplayName("throws 401 when IAM rejects with FeignException.Forbidden")
        void validate_feignForbidden_throws401() {
            FeignException.Forbidden forbidden = mock(FeignException.Forbidden.class);
            when(iamClient.validate(BEARER_TOKEN)).thenThrow(forbidden);

            assertThatThrownBy(() -> authService.validate(BEARER_TOKEN))
                    .isInstanceOf(ResponseStatusException.class)
                    .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                    .isEqualTo(HttpStatus.UNAUTHORIZED);
        }
    }
}
