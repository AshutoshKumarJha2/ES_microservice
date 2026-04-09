package com.eventsphere.engagement_manager.auth.filter;

import com.eventsphere.engagement_manager.auth.dto.UserPrincipal;
import com.eventsphere.engagement_manager.auth.service.ServiceTokenValidator;
import com.eventsphere.engagement_manager.auth.service.UserTokenValidator;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
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

    private MockHttpServletRequest request;
    private MockHttpServletResponse response;
    private FilterChain filterChain;

    @BeforeEach
    void setUp() {
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
        filterChain = mock(FilterChain.class);
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("no Authorization header – skips auth and passes request to chain")
    void doFilter_noHeader_skipsAndContinues() throws Exception {
        jwtAuthFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verifyNoInteractions(userTokenValidator, serviceTokenValidator);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    @DisplayName("non-Bearer Authorization header – skips auth and passes request to chain")
    void doFilter_nonBearerHeader_skipsAndContinues() throws Exception {
        request.addHeader("Authorization", "Basic dXNlcjpwYXNz");

        jwtAuthFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verifyNoInteractions(userTokenValidator, serviceTokenValidator);
    }

    @Test
    @DisplayName("valid Bearer token – sets authentication in SecurityContext")
    void doFilter_validToken_setsSecurityContext() throws Exception {
        request.addHeader("Authorization", "Bearer valid-token");
        UserPrincipal principal = new UserPrincipal(
                "user-001", "ATTENDEE",
                List.of(new SimpleGrantedAuthority("ROLE_ATTENDEE")));
        when(userTokenValidator.validate("valid-token")).thenReturn(principal);

        jwtAuthFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .isEqualTo(principal);
    }

    @Test
    @DisplayName("ResponseStatusException from validator – continues chain with empty SecurityContext")
    void doFilter_responseStatusException_continuesChainWithEmptyContext() throws Exception {
        request.addHeader("Authorization", "Bearer bad-token");
        when(userTokenValidator.validate(any()))
                .thenThrow(new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token"));

        jwtAuthFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    @DisplayName("unexpected RuntimeException from validator – returns 503 and stops chain")
    void doFilter_unexpectedException_returns503AndStopsChain() throws Exception {
        request.addHeader("Authorization", "Bearer token");
        when(userTokenValidator.validate(any())).thenThrow(new RuntimeException("Key provider unreachable"));

        jwtAuthFilter.doFilterInternal(request, response, filterChain);

        assertThat(response.getStatus()).isEqualTo(503);
        assertThat(response.getContentAsString()).contains("unavailable");
        verify(filterChain, never()).doFilter(any(), any());
    }
}
