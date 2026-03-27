package com.cts.eventsphere.expensemanager.auth.dto;

import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

/**
 * [Detailed description of the class's responsibility]
 * * @author 2480010
 *
 * @version 1.0
 * @since 25-03-2026
 */
public record UserPrincipal(
        String userId,
        String role,
        Collection<? extends GrantedAuthority> authorities
)
{}
