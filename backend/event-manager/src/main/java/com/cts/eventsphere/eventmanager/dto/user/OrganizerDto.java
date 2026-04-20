package com.cts.eventsphere.eventmanager.dto.user;

import lombok.Builder;

/**
 * Minimal organizer information embedded in event responses.
 *
 * <p>Populated via a {@code UserServiceClient} call when an event is fetched.
 * Intentionally kept small — only the fields needed to display the organizer
 * in the UI without exposing sensitive data.</p>
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-04-20
 */
@Builder
public record OrganizerDto(
        String id,
        String name,
        String email
) {}
