package com.cts.ticketmanager.dto.registration;

import jakarta.validation.constraints.NotNull;

/**
 * DTO object for creating registration request
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-03-05
 */
public record RegistrationRequestDTO(
        @NotNull(message = "Ticket id is requred")
        String ticketId
    ) {
}
