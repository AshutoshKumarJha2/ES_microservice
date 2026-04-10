package com.cts.eventsphere.logmanager.auth.filter;

import com.cts.eventsphere.logmanager.auth.dto.UserPrincipal;
import com.cts.eventsphere.logmanager.auth.service.ServiceTokenValidator;
import com.cts.eventsphere.logmanager.auth.service.UserTokenValidator;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.Base64;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthFilter extends OncePerRequestFilter {

    private final UserTokenValidator userTokenValidator;
    private final ServiceTokenValidator serviceTokenValidator;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String token = authHeader.substring(7);
            UserPrincipal principal = isServiceToken(token)
                    ? serviceTokenValidator.validate(token)
                    : userTokenValidator.validate(token);

            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(
                            principal, null, principal.authorities());

            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);

        } catch (ResponseStatusException e) {
            log.error("Token validation failed: {}", e.getReason());
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
            response.getWriter().write("Authentication service unavailable");
            log.error(e.getMessage());
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean isServiceToken(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) return false;
            String payload = new String(Base64.getUrlDecoder().decode(parts[1]));
            return payload.contains("\"type\":\"SERVICE\"");
        } catch (Exception e) {
            return false;
        }
    }
}
