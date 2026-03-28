package com.cts.eventsphere.iamservice.security;

import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

/**
 * Immutable security principal representing an authenticated user within the Spring Security context.
 *
 * <p>Instances are created by {@link JwtUtil#extractUserPrincipal} after a valid JWT is parsed,
 * and are stored in the {@link org.springframework.security.core.context.SecurityContext} by
 * {@link JwtFilter}. Controllers can inject the current principal via
 * {@code @AuthenticationPrincipal UserPrincipal}.</p>
 *
 * @param userId      the unique identifier of the authenticated user (UUID string)
 * @param role        the raw role name (e.g. {@code "ADMIN"}, {@code "ATTENDEE"})
 * @param authorities the Spring Security granted authorities derived from {@code role}
 *                    (prefixed with {@code "ROLE_"})
 *
 * @author 2480010
 * @version 1.0
 * @since 25-03-2026
 */
public record UserPrincipal(
        String userId,
        String role,
        Collection<? extends GrantedAuthority> authorities
)
{}
