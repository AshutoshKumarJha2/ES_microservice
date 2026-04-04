package com.cts.eventsphere.iamservice.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link JwtFilter}.
 *
 * <p>Directly invokes the protected {@code doFilterInternal} method (same package)
 * to test all branching paths: no header, non-Bearer header, access-token path,
 * refresh-token path, and exception handling.</p>
 *
 * @author 2480010
 * @version 1.0
 * @since 25-03-2026
 */
@ExtendWith(MockitoExtension.class)
class JwtFilterTest {

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @InjectMocks
    private JwtFilter jwtFilter;

    @BeforeEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    // ─── No / Non-Bearer Authorization header ─────────────────────────────────

    @Test
    void doFilterInternal_WithNoAuthorizationHeader_ShouldNotSetAuthenticationAndContinueChain() throws Exception {
        when(request.getHeader("Authorization")).thenReturn(null);

        jwtFilter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilterInternal_WithNonBearerHeader_ShouldNotSetAuthenticationAndContinueChain() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Basic dXNlcjpwYXNz");

        jwtFilter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }

    // ─── Access-token path ────────────────────────────────────────────────────

    @Test
    void doFilterInternal_WithValidBearerAccessToken_ShouldSetAuthenticationInContext() throws Exception {
        UserPrincipal principal = new UserPrincipal("user-1", "ADMIN",
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
        when(request.getHeader("Authorization")).thenReturn("Bearer valid.access.token");
        when(request.getServletPath()).thenReturn("/users");
        when(jwtUtil.extractUserPrincipal("valid.access.token", TokenType.ACCESS)).thenReturn(principal);

        jwtFilter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .isEqualTo(principal);
        verify(filterChain).doFilter(request, response);
    }

    // ─── Refresh-token path ───────────────────────────────────────────────────

    @Test
    void doFilterInternal_OnRefreshPath_WithValidBearerToken_ShouldUseRefreshTokenType() throws Exception {
        UserPrincipal principal = new UserPrincipal("user-1", "ATTENDEE",
                List.of(new SimpleGrantedAuthority("ROLE_ATTENDEE")));
        when(request.getHeader("Authorization")).thenReturn("Bearer valid.refresh.token");
        when(request.getServletPath()).thenReturn("/auth/refresh");
        when(jwtUtil.extractUserPrincipal("valid.refresh.token", TokenType.REFRESH)).thenReturn(principal);

        jwtFilter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .isEqualTo(principal);
        verify(filterChain).doFilter(request, response);
    }

    // ─── Exception handling ───────────────────────────────────────────────────

    @Test
    void doFilterInternal_WhenJwtUtilThrows_ShouldClearContextAndContinueChain() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer malformed.token");
        when(request.getServletPath()).thenReturn("/users");
        when(jwtUtil.extractUserPrincipal("malformed.token", TokenType.ACCESS))
                .thenThrow(new RuntimeException("JWT parse failed"));

        jwtFilter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }
}
