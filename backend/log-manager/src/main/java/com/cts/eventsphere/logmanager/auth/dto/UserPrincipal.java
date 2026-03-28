package com.cts.eventsphere.logmanager.auth.dto;

import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

/**
 * Immutable representation of an authenticated user, populated after a successful
 * token validation via {@code AuthService} and stored in the {@code SecurityContext}.
 *
 * @author 2479623
 * @version 1.0
 * @since 27-03-2026
 */
public record UserPrincipal(
        String userId,
        String role,
        Collection<? extends GrantedAuthority> authorities
)
{}
