package com.cts.eventsphere.eventmanager.dto.user;

import lombok.Builder;

/**
 * Represents a user's profile as returned by the auth-manager service.
 *
 * <p>Used to enrich registration responses with attendee information.
 * Role and status are represented as {@link String} to avoid coupling
 * to auth-manager's internal enums.</p>
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-04-15
 */
@Builder
public record UserDetailsDto(
        String userId,
        String name,
        String email,
        String phone,
        String role,
        String status
) {}
