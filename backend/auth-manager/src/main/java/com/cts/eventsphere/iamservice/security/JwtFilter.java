package com.cts.eventsphere.iamservice.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Servlet filter that intercepts every incoming HTTP request to extract and validate a JWT.
 *
 * <p>Extends {@link OncePerRequestFilter} to guarantee single execution per request.
 * On detecting a {@code "Bearer "} prefix in the {@code Authorization} header, the filter:
 * <ol>
 *   <li>Uses {@link JwtUtil#extractUserPrincipal} to parse and validate the token,
 *       selecting {@link TokenType#REFRESH} for the {@code /api/v1/auth/refresh} path
 *       and {@link TokenType#ACCESS} for all other paths.</li>
 *   <li>Creates a {@link org.springframework.security.authentication.UsernamePasswordAuthenticationToken}
 *       and stores it in the {@link org.springframework.security.core.context.SecurityContext}.</li>
 * </ol>
 * </p>
 *
 * <p>If the token is absent, invalid, or expired, the security context is cleared and the
 * request proceeds unauthenticated — downstream access-control rules then apply.</p>
 *
 * @author 2480010
 * @version 1.0
 * @since 25-03-2026
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;

    /**
     * Extracts the JWT from the {@code Authorization} header and populates the
     * {@link org.springframework.security.core.context.SecurityContext} if the token is valid.
     *
     * @param request     the incoming HTTP servlet request
     * @param response    the HTTP servlet response
     * @param filterChain the remaining filter chain to invoke after processing
     * @throws ServletException if a servlet error occurs
     * @throws IOException      if an I/O error occurs during filter processing
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                UserPrincipal principal;
                if (request.getServletPath().equals("/api/v1/auth/refresh")) {
                    principal = jwtUtil.extractUserPrincipal(token, TokenType.REFRESH);
                } else {
                    principal = jwtUtil.extractUserPrincipal(token, TokenType.ACCESS);
                }
                log.info("Extracted jwt for user {} with role {}", principal.userId(), principal.authorities());
                var authToken = new UsernamePasswordAuthenticationToken(
                        principal, null,principal.authorities());
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        } catch (Exception e){
            logger.error(e.getMessage());
            SecurityContextHolder.clearContext();
        }
        filterChain.doFilter(request,response);
    }
}
