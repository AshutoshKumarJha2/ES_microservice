package com.cts.eventsphere.logmanager.auth.filter;

import com.cts.eventsphere.logmanager.auth.dto.UserPrincipal;
import com.cts.eventsphere.logmanager.auth.service.AuthService;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthFilterTest {

    @Mock private AuthService authService;
    @InjectMocks private JwtAuthFilter jwtAuthFilter;

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    // -------------------------------------------------------------------------
    // No / non-bearer header → filter skipped
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("Missing or non-Bearer header – filter is skipped")
    class SkipFilter {

        @Test
        @DisplayName("passes request through when no Authorization header is present")
        void noHeader_passesThrough() throws Exception {
            MockHttpServletRequest  request  = new MockHttpServletRequest();
            MockHttpServletResponse response = new MockHttpServletResponse();
            FilterChain             chain    = mock(FilterChain.class);

            jwtAuthFilter.doFilter(request, response, chain);

            verify(chain).doFilter(request, response);
            verifyNoInteractions(authService);
            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        }

        @Test
        @DisplayName("passes request through when header is not Bearer")
        void basicHeader_passesThrough() throws Exception {
            MockHttpServletRequest  request  = new MockHttpServletRequest();
            MockHttpServletResponse response = new MockHttpServletResponse();
            FilterChain             chain    = mock(FilterChain.class);
            request.addHeader("Authorization", "Basic dXNlcjpwYXNz");

            jwtAuthFilter.doFilter(request, response, chain);

            verify(chain).doFilter(request, response);
            verifyNoInteractions(authService);
        }
    }

    // -------------------------------------------------------------------------
    // Valid token → SecurityContext populated
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("Valid Bearer token – SecurityContext is populated")
    class ValidToken {

        @Test
        @DisplayName("sets authentication in SecurityContext and continues filter chain")
        void validToken_setsAuthentication() throws Exception {
            String bearerToken = "Bearer valid.jwt.token";
            MockHttpServletRequest  request  = new MockHttpServletRequest();
            MockHttpServletResponse response = new MockHttpServletResponse();
            FilterChain             chain    = mock(FilterChain.class);
            request.addHeader("Authorization", bearerToken);

            var principal = new UserPrincipal("user-001", "ADMIN",
                    List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
            when(authService.validate(bearerToken)).thenReturn(principal);

            jwtAuthFilter.doFilter(request, response, chain);

            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
            assertThat(SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                    .isEqualTo(principal);
            verify(chain).doFilter(request, response);
        }
    }

    // -------------------------------------------------------------------------
    // ResponseStatusException → continue chain, context empty
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("ResponseStatusException – security context stays empty, chain continues")
    class TokenRejected {

        @Test
        @DisplayName("continues filter chain when token validation fails with ResponseStatusException")
        void responseStatusException_continuesChain() throws Exception {
            String bearerToken = "Bearer invalid.token";
            MockHttpServletRequest  request  = new MockHttpServletRequest();
            MockHttpServletResponse response = new MockHttpServletResponse();
            FilterChain             chain    = mock(FilterChain.class);
            request.addHeader("Authorization", bearerToken);

            when(authService.validate(bearerToken))
                    .thenThrow(new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token rejected"));

            jwtAuthFilter.doFilter(request, response, chain);

            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
            verify(chain).doFilter(request, response);
        }
    }

    // -------------------------------------------------------------------------
    // Unexpected Exception → 503, chain not called
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("Unexpected Exception – responds 503 and does not continue chain")
    class ServiceUnavailable {

        @Test
        @DisplayName("returns 503 and does not call filterChain when AuthService throws unexpectedly")
        void unexpectedException_returns503() throws Exception {
            String bearerToken = "Bearer some.token";
            MockHttpServletRequest  request  = new MockHttpServletRequest();
            MockHttpServletResponse response = new MockHttpServletResponse();
            FilterChain             chain    = mock(FilterChain.class);
            request.addHeader("Authorization", bearerToken);

            when(authService.validate(bearerToken))
                    .thenThrow(new RuntimeException("IAM service unreachable"));

            jwtAuthFilter.doFilter(request, response, chain);

            assertThat(response.getStatus()).isEqualTo(503);
            verify(chain, never()).doFilter(any(), any());
        }
    }
}
