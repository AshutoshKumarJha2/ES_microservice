package com.cts.eventsphere.eventmanager.auth.filter;

import com.cts.eventsphere.eventmanager.auth.dto.UserPrincipal;
import com.cts.eventsphere.eventmanager.auth.service.ServiceTokenValidator;
import com.cts.eventsphere.eventmanager.auth.service.UserTokenValidator;
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

    @Mock private UserTokenValidator userTokenValidator;
    @Mock private ServiceTokenValidator serviceTokenValidator;
    @InjectMocks private JwtAuthFilter jwtAuthFilter;

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    // -------------------------------------------------------------------------
    // No / non-bearer Authorization header → skip filter
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
            verifyNoInteractions(userTokenValidator, serviceTokenValidator);
            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        }

        @Test
        @DisplayName("passes request through when Authorization header does not start with 'Bearer '")
        void basicHeader_passesThrough() throws Exception {
            MockHttpServletRequest  request  = new MockHttpServletRequest();
            MockHttpServletResponse response = new MockHttpServletResponse();
            FilterChain             chain    = mock(FilterChain.class);
            request.addHeader("Authorization", "Basic dXNlcjpwYXNz");

            jwtAuthFilter.doFilter(request, response, chain);

            verify(chain).doFilter(request, response);
            verifyNoInteractions(userTokenValidator, serviceTokenValidator);
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
            MockHttpServletRequest  request  = new MockHttpServletRequest();
            MockHttpServletResponse response = new MockHttpServletResponse();
            FilterChain             chain    = mock(FilterChain.class);
            request.addHeader("Authorization", "Bearer valid.jwt.token");

            var principal = new UserPrincipal("user-001", "ORGANIZER",
                    List.of(new SimpleGrantedAuthority("ROLE_ORGANIZER")));
            when(userTokenValidator.validate("valid.jwt.token")).thenReturn(principal);

            jwtAuthFilter.doFilter(request, response, chain);

            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
            assertThat(SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                    .isEqualTo(principal);
            verify(chain).doFilter(request, response);
        }
    }

    // -------------------------------------------------------------------------
    // ResponseStatusException from validator → continue chain (empty context)
    // -------------------------------------------------------------------------
    @Nested
    @DisplayName("ResponseStatusException – security context stays empty, chain continues")
    class TokenRejected {

        @Test
        @DisplayName("continues filter chain when token validation fails with ResponseStatusException")
        void responseStatusException_continuesChain() throws Exception {
            MockHttpServletRequest  request  = new MockHttpServletRequest();
            MockHttpServletResponse response = new MockHttpServletResponse();
            FilterChain             chain    = mock(FilterChain.class);
            request.addHeader("Authorization", "Bearer invalid.token");

            when(userTokenValidator.validate(any()))
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
        @DisplayName("returns 503 when validator throws an unexpected exception")
        void unexpectedException_returns503() throws Exception {
            MockHttpServletRequest  request  = new MockHttpServletRequest();
            MockHttpServletResponse response = new MockHttpServletResponse();
            FilterChain             chain    = mock(FilterChain.class);
            request.addHeader("Authorization", "Bearer some.token");

            when(userTokenValidator.validate(any()))
                    .thenThrow(new RuntimeException("Key provider unreachable"));

            jwtAuthFilter.doFilter(request, response, chain);

            assertThat(response.getStatus()).isEqualTo(503);
            verify(chain, never()).doFilter(any(), any());
        }
    }
}