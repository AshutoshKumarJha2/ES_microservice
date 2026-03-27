package com.cts.eventsphere.eventmanager.dto.registration;

import jakarta.validation.constraints.NotNull;

/**
 * Request DTO for registering an attendee for an event.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-26
 */

public record RegistrationRequestDto(
        @NotNull(message = "Ticket id is required")
        String ticketId
) {
}
