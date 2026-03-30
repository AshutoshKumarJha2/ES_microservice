package com.cts.eventsphere.vendormanager.auth.filter;

import com.cts.eventsphere.vendormanager.auth.dto.UserPrincipal;
import com.cts.eventsphere.vendormanager.auth.service.AuthService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthFilterTest {

    @Mock
    private AuthService authService;

    @InjectMocks
    private JwtAuthFilter jwtAuthFilter;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void doFilter_noAuthHeader_passesThrough() throws Exception {
        when(request.getHeader("Authorization")).thenReturn(null);

        jwtAuthFilter.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verifyNoInteractions(authService);
    }

    @Test
    void doFilter_nonBearerHeader_passesThrough() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Basic dXNlcjpwYXNz");

        jwtAuthFilter.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verifyNoInteractions(authService);
    }

    @Test
    void doFilter_validToken_setsSecurityContextAndContinues() throws Exception {
        UserPrincipal principal = new UserPrincipal("u-1", "ORGANIZER", List.of());
        when(request.getHeader("Authorization")).thenReturn("Bearer valid-token");
        when(authService.validate("Bearer valid-token")).thenReturn(principal);

        jwtAuthFilter.doFilter(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .isEqualTo(principal);
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilter_responseStatusException_continuesWithoutAuthentication() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer expired-token");
        when(authService.validate("Bearer expired-token"))
                .thenThrow(new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token invalid"));

        jwtAuthFilter.doFilter(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilter_genericException_returns503AndStopsChain() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer unreachable-token");
        when(authService.validate("Bearer unreachable-token"))
                .thenThrow(new RuntimeException("IAM unreachable"));
        PrintWriter writer = new PrintWriter(new StringWriter());
        when(response.getWriter()).thenReturn(writer);

        jwtAuthFilter.doFilter(request, response, filterChain);

        verify(response).setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
        verify(filterChain, never()).doFilter(request, response);
    }
}
