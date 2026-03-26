package com.cts.eventsphere.eventmanager.security;

import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

/**
 * Represents the authenticated user's principal information including their ID, email, role,
 * and granted authorities. Used in the security context for authentication and authorization.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-26
 */
public record UserPrincipal(
        String userId,
        String email,
        String role,
        Collection<? extends GrantedAuthority> authorities
) {
}
