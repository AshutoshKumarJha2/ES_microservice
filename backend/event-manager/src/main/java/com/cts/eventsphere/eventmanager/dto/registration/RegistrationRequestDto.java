package com.cts.eventsphere.eventmanager.dto.registration;

import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for registering an attendee for an event.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-26
 */
public record RegistrationRequestDto(

        @NotBlank(message = "Ticket ID must not be blank")
        String ticketId

) {
}